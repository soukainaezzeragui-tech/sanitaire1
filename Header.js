// ==========================
// CONFIGURATION: ربط ملف الـ CSS تلقائياً لضمان التصميم
// ==========================
if (!document.querySelector('link[href="/products.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/products.css'; // التأكد من المسار المطلق
    document.head.appendChild(link);
}

// ==========================
// HEADER
// ==========================
function loadHeader() {
  const html = `
  <header class="hero">
    <div class="hero-overlay">
      <div class="container">
        <div class="nav-panel">
          <div class="logo">
            <h1>SANITAIRE AL HOUDA <span>II</span></h1>
            <p>Matériaux de construction • Plomberie • Électricité • Peinture</p>
          </div>

          <div class="search-box">
            <input id="productSearch" type="text" placeholder="Rechercher..." />
            <button onclick="doSearch()">🔍</button>
          </div>

          <nav class="menu">
            <a href="/">Accueil</a>
            <a href="../contact.html">Contact</a>
            <a href="https://wa.me/212667361575" class="btn-order">WhatsApp</a>
          </nav>
        </div>
      </div>
    </div>
  </header>

  <section class="univers-section">
    <div class="container">
      <div class="univers-grid">
        ${createCategory("Salle de bain", "univers-bath.webp", "salle-de-bain")}
        ${createCategory("Traitement des eaux", "univers-water.webp", "traitement-eaux")}
        ${createCategory("Plomberie", "plombiere.webp", "plomberie")}
        ${createCategory("Electricité", "univers-electricity.webp", "electricite")}
        ${createCategory("Pompes", "univers-pump.webp", "pompes")}
        ${createCategory("Jardinage", "univers-garden.webp", "jardinage")}
        ${createCategory("Bricolage", "bricolage.webp", "bricolage")}
        ${createCategory("Cuisine", "univers-kitchen.webp", "cuisine", "Cuisine / dressing")}
        ${createCategory("Climatisation", "univers-clim.webp", "climatisation")}
        ${createCategory("Chaufe-eau", "univers-heating.webp", "chauffe-eau")}
      </div>
    </div>
  </section>
  `;
  document.getElementById("header").innerHTML = html;
}

// ==========================
// CATEGORY GENERATOR (المحسّن)
// ==========================
function createCategory(cat, image, folder, label = null) {
  return `
    <a href="/${folder}/" class="univers-item">
      <div class="univers-icon">
        <img src="/images/${image}" alt="${cat}" /> 
      </div>
      <span>${label || cat}</span>
    </a>
  `;
}

// ==========================
// SEARCH & FOOTER (نفس الكود مع تصحيح الروابط لـ /)
// ==========================
function doSearch() {
    const input = document.getElementById("productSearch");
    const val = input ? input.value.trim() : "";
    if (val) { window.location.href = `/products.html?search=${encodeURIComponent(val)}`; }
}

function loadFooter() {
  const html = `
    <footer class="main-footer">
        <div class="container footer-grid">
          <div class="footer-col about">
            <h3>SANITAIRE AL HOUDA <span>II</span></h3>
            <p>
              Votre expert de référence en matériaux de construction, plomberie,
              électricité et peinture. Haute qualité et service fiable depuis
              des années.
            </p>
            <div class="social-icons">
              <a href="#">FB</a>
              <a href="#">IG</a>
              <a href="#">WA</a>
            </div>
          </div>

          <div class="footer-col links">
            <h4>Liens Rapides</h4>
            <ul>
              <li><a href="./">Accueil</a></li>
              <li><a href="../contact/">Contact</a></li>
            </ul>
          </div>

          <div class="footer-col contact">
            <h4>Contact</h4>
            <p>📍 Avenue Smara, près de la Banque Populaire, Laâyoune, Maroc</p>
            <p>📞 +212 667 361 575</p>
            <p>✉️ sanitaire.alhouda.2@gmail.com</p>
          </div>

          <div class="footer-col map">
            <h4><i class="fas fa-map-marked-alt"></i> Notre emplacement</h4>
            <div class="map-container">
              <iframe
                title="Localisation SANITAIRE AL HOUDA II à Laâyoune"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d373.2162430973931!2d-13.178955940129445!3d27.13579116033025!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xc377300749d3661%3A0x81a186da3a9345d8!2sSANITAIRE%20AL%20HOUDA%202!5e0!3m2!1sar!2s!4v1771433433259!5m2!1sar!2s"
                width="100%"
                height="250"
                style="border: 0"
                loading="lazy"
              >
              </iframe>
            </div>
          </div>
        </div>
        <!-- إغلاق container footer-grid -->

        <div class="footer-bottom">
          <p>&copy; 2026 Sanitaire Al Houda II. Tous droits réservés.</p>
        </div>
      </footer>`
  document.getElementById("footer").innerHTML = html;
}

document.addEventListener("DOMContentLoaded", () => {
  loadHeader();
  loadFooter();

});




