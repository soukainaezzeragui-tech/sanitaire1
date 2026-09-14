/* ============================================================
   SANITAIRE AL HOUDA II — Vue : Liste des produits (Phase 8)
   Recherche + filtres combinables + pagination
   ============================================================ */

var listState = {
  products: [],
  lists: { categories: [], subByCat: {}, marques: [] },
  search: '',
  filters: { category: '', sub: '', marque: '', status: '', promo: '' },
  page: 1,
  pageSize: 20
};

function renderListView(container) {
  container.innerHTML =
    '<div class="page-head">' +
      '<div>' +
        '<div class="page-title">Produits</div>' +
        '<div class="page-sub" id="list-count">Chargement…</div>' +
      '</div>' +
      '<div class="toolbar" style="flex-basis:100%">' +
        '<input id="list-search" class="input search" type="search" placeholder="Rechercher par ID, nom ou marque…">' +
        '<select id="f-category" class="select"><option value="">Catégorie : toutes</option></select>' +
        '<select id="f-sub" class="select"><option value="">Sous-catégorie : toutes</option></select>' +
        '<select id="f-marque" class="select"><option value="">Marque : toutes</option></select>' +
        '<select id="f-status" class="select"><option value="">Statut : tous</option></select>' +
        '<select id="f-promo" class="select"><option value="">Promo : tous</option></select>' +
        '<button id="list-refresh" class="btn btn-outline">Actualiser</button>' +
      '</div>' +
    '</div>' +
    '<div class="card"><div class="table-wrap"><table class="data">' +
      '<thead><tr>' +
        '<th>ID</th><th>Image</th><th>Nom</th><th>Catégorie</th>' +
        '<th>Sous-catégorie</th><th>Marque</th><th>Status</th><th>Promo</th><th>Actions</th>' +
      '</tr></thead>' +
      '<tbody id="list-body"></tbody>' +
    '</table></div>' +
    '<div class="pager card-pad">' +
      '<button id="page-prev" class="btn btn-outline btn-sm">← Précédent</button>' +
      '<span id="page-info" class="page-sub"></span>' +
      '<button id="page-next" class="btn btn-outline btn-sm">Suivant →</button>' +
    '</div></div>';

  wireSearch_();
  wireFilters_();
  wirePager_();

  document.getElementById('list-refresh').addEventListener('click', function () {
    loadProducts(container);
  });

  loadProducts(container);
}

/* ---------- Chargement (produits + listes) ---------- */
function loadProducts(container) {
  var body = document.getElementById('list-body');
  var count = document.getElementById('list-count');
  body.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:24px">Chargement…</td></tr>';

  Promise.all([api('getProducts'), api('getLists')])
    .then(function (results) {
      listState.products = results[0] || [];
      listState.lists = results[1] || listState.lists;
      rebuildOptions_();
      listState.page = 1;
      renderTable_();
    })
    .catch(function (err) {
      if (err.isAuthError) { toast('Session expirée : reconnectez-vous.', 'err'); logout(); return; }
      body.innerHTML = '<tr><td colspan="9"><p class="form-error">Erreur : ' + esc(err.message) + '</p></td></tr>';
    });
}

/* ---------- Filtre combiné ---------- */
function applyFilters_() {
  var q = listState.search.toLowerCase();
  var f = listState.filters;

  return listState.products.filter(function (p) {
    // Recherche : ID / nom / marque
    if (q) {
      var idStr = String(p.ID);
      var name = String(p.product_Name || '').toLowerCase();
      var marque = String(p.MARQUE || '').toLowerCase();
      if (idStr.indexOf(q) === -1 && name.indexOf(q) === -1 && marque.indexOf(q) === -1) {
        return false;
      }
    }
    if (f.category && p.category !== f.category) return false;
    if (f.sub && p.sub_Category !== f.sub) return false;
    if (f.marque && String(p.MARQUE || '') !== f.marque) return false;
    if (f.status && Number(p.Status) !== Number(f.status)) return false;
    if (f.promo === 'oui' && !String(p.PROMO || '').trim()) return false;
    if (f.promo === 'non' && String(p.PROMO || '').trim()) return false;
    return true;
  });
}

/* ---------- Rendu du tableau + pagination ---------- */
function renderTable_() {
  var body = document.getElementById('list-body');
  var count = document.getElementById('list-count');

  var filtered = applyFilters_();
  var total = filtered.length;
  var pages = Math.max(1, Math.ceil(total / listState.pageSize));
  if (listState.page > pages) listState.page = pages;

  var start = (listState.page - 1) * listState.pageSize;
  var rows = filtered.slice(start, start + listState.pageSize);

  count.textContent = rows.length + ' produit(s) affiché(s) sur ' + total;
  document.getElementById('page-info').textContent = 'Page ' + listState.page + ' / ' + pages;
  document.getElementById('page-prev').disabled = listState.page <= 1;
  document.getElementById('page-next').disabled = listState.page >= pages;

  if (rows.length === 0) {
    body.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:24px" class="page-sub">Aucun produit ne correspond.</td></tr>';
    return;
  }

  body.innerHTML = rows.map(rowHtml_).join('');
}

