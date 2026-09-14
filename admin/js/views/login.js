/* ============================================================
   SANITAIRE AL HOUDA II — Connexion (vue)
   Affiche les messages du serveur (tentatives restantes,
   session bloquée).
   ============================================================ */

function renderLoginView() {
  var form = document.getElementById('login-form');
  var code = document.getElementById('login-code');
  var btn = document.getElementById('login-btn');
  var errEl = document.getElementById('login-error');

  code.value = '';
  errEl.textContent = '';

  form.onsubmit = function (e) {
    e.preventDefault();
    var value = code.value.trim();
    if (!value) { errEl.textContent = 'Saisissez votre code d’accès.'; return; }

    errEl.textContent = '';
    btn.disabled = true;
    btn.textContent = 'Connexion…';

    login(value)
      .then(function () {
        showApp();
      })
      .catch(function (err) {
        if (err && err.isAuthError) {
          errEl.textContent = err.message || 'Code d’accès incorrect.';
        } else {
          errEl.textContent = 'Impossible de contacter le serveur (' + (err && err.message) + ').';
        }
      })
      .finally(function () {
        btn.disabled = false;
        btn.textContent = 'Se connecter';
      });
  };
}