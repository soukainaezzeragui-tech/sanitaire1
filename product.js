/* ============================================================
   PRODUCT DETAIL — Redesigned (Sept 2026)
   ============================================================ */

const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vR0qnUzNmU46GUWrjrFJNJUoV3jtOcfD0b7uK1Y_k-7ad0m1-0C_AGSdEL6Jgh1aonTLTYl3Z50SGq6/pub?gid=0&single=true&output=csv";

const WHATSAPP = "212667361575";

const esc = (s) => {
  const d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
};
const clean = (v) => (v ? v.replace(/^"|"$/g, "").trim() : "");
const decode = (v) => {
  try { return decodeURIComponent(v); } catch { return v; }
};

function badgeClass(p) {
  const t = p.toLowerCase();
  if (t.includes("nouveau") || t.includes("new"))  return "badge-new";
  if (t.includes("best") || t.includes("top"))     return "badge-best";
  if (t.includes("stock") || t.includes("limite")) return "badge-stock";
  if (t.includes("soldes"))                        return "badge-soldes";
  return "badge-promo";
}

function parseRows(csvText) {
  const rows = csvText.split(/\r?\n/).filter(Boolean);
  const products = [];
  for (let i = 1; i < rows.length; i++) {
    const cols = rows[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    const name = clean(cols[1]);
    if (!name) continue;
    products.push({
      name,
      category:    clean(cols[2]),
      subCategory: clean(cols[3]),
      marque:      clean(cols[4]),
      description: clean(cols[5]),
      img:         clean(cols[6]),
      status:      clean(cols[7]),
      desc2:       clean(cols[8]),
      desc3:       clean(cols[9]),
      img2:        clean(cols[10]),
      img3:        clean(cols[11]),
      promo:       clean(cols[12]),
      _idx: i
    });
  }
  return products;
}

/* ------------------------------------------------------------------
   RENDERING
   ------------------------------------------------------------------ */

function renderBreadcrumb(p) {
  const cat = p.category;
  const sub = p.subCategory;
  let html = '<nav class="pd-breadcrumb">';
  html += '<a href="/"><i class="fas fa-home"></i> Accueil</a>';
  html += '<span class="sep">/</span>';
  if (cat) {
    html += `<a href="/${encodeURIComponent(cat.toLowerCase())}/">${esc(cat)}</a>`;
    html += '<span class="sep">/</span>';
  }
  if (sub) {
    html += `<a href="/${encodeURIComponent(cat ? cat.toLowerCase() : '')}/${encodeURIComponent(sub.toLowerCase())}/">${esc(sub)}</a>`;
    html += '<span class="sep">/</span>';
  }
  html += `<span class="cur">${esc(p.name)}</span>`;
  html += '</nav>';
  return html;
}

function renderBadge(promo) {
  if (!promo) return "";
  return `<div class="pd-badge ${badgeClass(promo)}">${esc(promo)}</div>`;
}

function renderGallery(p) {
  let html = '<div class="pd-gallery">';
  html += `<div class="pd-img-wrap">`;
  html += renderBadge(p.promo);
  html += `<img id="pd-main" src="${esc(p.img || p.img2 || p.img3)}" alt="${esc(p.name)}" loading="eager">`;
  html += `</div>`;

  const thumbs = [p.img, p.img2, p.img3].filter(Boolean);
  if (thumbs.length > 1) {
    html += '<div class="pd-thumbs">';
    thumbs.forEach((u, i) => {
      html += `<img src="${esc(u)}" data-src="${esc(u)}" class="${i === 0 ? 'active' : ''}" alt="Vue ${i + 1}">`;
    });
    html += '</div>';
  }
  html += '</div>';
  return html;
}

function renderInfo(p) {
  const fullDesc = [p.description, p.desc2, p.desc3].filter(Boolean).join('<br><br>');
  const waMsg = `Bonjour, je suis intéressé par : ${p.name}`;
  const waLink = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(waMsg)}`;
  const catLink = p.category
    ? `<a href="/${encodeURIComponent(p.category.toLowerCase())}/">${esc(p.category)}</a>` : "";
  const subLink = p.subCategory
    ? ` / <span>${esc(p.subCategory)}</span>` : "";

  let html = '<div class="pd-info">';
  if (p.marque) html += `<span class="pd-brand">${esc(p.marque)}</span>`;
  html += `<h1 class="pd-title">${esc(p.name)}</h1>`;

  if (p.category || p.subCategory) {
    html += `<div class="pd-cat-line"><i class="fas fa-tags"></i> ${catLink}${subLink}</div>`;
  }

  html += `<p class="pd-desc">${fullDesc}</p>`;
  html += `<div class="pd-ref">Réf. ${esc(p.name)} — Sanitaire Al Houda 2</div>`;
  html += `<a class="pd-cta" href="${waLink}" target="_blank" rel="noopener"><i class="fab fa-whatsapp"></i> Demander le prix via WhatsApp</a>`;

  html += '<div class="pd-trust">';
  html += `<div class="pd-trust-item"><i class="fas fa-truck"></i><span>Livraison<br>tout le Maroc</span></div>`;
  html += `<div class="pd-trust-item"><i class="fas fa-hand-holding-dollar"></i><span>Paiement<br>à la livraison</span></div>`;
  html += `<div class="pd-trust-item"><i class="fas fa-headset"></i><span>Service<br>après-vente</span></div>`;
  html += '</div>';
  html += '</div>';
  return html;
}

function renderRelated(current, all) {
  const same = all.filter(
    (p) =>
      p.category === current.category &&
      p.name !== current.name &&
      p.img
  );
  const show = same.slice(0, 4);
  if (!show.length) return "";

  let html = '<section class="pd-related container">';
  html += '<h2>Produits similaires</h2>';
  html += '<div class="pd-related-grid">';

  show.forEach((p) => {
    const badgeHtml = p.promo
      ? `<span class="badge ${badgeClass(p.promo)}">${esc(p.promo)}</span>`
      : "";
    html += `<a class="pd-rel-card" href="/product.html?name=${encodeURIComponent(p.name)}">`;
    html += `<div class="img-wrap">${badgeHtml}`;
    html += `<img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy">`;
    html += '</div>';
    html += `<div class="pd-rel-info">`;
    html += `<div class="pd-rel-name">${esc(p.name)}</div>`;
    if (p.marque) html += `<div class="pd-rel-marque">${esc(p.marque)}</div>`;
    html += '</div></a>';
  });

  html += '</div></section>';
  return html;
}

