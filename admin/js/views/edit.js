/* ============================================================
   SANITAIRE AL HOUDA II — Vue : Modifier un produit (Phase 7)
   ============================================================ */

function renderEditView(container, product) {
  if (!product) {
    toast('Produit introuvable.', 'err');
    showView('produits');
    return;
  }

  container.innerHTML =
    '<div class="page-head">' +
      '<div><div class="page-title">Modifier — #' + esc(product.ID) + '</div>' +
      '<div class="page-sub">' + esc(product.product_Name || '') + '</div></div>' +
      '<button class="btn btn-outline" onclick="showView(\'produits\')">← Retour</button>' +
    '</div>' +
    '<form id="edit-form" class="card card-pad" novalidate></form>';

  var form = document.getElementById('edit-form');
  form.innerHTML =
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:0 20px">' +
      '<div>' +
        '<label class="field"><span class="field-label">Nom du produit <span class="field-req">*</span></span>' +
          '<input name="product_Name" class="input" required></label>' +
        '<label class="field"><span class="field-label">Catégorie <span class="field-req">*</span></span>' +
          '<select name="category" class="select" id="edit-cat" required>' +
            '<option value="">— Choisir —</option></select></label>' +
        '<label class="field"><span class="field-label">Sous-catégorie</span>' +
          '<select name="sub_Category" class="select" id="edit-sub">' +
            '<option value="">—</option></select></label>' +
        '<label class="field"><span class="field-label">Marque</span>' +
          '<input name="MARQUE" class="input" list="edit-marques" placeholder="Choisir ou écrire…">' +
          '<datalist id="edit-marques"></datalist></label>' +
      '</div><div>' +
        '<label class="field"><span class="field-label">Status</span>' +
          '<select name="Status" class="select" id="edit-status"></select></label>' +
        '<label class="field"><span class="field-label">Description</span>' +
          '<textarea name="description" class="textarea"></textarea></label>' +
        '<label class="field"><span class="field-label">Promo</span>' +
          '<input name="PROMO" class="input" placeholder="laisser vide si pas de promo"></label>' +
      '</div></div>' +
    '<div class="field"><span class="field-label">Images</span>' +
      '<div class="img-slots" id="edit-slots"></div></div>' +
    '<details class="field"><summary class="field-label" style="cursor:pointer">Descriptions supplémentaires (2 et 3)</summary>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:0 20px">' +
        '<label class="field"><span class="field-label">Description 2</span><textarea name="Description2" class="textarea"></textarea></label>' +
        '<label class="field"><span class="field-label">Description 3</span><textarea name="Description3" class="textarea"></textarea></label>' +
      '</div></details>' +
    '<p id="edit-error" class="form-error"></p>' +
    '<div class="form-actions">' +
      '<button type="submit" class="btn btn-primary">Enregistrer les modifications</button>' +
      '<button type="button" id="edit-cancel" class="btn btn-outline">Annuler</button>' +
    '</div>';

  // ---- Remplir les champs avec les valeurs actuelles ----
  form.product_Name.value = product.product_Name || '';
  form.description.value  = product.description || '';
  form.PROMO.value        = product.PROMO || '';
  form.Description2.value = product.Description2 || '';
  form.Description3.value = product.Description3 || '';

  // Statut
  var statusSel = document.getElementById('edit-status');
  APP_CONFIG.statuses.forEach(function (s) {
    var o = document.createElement('option');
    o.value = s.value; o.textContent = s.label;
    if (s.value === Number(product.Status)) o.selected = true;
    statusSel.appendChild(o);
  });

  // ---- Catégories : valeur actuelle immédiate, puis fusion Config ----
  seedEditSelects_(product);
  loadEditLists_(product);

  // ---- 3 emplacements d'images ----
  var imageSlots = [];
  var slotDefs = [
    { main: true,  title: 'Image principale',  origKey: 'Image_URL'  },
    { main: false, title: 'Image 2',           origKey: 'Image_URL2' },
    { main: false, title: 'Image 3',           origKey: 'Image_URL3' }
  ];
  var slotsEl = document.getElementById('edit-slots');
  slotDefs.forEach(function (def, i) {
    var slot = buildImageSlot_(slotsEl, i, def);
    // Pré-remplir avec l'URL actuelle du produit
    var currentUrl = String(product[def.origKey] || '').trim();
    if (currentUrl) {
      slot.setUrl(currentUrl);
      slot.setOriginalUrl(currentUrl);
      var preview = slotsEl.querySelectorAll('.img-preview')[i];
      if (preview) preview.src = currentUrl;
      slotsEl.querySelectorAll('.img-slot')[i].classList.add('has-img');
      var removeBtn = slotsEl.querySelectorAll('.btn-remove')[i];
      if (removeBtn) removeBtn.classList.remove('hidden');
    }
    imageSlots.push(slot);
  });

  document.getElementById('edit-cancel').addEventListener('click', function () {
    showView('produits');
  });

  // ---- Sauvegarde : envoie uniquement les champs modifiés ----
  form.onsubmit = function (e) {
    e.preventDefault();
    var errorEl = document.getElementById('edit-error');
    errorEl.textContent = '';

    var submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Traitement…';

    // 1) Upload des nouvelles images par fichier
    var names = ['main', 'image2', 'image3'];
    var uploads = [];
    imageSlots.forEach(function (slot, i) {
      if (!slot.hasFile) return;
      var folder = 'sanitaire-al-houda/products/' + product.ID;
      uploads.push(
        prepareImageFile(slot.file)
          .then(function (blob) { return uploadToCloudinary(blob, folder, names[i]); })
          .then(function (url) { slot.setUrl(url); })
      );
    });

    Promise.all(uploads)
      .then(function () {
        // 2) Construire les champs modifiés uniquement
        var fields = {};

        var vals = {
          product_Name: form.product_Name.value,
          category:     form.category.value,
          sub_Category: form.sub_Category.value,
          MARQUE:       form.MARQUE.value,
          description:  form.description.value,
          Status:       form.Status.value,
          PROMO:        form.PROMO.value,
          Description2: form.Description2.value,
          Description3: form.Description3.value
        };
        var keys = Object.keys(vals);
        for (var k = 0; k < keys.length; k++) {
          var col = keys[k];
          var newVal = String(vals[col] == null ? '' : vals[col]).trim();
          var oldVal = String(product[col] == null ? '' : product[col]).trim();
          if (newVal !== oldVal) fields[col] = vals[col];
        }

        // Images : comparer URL actuelle avec l'URL dans le slot
        var imgKeys = [
          { col: 'Image_URL',  slot: imageSlots[0] },
          { col: 'Image_URL2', slot: imageSlots[1] },
          { col: 'Image_URL3', slot: imageSlots[2] }
        ];
        imgKeys.forEach(function (item) {
          var newUrl = String(item.slot.getUrl() || '').trim();
          var oldUrl = String(product[item.col] || '').trim();
          if (newUrl !== oldUrl) fields[item.col] = newUrl;
        });

        if (Object.keys(fields).length === 0) {
          toast('Aucune modification détectée.', '');
          submitBtn.disabled = false;
          submitBtn.textContent = 'Enregistrer les modifications';
          return Promise.resolve();
        }

        submitBtn.textContent = 'Enregistrement…';
        return api('updateProduct', { id: product.ID, fields: fields });
      })
      .then(function (res) {
        if (res) {
          toast('Produit modifié avec succès.', 'ok');
          showView('produits');
        }
      })
      .catch(function (err) {
        if (err.isAuthError) { logout(); return; }
        if (err.message.indexOf('CONFIG_CLOUDINARY_MANQUANTE') !== -1) {
          errorEl.textContent = 'Configuration Cloudinary manquante.';
        } else {
          errorEl.textContent = 'Erreur : ' + err.message;
        }
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enregistrer les modifications';
      });
  };
}

