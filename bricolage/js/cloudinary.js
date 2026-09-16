/* ============================================================
   SANITAIRE AL HOUDA II — Gestion des images
   ============================================================
   Phase 3 : uniquement la préparation / prévisualisation locale.
   Phase 6 : upload Cloudinary (non signé) + redimensionnement Canvas.
   ============================================================ */

/**
 * Valide un fichier image sélectionné.
 * @return {object|null} { file } si valide, sinon lève une Error.
 */
function validateImageFile(file) {
  var okTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (okTypes.indexOf(file.type) === -1) {
    throw new Error('Format non accepté. Utilisez JPG, PNG ou WEBP.');
  }
  if (file.size > APP_CONFIG.imageMaxBytes) {
    throw new Error('Image trop lourde (max ' + Math.round(APP_CONFIG.imageMaxBytes / (1024 * 1024)) + ' Mo).');
  }
  return { file: file };
}

/**
 * Affiche une prévisualisation locale d'un fichier choisi.
 * @param {File} file      Fichier image
 * @param {HTMLElement} img  L'élément <img> de prévisualisation
 * @return {Promise<string|null>} Résout la dataURL (ou null si non-image)
 */
function previewLocalFile(file, img) {
  return new Promise(function (resolve) {
    if (!file || !file.type || file.type.indexOf('image') !== 0) {
      resolve(null);
      return;
    }
    var reader = new FileReader();
    reader.onload = function (e) {
      img.src = e.target.result;
      resolve(e.target.result);
    };
    reader.onerror = function () { resolve(null); };
    reader.readAsDataURL(file);
  });
}

/* ------- Phase 6 : upload Cloudinary (non signé) ------- */

/**
 * Redimensionne/compresse une image via Canvas
 * (taille max = APP_CONFIG.imageMaxWidth, JPEG q=0.85).
 * Garantit que le fichier envoyé est bien sous les limites
 * Cloudinary (10 Mo / 25 MP) même imposées par le plan gratuit.
 * @param {File} file Fichier d'origine
 * @return {Promise<Blob>} Blob JPEG prêt à envoyer
 */
function prepareImageFile(file) {
  return new Promise(function (resolve, reject) {
    var url = URL.createObjectURL(file);
    var img = new Image();

    img.onload = function () {
      var max = APP_CONFIG.imageMaxWidth;
      var scale = Math.min(1, max / Math.max(img.width, img.height));
      var w = Math.max(1, Math.round(img.width * scale));
      var h = Math.max(1, Math.round(img.height * scale));

      var canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      var ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);

      canvas.toBlob(function (blob) {
        if (!blob) { reject(new Error('Impossible de traiter l\'image.')); return; }
        resolve(blob);
      }, 'image/jpeg', 0.85);
    };

    img.onerror = function () {
      URL.revokeObjectURL(url);
      reject(new Error('Fichier image illisible.'));
    };

    img.src = url;
  });
}

/**
 * Envoie l'image vers Cloudinary (upload NON signé, aucun secret exposé).
 * @param {Blob} blob        Image préparée
 * @param {string} folder    Ex : 'sanitaire-al-houda/products/25'
 * @param {string} publicId  Ex : 'main', 'image2', 'image3'
 * @return {Promise<string>} URL sécurisée de l'image
 */
function uploadToCloudinary(blob, folder, publicId) {
  if (!APP_CONFIG.cloudName || !APP_CONFIG.uploadPreset) {
    return Promise.reject(new Error('CONFIG_CLOUDINARY_MANQUANTE'));
  }

  var data = new FormData();
  data.append('file', blob, publicId + '.jpg');
  data.append('upload_preset', APP_CONFIG.uploadPreset);
  data.append('folder', folder);
  data.append('public_id', publicId);

  var url = 'https://api.cloudinary.com/v1_1/' + APP_CONFIG.cloudName + '/image/upload';

  return fetch(url, { method: 'POST', body: data })
    .then(function (res) { return res.json(); })
    .then(function (json) {
      if (!json || !json.secure_url) {
        var msg = (json && json.error && json.error.message) || 'Échec de l\'envoi vers Cloudinary.';
        throw new Error(msg);
      }
      return json.secure_url;
    });
}

/**
 * Version optimisée d'une URL Cloudinary : insère des paramètres de
 * transformation juste après "/image/upload/" pour livrer un fichier
 * plus léger (bandwidth réduit). Renvoie l'URL inchangée si elle
 * n'est pas une URL Cloudinary (ex : URL collée manuellement).
 * @param {string} url     URL d'origine (secure_url Cloudinary)
 * @param {string} params  Ex : 'w_1200,q_auto,f_auto'
 * @return {string}
 */
function cloudinaryTransform(url, params) {
  url = String(url || '').trim();
  if (!url) return url;

  var marker = '/image/upload/';
  var idx = url.indexOf(marker);
  if (idx === -1) return url;

  // Si une transformation est déjà présente, on ne modifie rien.
  var rest = url.slice(idx + marker.length);
  var firstSeg = (rest.split('/')[0] || '');
  if (firstSeg && firstSeg.indexOf('_') !== -1) return url;

  params = params || 'q_auto,f_auto';
  return url.slice(0, idx + marker.length) + params + '/' + rest;
}