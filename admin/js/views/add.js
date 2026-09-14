/* ============================================================
   SANITAIRE AL HOUDA II — Vue : Ajouter un produit (Phase 10)
   Flux : Ajout sans ID → Upload images sur le vrai ID → Update.
   Pas de "reserveId" : zéro fichier ID brûlé.
   ============================================================ */

function renderAddView(container) {
  container.innerHTML =
    '<div class="page-head">' +
      '<div>' +
        '<div class="page-title">Ajouter un produit</div>' +
        '<div class="page-sub">Les champs marqués * sont obligatoires</div>' +
      '</div>' +
    '</div>' +
    '<form id="add-form" class="card card-pad" novalidate></form>';

  var form = document.getElementById('add-form');

  form.innerHTML =
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:0 20px" id="add-grid">' +
      '<div>' +
        '<label class="field"><span class="field-label">Nom du produit <span class="field-req">*</span></span>' +
          '<input name="product_Name" class="input" required></label>' +

        '<label class="field"><span class="field-label">Catégorie <span class="field-req">*</span></span>' +
          '<select name="category" class="select" id="add-category" required>' +
            '<option value="">— Choisir —</option>' +
          '</select></label>' +

        '<label class="field"><span class="field-label">Sous-catégorie</span>' +
          '<select name="sub_Category" class="select" id="add-subcategory">' +
            '<option value="">—</option>' +
          '</select></label>' +

        '<label class="field"><span class="field-label">Marque</span>' +
          '<input name="MARQUE" class="input" list="add-marques" placeholder="Choisir ou écrire…">' +
          '<datalist id="add-marques"></datalist></label>' +
      '</div>' +
      '<div>' +
        '<label class="field"><span class="field-label">Status</span>' +
          '<select name="Status" class="select" id="add-status"></select></label>' +

        '<label class="field"><span class="field-label">Description</span>' +
          '<textarea name="description" class="textarea"></textarea></label>' +

        '<label class="field"><span class="field-label">Promo <small>(ex : PROMO, NOUVEAU)</small></span>' +
          '<input name="PROMO" class="input" placeholder="laisser vide si pas de promo"></label>' +
      '</div>' +
    '</div>' +

    '<div class="field"><span class="field-label">Images</span>' +
      '<div class="img-slots" id="add-slots"></div>' +
    '</div>' +

    '<details class="field">' +
      '<summary class="field-label" style="cursor:pointer">Descriptions supplémentaires (2 et 3)</summary>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:0 20px">' +
        '<div>' +
          '<label class="field"><span class="field-label">Description 2</span><textarea name="Description2" class="textarea"></textarea></label>' +
        '</div>' +
        '<div>' +
          '<label class="field"><span class="field-label">Description 3</span><textarea name="Description3" class="textarea"></textarea></label>' +
        '</div>' +
      '</div>' +
    '</details>' +

    '<p id="add-error" class="form-error"></p>' +
    '<div class="form-actions">' +
      '<button type="submit" class="btn btn-primary">Enregistrer</button>' +
      '<button type="button" id="add-cancel" class="btn btn-outline">Annuler</button>' +
    '</div>';

  document.getElementById('add-cancel').addEventListener('click', function () {
    showView('produits');
  });

  // ---- Statut ----
  var statusSel = document.getElementById('add-status');
  APP_CONFIG.statuses.forEach(function (s) {
    var o = document.createElement('option');
    o.value = s.value;
    o.textContent = s.label;
    if (s.value === 2) o.selected = true;
    statusSel.appendChild(o);
  });

  // ---- Listes (Config) ----
  loadLists_()
    .catch(function (err) {
      toast('Listes indisponibles : ' + err.message, 'err');
    });

  // ---- 3 emplacements d'images ----
  var imageSlots = [];
  var slotDefs = [
    { main: true,  title: 'Image principale' },
    { main: false, title: 'Image 2' },
    { main: false, title: 'Image 3' }
  ];
  slotDefs.forEach(function (def, i) {
    imageSlots.push(buildImageSlot_(document.getElementById('add-slots'), i, def));
  });

  // ---- Enregistrer ----
  form.onsubmit = function (e) {
    e.preventDefault();
    var errorEl = document.getElementById('add-error');
    errorEl.textContent = '';

    var submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Préparation…';

    var name = form.product_Name.value.trim();
    var category = form.category.value;
    if (!name || !category) {
      errorEl.textContent = 'Le nom et la catégorie sont obligatoires.';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Enregistrer';
      return;
    }

    // 1) Compresser les fichiers AVANT l'ajout (validation précoce)
    var names = ['main', 'image2', 'image3'];
    var fileSlotIndices = [];
    var prepPromises = [];

    imageSlots.forEach(function (slot, i) {
      if (!slot.hasFile) return;
      fileSlotIndices.push(i);
      prepPromises.push(prepareImageFile(slot.file));
    });

    Promise.all(prepPromises)
      .then(function (blobs) {
        submitBtn.textContent = 'Enregistrement…';
        var payload = {
          product_Name:  form.product_Name.value,
          category:      category,
          sub_Category:  form.sub_Category.value,
          MARQUE:        form.MARQUE.value,
          description:   form.description.value,
          Status:        form.Status.value,
          Description2:  form.Description2.value,
          Description3:  form.Description3.value,
          PROMO:         form.PROMO.value,
          Image_URL:     imageSlots[0].getUrl(),
          Image_URL2:    imageSlots[1].getUrl(),
          Image_URL3:    imageSlots[2].getUrl()
        };
        return api('addProduct', payload).then(function (res) {
          return { blobs: blobs, id: res.id };
        });
      })
      .then(function (env) {
        var id = env.id;
        var blobs = env.blobs;
        if (blobs.length === 0) {
          return { id: id, uploaded: false };
        }
        submitBtn.textContent = 'Téléversement des images…';
        var folder = 'sanitaire-al-houda/products/' + id;
        var uploadPromises = blobs.map(function (blob, k) {
          return uploadToCloudinary(blob, folder, names[fileSlotIndices[k]]);
        });
        return Promise.all(uploadPromises).then(function (urls) {
          var fields = {};
          urls.forEach(function (url, k) {
            var idx = fileSlotIndices[k];
            imageSlots[idx].setUrl(url);
            if (idx === 0) fields['Image_URL'] = url;
            else fields['Image_URL' + (idx + 1)] = url;
          });
          return api('updateProduct', { id: id, fields: fields })
            .then(function () { return { id: id, uploaded: true }; });
        });
      })
      .then(function (res) {
        var msg = res.uploaded
          ? 'Produit ajouté avec succès (ID ' + res.id + ').'
          : 'Produit ajouté (ID ' + res.id + ') sans image.';
        toast(msg, 'ok');
        showView('produits');
      })
      .catch(function (err) {
        if (err.isAuthError) { logout(); return; }
        errorEl.textContent = 'Erreur : ' + err.message;
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enregistrer';
      });
  };
}

