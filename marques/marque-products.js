    function getMarqueFromURL() {
      const params = new URLSearchParams(window.location.search);
      let marque = params.get("marque");

      if (!marque) {
        const pathParts = window.location.pathname.split("/");
        marque = pathParts[pathParts.length - 2];
      }

      return marque;
    }

    const slug = getMarqueFromURL();
const marqueName = slug
  ? slug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())
  : "Marque";

const updateElement = (id, text, attr = "textContent") => {
    const el = document.getElementById(id);
    if (el) {
        if (attr === "textContent") el.textContent = text;
        else el.setAttribute(attr, text);
    }
};

updateElement("marque-title", `Produits ${marqueName} à Laâyoune`);
updateElement("marque-description", `Découvrez tous les produits de la marque ${marqueName} disponibles chez SANITAIRE AL HOUDA II.`);
updateElement("breadcrumb-marque", marqueName);
document.title = `${marqueName} à Laâyoune | SANITAIRE AL HOUDA II`;

updateElement("meta-description", `Produits ${marqueName} à Laâyoune : qualité professionnelle, prix compétitifs.`, "content");
updateElement("meta-keywords", `${marqueName}, sanitaire ${marqueName}, robinetterie ${marqueName}`, "content");
updateElement("canonical-link", window.location.href, "href");

// 3️⃣ دالة تحميل المنتجات المعدلة
async function loadProductsByMarque() {
  const container = document.getElementById("products");
  if (!container) return;

  // إظهار رسالة تحميل بسيطة
  container.innerHTML = "<p>Chargement des produits...</p>";

  const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR0qnUzNmU46GUWrjrFJNJUoV3jtOcfD0b7uK1Y_k-7ad0m1-0C_AGSdEL6Jgh1aonTLTYl3Z50SGq6/pub?output=csv";

  try {
    const response = await fetch(CSV_URL);
    if (!response.ok) throw new Error("Network response was not ok");
    
    const data = await response.text();
    
    // تقسيم الصفوف مع تجنب الأسطر الفارغة
    const rows = data.split(/\r?\n/).filter(row => row.trim());

    container.innerHTML = ""; // مسح رسالة التحميل

    // حلقة التكرار (تبدأ من 1 لتخطي العنوان)
    for (let i = 1; i < rows.length; i++) {
      // استخدام Regex للتقسيم الصحيح للأعمدة التي تحتوي على فواصل داخل نصوصها
      const cols = rows[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      
      const name = cols[1]?.replace(/"/g, "").trim();
      const rowMarque = cols[4]?.replace(/"/g, "").trim(); // عمود الماركة
      const image = cols[6]?.replace(/"/g, "").trim();    // عمود الصورة (تأكد من رقم العمود 6 أو 7 حسب ملفك)

      if (!rowMarque) continue;

      // تحويل ماركة الصف الحالي إلى slug للمقارنة
      const currentMarqueSlug = rowMarque.toLowerCase().replace(/\s+/g, "-");

      if (currentMarqueSlug === slug) {
        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
          <div class="product-img">
            <img src="${image}" alt="${name}" onerror="this.src='https://via.placeholder.com/250?text=No+Image'">
          </div>
          <h3 class="p-title">${name}</h3>
          <a href="../product.html?name=${encodeURIComponent(name)}" class="p-detail-btn">Voir plus</a>
        `;
        container.appendChild(card);
      }
    }
    
    // إذا لم يتم العثور على أي منتج لهذه الماركة
    if (container.innerHTML === "") {
        container.innerHTML = `<p style="text-align:center; grid-column: 1/-1; padding: 50px;">Aucun produit trouvé pour la marque "${marqueName}".</p>`;
    }

  } catch (error) {
    console.error("Error loading products:", error);
    container.innerHTML = "<p>Erreur lors du chargement des données. Veuillez réessayer.</p>";
  }
}

// 4️⃣ التنفيذ
document.addEventListener("DOMContentLoaded", loadProductsByMarque);