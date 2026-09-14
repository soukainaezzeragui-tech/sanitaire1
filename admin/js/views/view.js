/* ============================================================
   SANITAIRE AL HOUDA II — Vue : Voir un produit (fiche détaillée)
   ============================================================ */

function renderViewView(container, product) {
  if (!product) {
    toast('Produit introuvable.', 'err');
    showView('produits');
    return;
  }

  var gallery = [
    product.Image_URL,
    product.Image_URL2,
    product.Image_URL3
  ].filter(function (u) { return String(u || '').trim() !== ''; });

  var imgs = gallery.length
    ? gallery.map(function (u, i) {
        return '<div class="img-slot has-img"><img class="img-preview" style="display:block" src="' + esc(u) + '" alt="Image ' + (i + 1) + '"></div>';
      }).join('')
    : '<p class="page-sub">Aucune image.</p>';

  container.innerHTML =
    '<div class="page-head"><div>' +
      '<div class="page-title">Produit #' + esc(product.ID) + '</div>' +
      '<div class="page-sub">' + (product.product_Name || '') + '</div>' +
    '</div><div>' +
      '<button class="btn btn-outline" onclick="showView(\'produits\')">← Retour</button>' +
    '</div></div>';

  container.innerHTML +=
    '<div class="card card-pad">' +
      '<div class="img-slots" style="margin-bottom:18px">' + imgs + '</div>' +
      '<table class="data" style="min-width:0;width:100%">' +
        '<tr><th style="width:180px">Nom</th><td>' + esc(product.product_Name) + '</td></tr>' +
        '<tr><th>Catégorie</th><td>' + esc(product.category || '') + '</td></tr>' +
        '<tr><th>Sous-catégorie</th><td>' + esc(product.sub_Category || '') + '</td></tr>' +
        '<tr><th>Marque</th><td>' + esc(product.MARQUE || '') + '</td></tr>' +
        '<tr><th>Status</th><td>' + statusBadge(product.Status) + '</td></tr>' +
        '<tr><th>Promo</th><td>' + promoBadge(product.PROMO) + '</td></tr>' +
        '<tr><th>Description</th><td>' + esc(product.description || '') + '</td></tr>' +
        (product.Description2 ? '<tr><th>Description 2</th><td>' + esc(product.Description2) + '</td></tr>' : '') +
        (product.Description3 ? '<tr><th>Description 3</th><td>' + esc(product.Description3) + '</td></tr>' : '') +
      '</table>' +
    '</div>';
}