// Remplit immédiatement (synchronement) le SELECT avec la valeur
// actuelle du produit : ainsi le champ n'est JAMAIS vide au moment
// de l'enregistrement, même si le chargement des listes tarde ou échoue.
function seedEditSelects_(product) {
  var catSel = document.getElementById('edit-cat');
  var subSel = document.getElementById('edit-sub');

  var seedSub = function (value) {
    if (!value) return;
    var o = document.createElement('option');
    o.value = value; o.textContent = value; o.selected = true;
    subSel.appendChild(o);
  };

  var cat = String(product.category || '').trim();
  if (cat) {
    var co = document.createElement('option');
    co.value = cat; co.textContent = cat; co.selected = true;
    catSel.appendChild(co);
    seedSub(String(product.sub_Category || '').trim());
  }
}

function loadEditLists_(product) {
  return api('getLists').then(function (lists) {
    var catSel = document.getElementById('edit-cat');
    var subSel = document.getElementById('edit-sub');
    var marquesEl = document.getElementById('edit-marques');

    // Ajoute les catégories de Config (sans toucher à la sélection)
    lists.categories.forEach(function (c) {
      if (!optionExists_(catSel, c)) {
        var o = document.createElement('option');
        o.value = c; o.textContent = c;
        catSel.appendChild(o);
      }
    });

    // Construit les sous-catégories de la catégorie choisie
    rebuildEditSubs_(lists, product);

    catSel.onchange = function () { rebuildEditSubs_(lists, product); };

    (lists.marques || []).forEach(function (m) {
      var o = document.createElement('option');
      o.value = m; o.textContent = m;
      marquesEl.appendChild(o);
    });
  });
}

// Reconstruit les sous-catégories pour la catégorie sélectionnée,
// en conservant la sélection actuelle si elle est toujours valide.
function rebuildEditSubs_(lists, product) {
  var catSel = document.getElementById('edit-cat');
  var subSel = document.getElementById('edit-sub');
  var current = subSel.value;

  subSel.innerHTML = '';
  var empty = document.createElement('option');
  empty.value = ''; empty.textContent = '—';
  subSel.appendChild(empty);

  var pairs = lists.subByCat[catSel.value] || [];

  // S'assure que la sous-catégorie actuelle du produit reste listée
  var sub = String(product.sub_Category || '').trim();
  if (sub && pairs.indexOf(sub) === -1) pairs.push(sub);
  pairs.sort();

  pairs.forEach(function (s) {
    var o = document.createElement('option');
    o.value = s; o.textContent = s;
    subSel.appendChild(o);
  });

  if (optionExists_(subSel, current)) subSel.value = current;
}

function optionExists_(sel, value) {
  for (var i = 0; i < sel.options.length; i++) {
    if (String(sel.options[i].value) === String(value)) return true;
  }
  return false;
}