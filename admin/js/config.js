/* ============================================================
   SANITAIRE AL HOUDA II — Configuration du Web App
   ============================================================ */

var APP_CONFIG = {
  /*
   * Phase 4 : coller ici l'URL de déploiement du Web App Apps Script
   * (https://script.google.com/macros/s/XXXXXXXX/exec)
   */
  apiUrl: 'https://script.google.com/macros/s/AKfycbwLnV6o6T6xkM1fpTGaESlj2qoebJ3QS8jk7yYkE1A4Ngux68Wed_Bi6OF6yK6_nrOSCg/exec',

  /*
   * Phase 6 : informations Cloudinary.
   * cloudName : le "cloud name" de votre compte.
   * uploadPreset : l'Upload Preset NON SIGNÉ créé dans le dashboard.
   */
  cloudName: 'ddrfdunoq',
  uploadPreset: 'sah_admin',

  // Limites d'images appliquées avant l'envoi.
  // Le fichier partant vers Cloudinary est TOUJOURS le JPEG compressé
  // (small), donc ce seuil n'est qu'une garde mémoire pour la lecture
  // de l'original. Les photos de téléphone (jusqu'à ~40 Mo) passent
  // et sont réduites côté client.
  imageMaxBytes: 40 * 1024 * 1024,      // 40 Mo (original autorisé)
  imageMaxWidth: 1600,                  // pixels (redimensionné côté client)

  // Signification des statuts (respecte le système existant)
  statuses: [
    { value: 1, label: 'Pages principales', cls: 'st-1' },
    { value: 2, label: 'Priorité 2',       cls: 'st-2' },
    { value: 3, label: 'Priorité 3',       cls: 'st-3' },
    { value: 4, label: 'Priorité 4',       cls: 'st-4' },
    { value: 9, label: 'Masqué',           cls: 'st-9' }
  ]
};