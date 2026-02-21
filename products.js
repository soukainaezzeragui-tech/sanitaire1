let ALL_PRODUCTS = []; // لتخزين البيانات الأصلية كاملة
let allProducts = [];   // للمنتجات المعروضة بعد الفلترة
let selectedCategory = null;
let selectedBrand = null;
let currentPage = 1;
const productsPerPage = 50;
async function loadCategorizedProducts() {
    const grid = document.getElementById("products");
    grid.innerHTML = `<div class="skeleton-card"></div>`.repeat(4);

    const params = new URLSearchParams(window.location.search);
    const catFromUrl = params.get("cat")?.toLowerCase().trim();
    const searchFromUrl = params.get("search")?.toLowerCase().trim();

    const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR0qnUzNmU46GUWrjrFJNJUoV3jtOcfD0b7uK1Y_k-7ad0m1-0C_AGSdEL6Jgh1aonTLTYl3Z50SGq6/pub?output=csv";

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
            const brand = cols[4]?.replace(/"/g, "").trim(); 
            let img = cols[6]?.replace(/"/g, "").trim();
            const status = cols[7]?.replace(/"/g, "").trim();

            if (!status) continue;

            if (img.includes("cloudinary.com")) {
                img = img.replace("/upload/", "/upload/w_400,q_auto,f_auto/");
            }

            ALL_PRODUCTS.push({
                name,
                cat,
                subCat,
                brand,
                img,
                status: parseInt(status),
            });
        }

        // الترتيب
        ALL_PRODUCTS.sort((a, b) => a.status - b.status);

        // تفعيل الفلترة بناءً على الرابط (URL)
        applyFilters(catFromUrl, searchFromUrl);

    } catch (e) {
        console.error(e);
        grid.innerHTML = "<p>خطأ في تحميل البيانات</p>";
    }
}

function displayProducts() {
    const grid = document.getElementById("products");
    grid.innerHTML = "";

    if (allProducts.length === 0) {
        grid.innerHTML = "<p style='padding:40px; text-align:center;'>عذراً، لم يتم العثور على نتائج للبحث.</p>";
        return;
    }

    const start = (currentPage - 1) * productsPerPage;
    const end = start + productsPerPage;
    const paginatedProducts = allProducts.slice(start, end);

    paginatedProducts.forEach((p) => {
        const detailPage = `product.html?name=${encodeURIComponent(p.name)}`;
        grid.insertAdjacentHTML("beforeend", `
            <div class="product-card">
                <div class="product-img" onclick="location.href='${detailPage}'">
                    <img src="${p.img}" loading="lazy" onerror="this.src='https://via.placeholder.com/250?text=AlHouda'">
                </div>
                <p class="p-category">${p.subCat}</p>
                <h3 class="p-title" onclick="location.href='${detailPage}'">${p.name}</h3>
                <button class="p-whatsapp" onclick="commandeProduit('${p.name}')">
                    <i class="fab fa-whatsapp"></i> WhatsApp
                </button>
            </div>
        `);
    });

    renderPagination();
}
function filterProducts(categoryName) {
  selectedCategory = categoryName.toLowerCase();
  applyFilters();
}


function renderPagination() {
  const oldPagination = document.querySelector(".pagination");
  if (oldPagination) oldPagination.remove();

  const totalPages = Math.ceil(allProducts.length / productsPerPage);
  if (totalPages <= 1) return;

  let paginationHTML = '<div class="pagination">';

  for (let i = 1; i <= totalPages; i++) {
    paginationHTML += `
      <button onclick="changePage(${i})"
        class="${i === currentPage ? 'active' : ''}">
        ${i}
      </button>
    `;
  }

  paginationHTML += '</div>';

  document
    .querySelector(".products-section .container")
    .insertAdjacentHTML("beforeend", paginationHTML);
}
function commandeProduit(name) {
  const msg = encodeURIComponent("Bonjour, je veux ce produit: " + name);
  window.open(`https://wa.me/212638069899?text=${msg}`);
}
function changePage(page) {
  currentPage = page;
  displayProducts();
}
function filterBrand(brandName) {
  selectedBrand = brandName.toLowerCase();
  applyFilters();
}
function applyFilters(cat = null, search = null) {
    // تحديث المتغيرات العامة إذا تم تمرير قيم جديدة
    if (cat) selectedCategory = cat.toLowerCase();
    
    // الفلترة الفعلية للمصفوفة
    allProducts = ALL_PRODUCTS.filter((p) => {
        let catMatch = true;
        let searchMatch = true;
        let brandMatch = true;

        // فلترة القسم
        if (selectedCategory) {
            catMatch = p.cat === selectedCategory || p.subCat === selectedCategory;
        }

        // فلترة البحث (الاسم)
        if (search) {
            searchMatch = p.name.toLowerCase().includes(search.toLowerCase());
        }

        // فلترة الماركة
        if (selectedBrand) {
            brandMatch = p.brand && p.brand.toLowerCase() === selectedBrand;
        }

        return catMatch && searchMatch && brandMatch;
    });

    currentPage = 1;
    displayProducts();
}
function applyFilters() {
  allProducts = ALL_PRODUCTS.filter((p) => {
    let catMatch = true;
    let brandMatch = true;

    if (selectedCategory) {
      catMatch =
        p.cat === selectedCategory || p.subCat === selectedCategory;
    }

    if (selectedBrand) {
      brandMatch = p.brand && p.brand.toLowerCase() === selectedBrand;
    }

    return catMatch && brandMatch;
  });

  currentPage = 1;
  displayProducts();
}
function clearCategoryFilter() {
  selectedCategory = null;
  selectedBrand = null;
  applyFilters();
}


document.addEventListener("DOMContentLoaded", loadCategorizedProducts);

// كود يوضع في صفحة products.html
const urlParams = new URLSearchParams(window.location.search);
const searchTerm = urlParams.get('search');

if (searchTerm) {
    console.log("المستخدم يبحث عن: " + searchTerm);
    // هنا تقوم بتصفية المصفوفة الخاصة بمنتجاتك وعرض النتائج التي تحتوي على searchTerm
}