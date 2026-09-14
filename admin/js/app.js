/* ============================================================
   SANITAIRE AL HOUDA II — Application principale (routeur)
   ============================================================ */

var mainEl = document.getElementById('main');
var appEl = document.getElementById('app');
var loginEl = document.getElementById('view-login');
var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-link'));
var toastEl = document.getElementById('toast');
var toastTimer = null;

/* ---------- Démarrage ---------- */
function init() {
  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      showView(link.getAttribute('data-view'));
    });
  });

  document.getElementById('btn-logout').addEventListener('click', logout);

  if (isLogged()) {
    showApp();
  } else {
    showView('login');
  }
}

/* ---------- Navigation ---------- */
function showApp() {
  loginEl.classList.add('hidden');
  appEl.classList.remove('hidden');
  showView('produits');
}

function showView(name, param) {
  if (name !== 'login' && !isLogged()) {
    name = 'login';
  }

  if (name === 'login') {
    loginEl.classList.remove('hidden');
    appEl.classList.add('hidden');
    renderLoginView();
    return;
  }

  loginEl.classList.add('hidden');
  appEl.classList.remove('hidden');

  navLinks.forEach(function (link) {
    link.classList.toggle('active', link.getAttribute('data-view') === name);
  });

  mainEl.scrollTop = 0;

  switch (name) {
    case 'produits': renderListView(mainEl); break;
    case 'ajouter':  renderAddView(mainEl); break;
    case 'modifier': renderEditView(mainEl, param); break;
    case 'voir':     renderViewView(mainEl, param); break;
    default:         renderListView(mainEl);
  }
}

/* ---------- Message flottant ---------- */
function toast(message, type) {
  toastEl.textContent = message;
  toastEl.className = 'toast ' + (type || '');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(function () {
    toastEl.classList.add('hidden');
  }, 3500);
}

/* ---------- Utilitaires d'affichage ---------- */
function esc(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function statusInfo(value) {
  var found = APP_CONFIG.statuses.filter(function (s) { return s.value === Number(value); })[0];
  return found || { value: value, label: 'Statut ?', cls: 'st-4' };
}

function statusBadge(value) {
  var s = statusInfo(value);
  return '<span class="badge ' + s.cls + '">' + esc(s.label) + '</span>';
}

function promoBadge(value) {
  value = String(value == null ? '' : value).trim();
  if (!value) return '';
  if (value === 'PROMO') return '<span class="badge badge-promo">PROMO</span>';
  if (value === 'NOUVEAU') return '<span class="badge st-1">NOUVEAU</span>';
  return '<span class="badge badge-promo">' + esc(value) + '</span>';
}

function thumbHtml(product, size) {
  var url = String(product.Image_URL || '').trim();
  if (!url) {
    return '<span class="cell-thumb cell-thumb-none">Aucune</span>';
  }
  return '<img class="cell-thumb" loading="lazy" src="' + esc(url) + '" alt="">';
}

/* ---------- Démarrage ---------- */
document.addEventListener('DOMContentLoaded', init);