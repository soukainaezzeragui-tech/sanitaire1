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
            <input id="searchInput" type="text" placeholder="Rechercher..." />
            <button onclick="doSearch()">🔍</button>
          </div>

          <nav class="menu">
            <a href="index.html">Accueil</a>
            <a href="contact.html">Contact</a>
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

     <a href="products.html?cat=Salle de bain" class="univers-item">
            <div class="univers-icon">
              <img src="images/univers-bath.png" />
            </div>
            <span>Salle de bain</span>
          </a>
          <a href="products.html?cat=Traitement des eaux" class="univers-item">
            <div class="univers-icon">
              <img src="images/univers-water.png" alt="Traitement des eaux" />
            </div>
            <span>Traitement des eaux</span>
          </a>

          <a href="products.html?cat=Plomberie" class="univers-item">
            <div class="univers-icon">
              <img src="images/plombiere.png" alt="Plomberie" />
            </div>
            <span>Plomberie</span>
          </a>

          <a href="products.html?cat=Electricité" class="univers-item">
            <div class="univers-icon">
              <img src="images/cat5.png" alt="Electricité" />
            </div>
            <span>Electricité</span>
          </a>

          <a href="products.html?cat=Pompes" class="univers-item">
            <div class="univers-icon">
              <img src="images/univers-pump.jpg" alt="Pompes" />
            </div>
            <span>Pompes</span>
          </a>

          <a href="products.html?cat=Jardinage" class="univers-item">
            <div class="univers-icon">
              <img src="images/univers-garden.png" alt="Jardinage" />
            </div>
            <span>Jardinage</span>
          </a>

          <a href="products.html?cat=Bricolage" class="univers-item">
            <div class="univers-icon">
              <img src="images/bricolage.png" alt="Bricolage" />
            </div>
            <span>Bricolage</span>
          </a>

          <a href="products.html?cat=Cuisine" class="univers-item">
            <div class="univers-icon">
              <img src="images/univers-kitchen.png" alt="Cuisine" />
            </div>
            <span>Cuisine / dressing</span>
          </a>

          <a href="products.html?cat=Climatisation" class="univers-item">
            <div class="univers-icon">
              <img src="images/univers-clim.png" alt="Climatisation" />
            </div>
            <span>Climatisation</span>
          </a>

          <a href="products.html?cat=Chaufe-eau" class="univers-item">
            <div class="univers-icon">
              <img src="images/univers-heating.png" alt="Chauffage" />
            </div>
            <span>Chaufe-eau</span>
          </a>
      </div>
    </div>
  </section>
  
  `;

  document.getElementById("header").innerHTML = html;
}

document.addEventListener("DOMContentLoaded", loadHeader);

function doSearch(){
  const val = document.getElementById("searchInput").value;
  window.location.href = "products.html?search=" + encodeURIComponent(val);
}