/* ---- Remplit Catégorie / Sous-catégorie / Marques depuis Config ---- */
function loadLists_() {
  return api('getLists').then(function (lists) {
    var catSel = document.getElementById('add-category');
    var subSel = document.getElementById('add-subcategory');
    var marquesEl = document.getElementById('add-marques');

    lists.categories.forEach(function (c) {
      var o = document.createElement('option');
      o.value = c;
      o.textContent = c;
      catSel.appendChild(o);
    });

    catSel.onchange = function () {
      var pairs = lists.subByCat[catSel.value] || [];
      subSel.innerHTML = '';
      var empty = document.createElement('option');
      empty.value = '';
      empty.textContent = '—';
      subSel.appendChild(empty);
      pairs.forEach(function (s) {
        var o = document.createElement('option');
        o.value = s;
        o.textContent = s;
        subSel.appendChild(o);
      });
    };

    (lists.marques || []).forEach(function (m) {
      var o = document.createElement('option');
      o.value = m;
      o.textContent = m;
      marquesEl.appendChild(o);
    });
  });
}

/* ---- Bloc image réutilisable (Add + Edit) ---- */
function buildImageSlot_(container, index, def) {
  var state = {
    hasFile: false,
    file: null,
    url: '',
    origUrl: '',
    getUrl: function () { return this.url; },
    setUrl: function (u) { this.url = u; },
    setOriginalUrl: function (u) { this.origUrl = u; }
  };

  var div = document.createElement('div');
  div.className = 'img-slot' + (def.main ? ' main' : '');
  div.innerHTML =
    '<div class="img-slot-title">' + esc(def.title) +
      (def.main ? ' <small>(1/3)</small>' : '') + '</div>' +
    '<img class="img-preview" alt="Aperçu">' +
    '<div class="img-slot-actions">' +
      '<button type="button" class="btn-file">Choisir une image</button>' +
      '<input type="file" class="file-input" accept="image/jpeg,image/png,image/webp">' +
      '<input type="url" class="input" placeholder="ou collez une URL…">' +
      '<button type="button" class="btn-remove hidden">Retirer</button>' +
    '</div>';
  container.appendChild(div);

  var fileInput = div.querySelector('.file-input');
  var urlInput = div.querySelector('input[type="url"]');
  var preview = div.querySelector('.img-preview');
  var removeBtn = div.querySelector('.btn-remove');
  var btnFile = div.querySelector('.btn-file');

  btnFile.addEventListener('click', function () { fileInput.click(); });

  fileInput.addEventListener('change', function () {
    var file = fileInput.files[0];
    if (!file) return;
    try {
      validateImageFile(file);
      state.file = file;
      state.hasFile = true;
      state.url = '';
      urlInput.value = '';
      previewLocalFile(file, preview);
      div.classList.add('has-img');
      removeBtn.classList.remove('hidden');
    } catch (err) {
      toast(err.message, 'err');
      fileInput.value = '';
    }
  });

  urlInput.addEventListener('input', function () {
    var val = urlInput.value.trim();
    if (val) {
      state.url = val;
      state.file = null;
      state.hasFile = false;
      fileInput.value = '';
      preview.src = val;
      div.classList.add('has-img');
      removeBtn.classList.remove('hidden');
    }
  });

  removeBtn.addEventListener('click', function () {
    state.file = null;
    state.hasFile = false;
    state.url = '';
    fileInput.value = '';
    urlInput.value = '';
    preview.removeAttribute('src');
    div.classList.remove('has-img');
    removeBtn.classList.add('hidden');
  });

  return state;
}