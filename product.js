async function loadProductDetails() {
  const params = new URLSearchParams(window.location.search);
  const productName = params.get("name");
  const CSV_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vR0qnUzNmU46GUWrjrFJNJUoV3jtOcfD0b7uK1Y_k-7ad0m1-0C_AGSdEL6Jgh1aonTLTYl3Z50SGq6/pub?output=csv";

  const contentDiv = document.getElementById("product-content");

  if (!productName) {
    contentDiv.innerHTML = "<h2>Produit non trouvé</h2>";
    return;
  }

  try {
    const res = await fetch(CSV_URL);
    const csvText = await res.text();
    const rows = csvText.split(/\r?\n/).filter((r) => r.trim());

    let product = null;

    // البحث داخل حلقة الـ for
    for (let i = 1; i < rows.length; i++) {
      const cols = rows[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);

      // 1. تنظيف الاسم القادم من CSV
      const nameFromCSV = cols[1]?.replace(/^"|"$/g, "").trim();

      // 2. مقارنة "ذكية": تحويل الطرفين لنص صغير وتجاهل المسافات الزائدة
      if (
        nameFromCSV &&
        decodeURIComponent(productName).trim().toLowerCase() ===
          nameFromCSV.toLowerCase()
      ) {
        product = {
          name: nameFromCSV,
          category: cols[2]?.replace(/^"|"$/g, "").trim(),
          subCategory: cols[3]?.replace(/^"|"$/g, "").trim(),
          marque: cols[4]?.replace(/^"|"$/g, "").trim(),
          description: cols[5]?.replace(/^"|"$/g, "").trim(),
          img: cols[6]?.replace(/^"|"$/g, "").trim(),
          desc2: cols[8]?.replace(/^"|"$/g, "").trim(),
          desc3: cols[9]?.replace(/^"|"$/g, "").trim(),
          img2: cols[10]?.replace(/^"|"$/g, "").trim(),
          img3: cols[11]?.replace(/^"|"$/g, "").trim(),
        };
        break;
      }
    }

    if (product) {
      renderProductPage(product);
    } else {
      contentDiv.innerHTML = `<h2>Produit "${productName}" non trouvé dans la base de données</h2>`;
    }
  } catch (error) {
    console.error("Erreur:", error);
    contentDiv.innerHTML = "<h2>Erreur de connexion au serveur</h2>";
  }
}

function renderProductPage(p) {
  const container = document.getElementById("product-content");
  container.innerHTML = `
        <div class="product-container" style="display: flex; flex-wrap: wrap; gap: 20px; direction: ltr;">
            <div class="product-gallery" style="flex: 1; min-width: 300px;">
                <img src="${p.img}" id="main-view" style="width: 100%; border-radius: 10px;">
                <div class="thumbnails" style="display: flex; gap: 10px; margin-top: 10px;">
                    <img src="${p.img}" onclick="updateImg('${p.img}', this)" class="thumb active" style="width: 60px; cursor: pointer; border: 2px solid #25D366;">
                    ${p.img2 ? `<img src="${p.img2}" onclick="updateImg('${p.img2}', this)" class="thumb" style="width: 60px; cursor: pointer;">` : ""}
                    ${p.img3 ? `<img src="${p.img3}" onclick="updateImg('${p.img3}', this)" class="thumb" style="width: 60px; cursor: pointer;">` : ""}
                </div>
            </div>
            <div class="product-info" style="flex: 1; min-width: 300px; text-align: left;">
                <span style="background: #eee; padding: 5px 10px; border-radius: 5px;">${p.marque || "Original"}</span>
                <h1 style="margin: 15px 0;">${p.name}</h1>
                <p>${p.description || ""}</p>
                <div style="margin: 20px 0; border-top: 1px solid #eee; padding-top: 10px;">
                    ${p.desc2 ? `<p><strong>Note:</strong> ${p.desc2}</p>` : ""}
                </div>
                <div class="actions" style="display: flex; gap: 10px;">
                    <a href="https://wa.me/212638069899?text=Je suis intéressé par: ${encodeURIComponent(p.name)}" 
                       style="background: #25D366; color: white; padding: 12px 25px; border-radius: 5px; text-decoration: none; font-weight: bold;">
                       Commander via WhatsApp
                    </a>
                </div>
            </div>
        </div>
    `;
}

function updateImg(url, el) {
  document.getElementById("main-view").src = url;
  document
    .querySelectorAll(".thumb")
    .forEach((t) => (t.style.borderColor = "transparent"));
  el.style.borderColor = "#25D366";
}

document.addEventListener("DOMContentLoaded", loadProductDetails);
