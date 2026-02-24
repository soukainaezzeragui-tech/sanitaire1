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
            <a href="../index.html">Accueil</a>
            <a href="../contact.html">Contact</a>
            <a href="https://wa.me/212638069899" class="btn-order">
              WhatsApp
            </a>
          </nav>

        </div>
      </div>
    </div>
  </header>

  <section class="univers-section">
    <div class="container">
      <div class="univers-grid">

        ${createCategory("Salle de bain", "univers-bath.png")}
        ${createCategory("Traitement des eaux", "univers-water.png")}
        ${createCategory("Plomberie", "plombiere.png")}
        ${createCategory("Electricité", "cat5.png")}
        ${createCategory("Pompes", "univers-pump.jpg")}
        ${createCategory("Jardinage", "univers-garden.png")}
        ${createCategory("Bricolage", "bricolage.png")}
        ${createCategory("Cuisine", "univers-kitchen.png", "Cuisine / dressing")}
        ${createCategory("Climatisation", "univers-clim.png")}
        ${createCategory("Chaufe-eau", "univers-heating.png")}

      </div>
    </div>
  </section>
  `;

  document.getElementById("header").innerHTML = html;
}
function doSearch() {
    const input = document.getElementById("productSearch");
    const val = input ? input.value.trim() : "";
    
    if (val) {
        // بما أنك الآن داخل مجلد salle-de-bain، ابحث في نفس الصفحة
        window.location.href = `index.html?search=${encodeURIComponent(val)}`;
    }
}
// ==========================
// FOOTER
// ==========================
function loadFooter() {
  const html = `
  <footer class="main-footer">
    <div class="container footer-grid">

      <div class="footer-col about">
        <h3>SANITAIRE AL HOUDA <span>II</span></h3>
        <p>
          Votre expert de référence en matériaux de construction, plomberie,
          électricité et peinture.
        </p>
      </div>

      <div class="footer-col links">
        <h4>Liens Rapides</h4>
        <ul>
          <li><a href="../index.html">Accueil</a></li>
          <li><a href="#">Catégories</a></li>
          <li><a href="#">Promotions</a></li>
          <li><a href="../contact.html">Contact</a></li>
        </ul>
      </div>

      <div class="footer-col contact">
        <h4>Contact</h4>
        <p>📍 Avenue Smara, Laâyoune, Maroc</p>
        <p>📞 +212 667 361 575</p>
        <p>✉️ contact@alhouda.com</p>
      </div>
 <div class="footer-col map">
          <h4><i class="fas fa-map-marked-alt"></i> Notre emplacement</h4>
          <div class="map-container">
            <iframe
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
    </div>

    <div class="footer-bottom">
      <p>&copy; 2026 Sanitaire Al Houda II. Tous droits réservés.</p>
    </div>
  </footer>
  `;

  document.getElementById("footer").innerHTML = html;
}

// ==========================
// CATEGORY GENERATOR
// ==========================
function createCategory(cat, image, label = null) {
  return `
    <a href="products.html?cat=${encodeURIComponent(cat)}" class="univers-item">
      <div class="univers-icon">
        <img src="../images/${image}" alt="${cat}" />
      </div>
      <span>${label || cat}</span>
    </a>
  `;
}

// ==========================
// SEARCH
// ==========================
// ==========================
// SEARCH (الوظيفة المصححة)
// ==========================
function doSearch() {
  const input = document.getElementById("productSearch");
  const val = input ? input.value.trim() : "";
  
  if (val) {
    // التوجه لصفحة المنتجات مع تمرير كلمة البحث
    window.location.href = `products.html?search=${encodeURIComponent(val)}`;
  }
}

// ==========================
// LOAD EVERYTHING
// ==========================
document.addEventListener("DOMContentLoaded", () => {
  loadHeader();
  loadFooter();

  // إضافة ميزة البحث عند الضغط على زر Enter في لوحة المفاتيح
  document.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      const activeElement = document.activeElement;
      if (activeElement.id === "productSearch") {
        doSearch();
      }
    }
  });
});

// ==========================
// LOAD EVERYTHING
// ==========================
document.addEventListener("DOMContentLoaded", () => {
  loadHeader();
  loadFooter();
});