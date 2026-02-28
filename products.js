let ALL_PRODUCTS = [];
let allProducts = [];
let selectedCategory = null;
let selectedBrand = null;
let currentPage = 1;
const productsPerPage = 50;

// Helper to get URL Params
const getUrlParam = (key) => new URLSearchParams(window.location.search).get(key);
const CATEGORY_MAP = {
  "salle-de-bain": "sanitaire",
};
function getCategoryFromPath() {
  const path = window.location.pathname;
  const parts = path.split("/").filter(Boolean);

  if (parts.length === 0) return null;

  const slug = parts[parts.length - 1].toLowerCase();

  // تحويل slug إلى cat الحقيقي إن وجد في الخريطة
  return CATEGORY_MAP[slug] || slug;
}
async function loadCategorizedProducts() {
  const grid = document.getElementById("products");
  if (!grid) return;
  grid.innerHTML = `<div class="skeleton-card"></div>`.repeat(4);

  const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR0qnUzNmU46GUWrjrFJNJUoV3jtOcfD0b7uK1Y_k-7ad0m1-0C_AGSdEL6Jgh1aonTLTYl3Z50SGq6/pub?output=csv";

  try {
    const res = await fetch(CSV_URL);
    const csvText = await res.text();
    const rows = csvText.split(/\r?\n/).filter((r) => r.trim());

    ALL_PRODUCTS = [];
    for (let i = 1; i < rows.length; i++) {
      const cols = rows[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      if (cols.length < 8) continue;

      ALL_PRODUCTS.push({
        name: cols[1]?.replace(/"/g, "").trim(),
        cat: cols[2]?.replace(/"/g, "").trim().toLowerCase(),
        subCat: cols[3]?.replace(/"/g, "").trim().toLowerCase(),
        brand: cols[4]?.replace(/"/g, "").trim(),
        img: cols[6]?.replace(/"/g, "").trim(),
        status: parseInt(cols[7]) || 0,
      });
    }

    ALL_PRODUCTS.sort((a, b) => a.status - b.status);
    selectedCategory = getCategoryFromPath();
    applyFilters(); 
const hash = window.location.hash.replace('#', '');
        if (hash) {
            filterProducts(hash);
        } else {
            allProducts = [...ALL_PRODUCTS];
            displayProducts();
        }
  } catch (e) {
    console.error("Fetch Error:", e);
    grid.innerHTML = "<p>Erreur de chargement des données</p>";
  }
}

function applyFilters() {
  const searchFromUrl = getUrlParam("search");
  
  // 1. Start with search results or all products
  let results = searchFromUrl 
    ? executeProductSearch(searchFromUrl, ALL_PRODUCTS) 
    : [...ALL_PRODUCTS];

  // 2. Apply Category Filter
  if (selectedCategory) {
    results = results.filter(p => p.cat === selectedCategory || p.subCat === selectedCategory);
  }

  // 3. Apply Brand Filter
  if (selectedBrand) {
    results = results.filter(p => p.brand && p.brand.toLowerCase() === selectedBrand.toLowerCase());
  }

  allProducts = results;
  currentPage = 1;
  displayProducts();
}

function executeProductSearch(query, dataToSearch) {
  if (!query) return dataToSearch;
  const keywords = query.toLowerCase().split(/\s+/).filter(k => k.length > 0);

  return dataToSearch.filter((product) => {
    const text = `${product.name} ${product.cat} ${product.subCat} ${product.brand || ""}`.toLowerCase();
    // Using .every ensures all search words must be present
    return keywords.every((word) => text.includes(word));
  });
}

function displayProducts() {
  const grid = document.getElementById("products");
  if (!grid) return;
  grid.innerHTML = "";

  if (allProducts.length === 0) {
    grid.innerHTML = "<p style='padding:40px; text-align:center;'>Aucun produit trouvé.</p>";
    return;
  }

  const start = (currentPage - 1) * productsPerPage;
  const paginatedProducts = allProducts.slice(start, start + productsPerPage);

  const html = paginatedProducts.map(p => `
    <div class="product-card">
        <a href="../product.html?name=${encodeURIComponent(p.name)}" class="product-link-wrapper">
            <div class="product-img">
                <img src="${p.img}" alt="${p.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/250?text=AlHouda'">
            </div>
            <p class="p-category">${p.subCat}</p>
            <h3 class="p-title">${p.name}</h3>
        </a>
        <a href="../product.html?name=${encodeURIComponent(p.name)}" class="p-detail-btn">Voir plus</a>
    </div>
  `).join('');

  grid.innerHTML = html;
  renderPagination();
}

function renderPagination() {
  const container = document.querySelector(".products-section .container");
  const oldPagination = document.querySelector(".pagination");
  if (oldPagination) oldPagination.remove();

  const totalPages = Math.ceil(allProducts.length / productsPerPage);
  if (totalPages <= 1) return;

  let paginationHTML = '<div class="pagination">';
  for (let i = 1; i <= totalPages; i++) {
    paginationHTML += `<button onclick="changePage(${i})" class="${i === currentPage ? 'active' : ''}">${i}</button>`;
  }
  paginationHTML += '</div>';

  container.insertAdjacentHTML("beforeend", paginationHTML);
}

// User Interaction Functions
function changePage(page) {
  currentPage = page;
  displayProducts();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function filterProducts(categoryName) {
  selectedCategory = categoryName ? categoryName.toLowerCase() : null;
  applyFilters();
}

function filterBrand(brandName) {
  selectedBrand = brandName ? brandName.toLowerCase() : null;
  applyFilters();
}

function doSearch() {
  const input = document.getElementById("productSearch");
  if (input?.value.trim()) {
    window.location.href = `/products.html?search=${encodeURIComponent(input.value.trim())}`;
  }
}


document.addEventListener("DOMContentLoaded", loadCategorizedProducts);
