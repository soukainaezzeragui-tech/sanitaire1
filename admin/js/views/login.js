/* ============================================================
   SANITAIRE AL HOUDA II — Connexion (vue, Phase 9)
   Affiche les messages du serveur (tentatives restantes,
   session bloquée) et permet de changer le mot de passe.
   ============================================================ */

function renderLoginView() {
  var form = document.getElementById('login-form');
  var code = document.getElementById('login-code');
  var btn = document.getElementById('login-btn');
  var errEl = document.getElementById('login-error');

  code.value = '';
  errEl.textContent = '';
  resetPasswordPanel_();
  if (!window.__pwPanelWired) {
    window.__pwPanelWired = true;
    wirePasswordPanel_();
  }

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

/* ---------- Changement de mot de passe ---------- */
function resetPasswordPanel_() {
  var els = document.querySelectorAll('#login-pw-details input');
  for (var i = 0; i < els.length; i++) els[i].value = '';
  var err = document.getElementById('login-pw-error');
  if (err) err.textContent = '';
}

function wirePasswordPanel_() {
  var err = document.getElementById('login-pw-error');
  var btn = document.getElementById('login-pw-btn');
  btn.addEventListener('click', function () {
    var current = document.getElementById('login-pw-current').value.trim();
    var fresh = document.getElementById('login-pw-fresh').value;
    var confirm = document.getElementById('login-pw-confirm').value;

    err.textContent = '';
    if (!current || !fresh) {
      err.textContent = 'Remplissez tous les champs.';
      return;
    }
    if (fresh !== confirm) {
      err.textContent = 'Le nouveau mot de passe et sa confirmation ne correspondent pas.';
      return;
    }
    if (fresh.length < 4) {
      err.textContent = 'Le nouveau mot de passe doit contenir au moins 4 caractères.';
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Enregistrement…';
    api('changePassword', { current: current, fresh: fresh })
      .then(function () {
        toast('Mot de passe modifié. Reconnectez-vous avec le nouveau code.', 'ok');
        renderLoginView();
      })
      .catch(function (e) {
        if (e && e.isAuthError) err.textContent = e.message;
        else err.textContent = 'Impossible de contacter le serveur (' + e.message + ').';
      })
      .finally(function () {
        btn.disabled = false;
        btn.textContent = 'Changer le mot de passe';
      });
  });
}