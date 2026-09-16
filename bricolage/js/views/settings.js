/* ============================================================
   SANITAIRE AL HOUDA II — Vue : Paramètres (changer le mot de passe)
   ============================================================
   Nécessite une session : la session elle-même prouve l'identité,
   donc on ne demande PAS l'ancien mot de passe.
   Le serveur invalide toutes les sessions après le changement.
   ============================================================ */

function renderSettingsView(container) {
  container.innerHTML =
    '<div class="page-head">' +
      '<div>' +
        '<div class="page-title">Paramètres</div>' +
        '<div class="page-sub">Sécurité du compte</div>' +
      '</div>' +
    '</div>' +
    '<form id="settings-form" class="card card-pad" novalidate>' +
      '<div class="page-title" style="font-size:15px;margin-bottom:16px">Changer le mot de passe</div>' +

      '<label class="field">' +
        '<span class="field-label">Nouveau mot de passe</span>' +
        '<input type="password" id="settings-fresh" class="input" autocomplete="off" required>' +
      '</label>' +

      '<label class="field">' +
        '<span class="field-label">Confirmer le nouveau mot de passe</span>' +
        '<input type="password" id="settings-confirm" class="input" autocomplete="off" required>' +
      '</label>' +

      '<p id="settings-error" class="form-error"></p>' +
      '<div class="form-actions">' +
        '<button type="submit" class="btn btn-primary" id="settings-btn">Changer le mot de passe</button>' +
      '</div>' +
    '</form>';

  var form = document.getElementById('settings-form');
  var freshEl = document.getElementById('settings-fresh');
  var confirmEl = document.getElementById('settings-confirm');
  var errEl = document.getElementById('settings-error');
  var btn = document.getElementById('settings-btn');

  form.onsubmit = function (e) {
    e.preventDefault();
    var fresh = freshEl.value;
    var confirm = confirmEl.value;

    errEl.textContent = '';
    if (fresh.length < 8) {
      errEl.textContent = 'Le nouveau mot de passe doit contenir au moins 8 caractères.';
      return;
    }
    if (fresh !== confirm) {
      errEl.textContent = 'La confirmation ne correspond pas au nouveau mot de passe.';
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Enregistrement…';

    api('changePassword', { fresh: fresh })
      .then(function () {
        toast('Mot de passe modifié. Reconnectez-vous.', 'ok');
        logout(); // le serveur a invalidé toutes les sessions (dont la nôtre)
      })
      .catch(function (e) {
        if (e && e.isAuthError) {
          errEl.textContent = e.message;
          logout();
        } else {
          errEl.textContent = 'Impossible de contacter le serveur (' + e.message + ').';
        }
        btn.disabled = false;
        btn.textContent = 'Changer le mot de passe';
      });
  };
}