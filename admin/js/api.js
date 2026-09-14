/* ============================================================
   SANITAIRE AL HOUDA II — Client API (Apps Script)
   ============================================================
   Chaque requête est POSTée en `text/plain` (JSON brut dans le corps)
   pour éviter le prélude CORS, puis interprétée comme JSON.
   ============================================================ */

/**
 * Appelle l'API Apps Script.
 * @param {string} action  Ex : 'getProducts', 'addProduct'...
 * @param {object} payload Données de la requête
 * @param {string} overrideToken  (optionnel) jeton à envoyer à la place
 *                                de celui stocké (utilisé par logout)
 * @return {Promise} Résout avec `data` si {ok:true}, sinon rejette.
 */
function api(action, payload, overrideToken) {
  var url = APP_CONFIG.apiUrl;
  if (!url) {
    return Promise.reject(new Error('URL_API_NON_CONFIG'));
  }

  var body = {
    token: overrideToken || getToken(),
    action: action,
    payload: payload || {}
  };

  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(body)
  })
  .then(function (res) { return res.json(); })
  .then(function (json) {
    if (json && json.ok) return json.data;
    var msg = (json && json.message) || 'Erreur inconnue du serveur.';
    var err = new Error(msg);
    err.isAuthError = msg.indexOf('Accès refusé') !== -1;
    throw err;
  });
}