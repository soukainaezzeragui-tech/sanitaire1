
/* ================================
   PRODUCTS FROM GOOGLE SHEETS
================================ */
async function loadCategorizedProducts() {
  const CSV_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vR0qnUzNmU46GUWrjrFJNJUoV3jtOcfD0b7uK1Y_k-7ad0m1-0C_AGSdEL6Jgh1aonTLTYl3Z50SGq6/pub?output=csv";

  try {
    const response = await fetch(CSV_URL);
    const csvText = await response.text();
    const rows = csvText.split(/\r?\n/).filter((r) => r.trim());

    // مصفوفة بالأقسام التي نريد تعبئتها
    const sections = {
      Bidet: document.getElementById("Bidet"),
      Meuble: document.getElementById("Meuble"),
      Robinetterie: document.getElementById("Robinetterie"),
      Miroir: document.getElementById("Miroir"),
      Evier: document.getElementById("Evier"),
    };

    // تفريغ المحتوى الحالي ووضع عدادات
    const counts = {};
    for (let key in sections) {
      if (sections[key]) {
        sections[key].innerHTML = "";
        counts[key] = 0;
      }
    }

    const limitPerSection = 4;

    for (let i = 1; i < rows.length; i++) {
      const cols = rows[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      if (cols.length < 8) continue;

      const pName = cols[1]?.replace(/"/g, "").trim();
      const pSubCat = cols[3]?.replace(/"/g, "").trim(); // الفئة الفرعية
      const pImg = cols[6]?.replace(/"/g, "").trim();
      const pStatus = cols[7]?.replace(/"/g, "").trim();

      if (pStatus !== "1") continue;

      // داخل حلقة التكرار في كود الـ JS الخاص بك، استبدل productHTML بهذا:
 const productHTML = `
  <div class="product-card">
    <div class="product-img-container"> 
      <img src="${pImg}" alt="${pName}" loading="lazy"> 
    </div> 
    
    <div class="product-info">
      <p class="p-category">${pSubCat}</p> 
      <h3 class="p-title">${pName}</h3> 
      <div class="product-action">
<a href="product.html?name=${encodeURIComponent(pName)}" class="btn-explore">Découvrir</a>
      </div>
    </div> 
  </div>`; // تأكد أن هذا هو الإغلاق الوحيد للكارت

      // تحديد القسم المناسب بناءً على الاسم أو الفئة الفرعية
      let targetSection = "";
      const textToSearch = (pName + " " + pSubCat).toLowerCase();

      if (textToSearch.includes("bidet")) targetSection = "Bidet";
      else if (textToSearch.includes("meuble")) targetSection = "Meuble";
      else if (textToSearch.includes("robinet")) targetSection = "Robinetterie";
      else if (textToSearch.includes("miroir")) targetSection = "Miroir";
      else if (textToSearch.includes("evier")) targetSection = "Evier";

      // الإضافة للقسم إذا وجد ولم يتجاوز العدد المسموح
      if (targetSection && counts[targetSection] < limitPerSection) {
        sections[targetSection].insertAdjacentHTML("beforeend", productHTML);
        counts[targetSection]++;
      }
    }
  } catch (error) {
    console.error("Error loading products:", error);
  }
}

document.addEventListener("DOMContentLoaded", loadCategorizedProducts);
// تشغيل الدالة عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", loadCategorizedProducts);
loadCategorizedProducts();

function commandeProduit(produit) {
  alert(
    `Vous avez demandé : ${produit}\nNous vous contacterons bientôt pour confirmer la commande.`,
  );
}

/* ================================
   MEGA MENU MOBILE
================================ */
function initMegaMenuMobile() {
  document.querySelectorAll(".has-mega > a").forEach((link) => {
    link.addEventListener("click", (e) => {
      if (window.innerWidth <= 992) {
        e.preventDefault();
        link.parentElement.classList.toggle("active");
      }
    });
  });
}

/* ================================
   INIT
================================ */
document.addEventListener("DOMContentLoaded", () => {
  initSlider();
  loadCategorizedProducts();
  initMegaMenuMobile();
});
/*----------------*/
function doSearch() {
    const input = document.getElementById("productSearch");
    const val = input ? input.value.trim() : "";
    
    // التوجه لصفحة البحث العامة لضمان رؤية كل النتائج
    window.location.href = `/products.html?search=${encodeURIComponent(val)}`;
}
function executeProductSearch(query) {
    if (!query) return ALL_PRODUCTS;

    const keywords = query.toLowerCase().split(" ").filter(k => k.length > 0);

    return ALL_PRODUCTS.filter(product => {
        // نجمع كل البيانات النصية للمنتج في مكان واحد للبحث فيها
        const searchableText = `
            ${product.name} 
            ${product.cat} 
            ${product.subCat} 
            ${product.brand || ''}
        `.toLowerCase();

        // يجب أن يحتوي المنتج على "كل" الكلمات التي كتبها المستخدم (أكثر دقة)
        // أو يمكنك استخدام .some ليكون البحث أوسع (أقل دقة)
        return keywords.every(word => searchableText.includes(word));
    });
}

function commandeProduit(produit) {
  const phoneNumber = "212638069899"; // ضع رقمك هنا مع رمز الدولة بدون "+"
  const message = `Bonjour, je souhaite commander le produit: ${produit}`;
  const encodedMessage = encodeURIComponent(message); // ترميز الرسالة لتكون صالحة للروابط
  const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

  window.open(whatsappURL, "_blank"); // يفتح رابط واتساب في تبويب جديد
}
