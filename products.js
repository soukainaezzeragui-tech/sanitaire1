let ALL_PRODUCTS = [];

async function loadCategorizedProducts() {
  const grid = document.getElementById("products");

  grid.innerHTML = `
    <div class="skeleton-card"></div>
    <div class="skeleton-card"></div>
    <div class="skeleton-card"></div>
    <div class="skeleton-card"></div>
  `;

  const params = new URLSearchParams(window.location.search);
  const selectedCat = params.get("cat")?.toLowerCase().trim();

  const CSV_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vR0qnUzNmU46GUWrjrFJNJUoV3jtOcfD0b7uK1Y_k-7ad0m1-0C_AGSdEL6Jgh1aonTLTYl3Z50SGq6/pub?output=csv";

  try {
    const res = await fetch(CSV_URL);
    const csvText = await res.text();
    const rows = csvText.split(/\r?\n/).filter((r) => r.trim());

    ALL_PRODUCTS = [];

    for (let i = 1; i < rows.length; i++) {
      const cols = rows[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      if (cols.length < 8) continue;

      const name = cols[1]?.replace(/"/g, "").trim();
      const cat = cols[2]?.replace(/"/g, "").trim().toLowerCase();
      const subCat = cols[3]?.replace(/"/g, "").trim().toLowerCase();
      let img = cols[6]?.replace(/"/g, "").trim();
      const status = cols[7]?.replace(/"/g, "").trim();

      if (!status) continue;

      if (selectedCat && cat !== selectedCat && subCat !== selectedCat)
        continue;

      if (img.includes("cloudinary.com")) {
        img = img.replace("/upload/", "/upload/w_400,q_auto,f_auto/");
      }

      ALL_PRODUCTS.push({
        name,
        cat,
        subCat,
        img,
        status: parseInt(status),
      });
    }

    // ترتيب حسب status
    ALL_PRODUCTS.sort((a, b) => a.status - b.status);

    renderProducts(ALL_PRODUCTS);
  } catch (e) {
    console.error(e);
    grid.innerHTML = "<p>خطأ تحميل</p>";
  }
}

function renderProducts(list) {
  const grid = document.getElementById("products");
  grid.innerHTML = "";

  if (list.length === 0) {
    grid.innerHTML = "<p style='padding:40px'>لا توجد منتجات</p>";
    return;
  }

  list.forEach((p) => {
    const detailPage = `product.html?name=${encodeURIComponent(p.name)}`;

    grid.insertAdjacentHTML(
      "beforeend",
      `
      <div class="product-card">
        <div class="product-img" onclick="location.href='${detailPage}'">
          <img src="${p.img}" loading="lazy"
          onerror="this.src='https://via.placeholder.com/250?text=AlHouda'">
        </div>

        <p class="p-category">${p.subCat}</p>

        <h3 class="p-title" onclick="location.href='${detailPage}'">
          ${p.name}
        </h3>

        <button class="p-whatsapp" onclick="commandeProduit('${p.name}')">
          <i class="fab fa-whatsapp"></i> WhatsApp
        </button>
      </div>
    `
    );
  });
}

/* 🔵 هذه الدالة كانت ناقصة — هي سبب المشكلة */
function filterProducts(categoryName) {
  categoryName = categoryName.toLowerCase();

  const filtered = ALL_PRODUCTS.filter(
    (p) => p.cat === categoryName || p.subCat === categoryName
  );

  renderProducts(filtered);
}

function commandeProduit(name) {
  const msg = encodeURIComponent("Bonjour, je veux ce produit: " + name);
  window.open(`https://wa.me/212638069899?text=${msg}`);
}

document.addEventListener("DOMContentLoaded", loadCategorizedProducts);
