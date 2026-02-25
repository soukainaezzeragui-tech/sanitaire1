let ALL_PRODUCTS = []; 
let allProducts = [];   
let selectedCategory = null;
let selectedBrand = null;
let currentPage = 1;
const productsPerPage = 50;
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

        // --- منطق تحديد المسار والبحث المستقل ---
        const params = new URLSearchParams(window.location.search);
        const searchFromUrl = params.get("search")?.toLowerCase().trim() || null;
        const isSearchPage = window.location.pathname.includes("products.html");

        // تحديد اسم المجلد الحالي
        const pathSegments = window.location.pathname.split('/').filter(s => s.length > 0);
        let folderName = null;
        if (pathSegments.length > 0 && !pathSegments[pathSegments.length - 1].includes('.html')) {
            folderName = pathSegments[pathSegments.length - 1];
        } else if (pathSegments.length > 1) {
            folderName = pathSegments[pathSegments.length - 2];
        }

        if (folderName && !isSearchPage) {
            // نحن في مجلد قسم: نعرض القسم فقط ونتجاهل أي بحث في الرابط
            selectedCategory = folderName.replace(/-/g, ' '); 
            applyFilters(null); 
        } else if (isSearchPage) {
            // نحن في صفحة البحث العامة: نفعل البحث الشامل
            selectedCategory = null; 
            applyFilters(searchFromUrl);
        } else {
            // أي حالة أخرى (الصفحة الرئيسية مثلاً)
            applyFilters(null);
        }

    } catch (e) {
        console.error(e);
        grid.innerHTML = "<p>Erreur de chargement des données</p>";
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
    // تجهيز رابط صفحة التفاصيل بشكل آمن
    const detailPage = `../product.html?name=${encodeURIComponent(p.name)}`;
    
    // بناء هيكل الكرت
    const productHTML = `
        <div class="product-card">
            <a href="${detailPage}" class="product-link-wrapper">
                <div class="product-img">
                    <img src="${p.img}" alt="${p.name}" loading="lazy" 
                         onerror="this.src='https://via.placeholder.com/250?text=AlHouda'">
                </div>
                <p class="p-category">${p.subCat}</p>
                <h3 class="p-title">${p.name}</h3>
            </a>
            
<a href="${detailPage}" class="p-detail-btn">
              Voir plus
            </a>
        </div>
    `;
    
    grid.insertAdjacentHTML("beforeend", productHTML);
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
function applyFilters(searchQuery = null) {
    const isSearchPage = window.location.pathname.includes("products.html");

    if (isSearchPage && searchQuery) {
        // البحث يعمل فقط في صفحة products.html ويبحث في كل المنتجات
        allProducts = executeProductSearch(searchQuery, ALL_PRODUCTS);
    } else {
        // في صفحات الأقسام: نلتزم بالفلترة حسب المجلد فقط
        allProducts = ALL_PRODUCTS.filter((p) => {
            if (!selectedCategory) return true;
            return (p.cat === selectedCategory || p.subCat === selectedCategory);
        });
    }

    // فلترة الماركة (تعمل كإضافة)
    if (selectedBrand) {
        allProducts = allProducts.filter(p => p.brand && p.brand.toLowerCase() === selectedBrand);
    }

    currentPage = 1;
    displayProducts();
}

function executeProductSearch(query, dataToSearch) {
    const keywords = query.toLowerCase().split(/\s+/).filter(k => k.length > 0);
    return dataToSearch.filter(product => {
        const searchableText = `${product.name} ${product.cat} ${product.subCat} ${product.brand || ''}`.toLowerCase();
        return keywords.every(word => searchableText.includes(word));
    });
}
function clearCategoryFilter() {
  selectedCategory = null;
  selectedBrand = null;
  applyFilters();
}
function executeProductSearch(query, dataToSearch) {
    // إذا لم يكن هناك استعلام، نرجع البيانات كما هي
    if (!query || query.trim() === "") return dataToSearch;

    const keywords = query.toLowerCase().split(/\s+/).filter(k => k.length > 0);

    return dataToSearch.filter(product => {
        const searchableText = `
            ${product.name} 
            ${product.cat} 
            ${product.subCat} 
            ${product.brand || ''}
        `.toLowerCase();

        // يجب أن يجد كل الكلمات المطلوبة
        return keywords.every(word => searchableText.includes(word));
    });
}
function doSearch() {
    const input = document.getElementById("productSearch");
    const val = input ? input.value.trim() : "";
    if (val) {
        // توجيه إجباري لصفحة البحث المستقلة
        window.location.href = `/products.html?search=${encodeURIComponent(val)}`;
    }
}
document.addEventListener("DOMContentLoaded", loadCategorizedProducts);