function rowHtml_(p) {
  return '<tr>' +
    '<td><strong>' + esc(p.ID) + '</strong></td>' +
    '<td>' + thumbHtml(p) + '</td>' +
    '<td class="cell-name">' + esc(p.product_Name || '') + '</td>' +
    '<td>' + esc(p.category || '') + '</td>' +
    '<td>' + esc(p.sub_Category || '') + '</td>' +
    '<td>' + esc(p.MARQUE || '') + '</td>' +
    '<td>' + statusBadge(p.Status) + '</td>' +
    '<td>' + promoBadge(p.PROMO) + '</td>' +
    '<td class="cell-actions">' +
      '<button class="btn btn-outline btn-sm" onclick="goEdit(' + esc(p.ID) + ')">Modifier</button>' +
      '<button class="btn btn-dark btn-sm" onclick="goView(' + esc(p.ID) + ')">Voir</button>' +
    '</td></tr>';
}

/* ---------- Construction des options des filtres ---------- */
function rebuildOptions_() {
  var lists = listState.lists;
  var products = listState.products;

  // Marques : union (Config + distinct produits)
  var marques = lists.marques.slice();
  products.forEach(function (p) {
    var m = String(p.MARQUE || '').trim();
    if (m && marques.indexOf(m) === -1) marques.push(m);
  });
  marques.sort();

  // Catégories : à partir de Config + distinct produits
  var cats = lists.categories.slice();
  products.forEach(function (p) {
    if (p.category && cats.indexOf(p.category) === -1) cats.push(p.category);
  });
  cats.sort();

  fillSelect_('f-category', cats, '', 'Catégorie : toutes');
  fillSelect_('f-marque', marques, '', 'Marque : toutes');

  var statusNames = APP_CONFIG.statuses.map(function (s) {
    return { value: String(s.value), label: s.label };
  });
  fillSelect_('f-status', statusNames, '', 'Statut : tous');

  fillSelect_('f-promo', [
    { value: 'oui', label: 'Avec promo' },
    { value: 'non', label: 'Sans promo' }
  ], '', 'Promo : tous');

  rebuildSubOptions_(document.getElementById('f-category').value);
}

function rebuildSubOptions_(category) {
  var lists = listState.lists;
  var products = listState.products;
  var subs = [];

  (lists.subByCat[category] || []).forEach(function (s) { subs.push(s); });
  products.forEach(function (p) {
    if (p.category === category) {
      var s = String(p.sub_Category || '').trim();
      if (s && subs.indexOf(s) === -1) subs.push(s);
    }
  });
  subs.sort();
  fillSelect_('f-sub', subs, '', 'Sous-catégorie : toutes');
}

function fillSelect_(id, values, selected, placeholder) {
  var sel = document.getElementById(id);
  if (!sel) return;
  var html = '<option value="">' + esc(placeholder) + '</option>';
  values.forEach(function (v) {
    var val = typeof v === 'object' ? v.value : v;
    var label = typeof v === 'object' ? v.label : v;
    html += '<option value="' + esc(val) + '"' + (String(val) === String(selected) ? ' selected' : '') + '>' + esc(label) + '</option>';
  });
  sel.innerHTML = html;
}

/* ---------- Écouteurs ---------- */
function wireSearch_() {
  var input = document.getElementById('list-search');
  var timer = null;
  input.addEventListener('input', function () {
    clearTimeout(timer);
    timer = setTimeout(function () {
      listState.search = input.value.trim();
      listState.page = 1;
      renderTable_();
    }, 200);
  });
}

function wireFilters_() {
  document.getElementById('f-category').addEventListener('change', function (e) {
    listState.filters.category = e.target.value;
    listState.filters.sub = '';
    rebuildSubOptions_(e.target.value);
    listState.page = 1;
    renderTable_();
  });
  document.getElementById('f-sub').addEventListener('change', function (e) {
    listState.filters.sub = e.target.value;
    listState.page = 1;
    renderTable_();
  });
  document.getElementById('f-marque').addEventListener('change', function (e) {
    listState.filters.marque = e.target.value;
    listState.page = 1;
    renderTable_();
  });
  document.getElementById('f-status').addEventListener('change', function (e) {
    listState.filters.status = e.target.value;
    listState.page = 1;
    renderTable_();
  });
  document.getElementById('f-promo').addEventListener('change', function (e) {
    listState.filters.promo = e.target.value;
    listState.page = 1;
    renderTable_();
  });
}

function wirePager_() {
  document.getElementById('page-prev').addEventListener('click', function () {
    if (listState.page > 1) { listState.page--; renderTable_(); }
  });
  document.getElementById('page-next').addEventListener('click', function () {
    var pages = Math.ceil(applyFilters_().length / listState.pageSize);
    if (listState.page < pages) { listState.page++; renderTable_(); }
  });
}

/* ---------- Ouverture Modifier / Voir ---------- */
function goEdit(id) {
  var p = listState.products.filter(function (x) { return Number(x.ID) === Number(id); })[0];
  if (!p) { toast('Produit introuvable.', 'err'); return; }
  showView('modifier', p);
}

function goView(id) {
  var p = listState.products.filter(function (x) { return Number(x.ID) === Number(id); })[0];
  if (!p) { toast('Produit introuvable.', 'err'); return; }
  showView('voir', p);
}