/* ============================================================
   SANITAIRE AL HOUDA II — Session / Authentification (Phase 9)
   Le mot de passe n'est envoyé qu'à la connexion ; le serveur
   renvoie un jeton de session stocké en localStorage.
   ============================================================ */

var AUTH_KEY = 'sanitaire_admin_token';

function getToken() {
  return localStorage.getItem(AUTH_KEY) || '';
}

function setToken(t) {
  if (t) localStorage.setItem(AUTH_KEY, t);
  else localStorage.removeItem(AUTH_KEY);
}

function isLogged() {
  return !!getToken();
}

/**
 * Connexion : le serveur vérifie le mot de passe et renvoie un
 * jeton de session (pas le mot de passe lui-même).
 * @param {string} password Mot de passe / code d'accès saisi
 */
function login(password) {
  password = String(password || '').trim();
  return api('login', { password: password })
    .then(function (res) {
      setToken(res.token);
      // Vérifie immédiatement que la session fonctionne
      return api('getProducts');
    })
    .then(function () { return true; })
    .catch(function (e) {
      setToken('');
      throw e;
    });
}

function logout() {
  var t = getToken();
  setToken('');
  if (t) api('logout').catch(function () {});
  showView('login');
}