function injectJSONLD(p) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": p.name,
    "image": [p.img, p.img2, p.img3].filter(Boolean),
    "brand": { "@type": "Brand", "name": p.marque || "Sanitaire Al Houda" },
    "category": [p.category, p.subCategory].filter(Boolean).join(" > "),
    "offers": {
      "@type": "Offer",
      "availability": "https://schema.org/InStock",
      "url": window.location.href,
      "seller": {
        "@type": "Store",
        "name": "Sanitaire Al Houda 2",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Laâyoune",
          "addressCountry": "MA"
        }
      }
    }
  };
  const el = document.getElementById("product-jsonld");
  if (el) el.textContent = JSON.stringify(data);
}

function injectMeta(p) {
  const desc = [p.description, p.desc2].filter(Boolean).join(' — ').substring(0, 160);
  if (desc) {
    let m = document.querySelector('meta[name="description"]');
    if (m) m.setAttribute('content', desc);
  }
  document.title = p.name + ' — Sanitaire Al Houda';
}

function renderProductPage(product, allProducts) {
  const container = document.getElementById("product-content");
  injectMeta(product);
  injectJSONLD(product);

  let html = renderBreadcrumb(product);
  html += '<div class="pd-layout">';
  html += renderGallery(product);
  html += renderInfo(product);
  html += '</div>';
  html += renderRelated(product, allProducts);

  container.innerHTML = html;

  // Thumb switching
  const mainImg = container.querySelector('#pd-main');
  container.querySelectorAll('.pd-thumbs img').forEach((t) => {
    t.addEventListener('click', () => {
      mainImg.style.opacity = '0.4';
      setTimeout(() => {
        mainImg.src = t.dataset.src;
        mainImg.style.opacity = '1';
        container.querySelectorAll('.pd-thumbs img').forEach(x => x.classList.remove('active'));
        t.classList.add('active');
      }, 150);
    });
  });
}

function showError(msg) {
  document.getElementById("product-content").innerHTML =
    `<div class="pd-msg"><i class="fas fa-exclamation-triangle"></i><p>${msg}</p></div>`;
}

/* ------------------------------------------------------------------
   INIT
   ------------------------------------------------------------------ */
async function loadProductDetails() {
  const params = new URLSearchParams(window.location.search);
  const productName = params.get("name");
  if (!productName) {
    showError("Aucun produit spécifié.");
    return;
  }

  try {
    const res = await fetch(CSV_URL);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const allProducts = parseRows(await res.text());

    const target = decode(productName).trim().toLowerCase();
    const product = allProducts.find(
      (p) => p.name.toLowerCase() === target
    );

    if (!product) {
      showError("Produit introuvable.");
      return;
    }

    renderProductPage(product, allProducts);
  } catch (err) {
    console.error(err);
    showError("Erreur de chargement — veuillez réessayer.");
  }
}

document.addEventListener("DOMContentLoaded", loadProductDetails);
