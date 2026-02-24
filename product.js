window.updateImg = function (url, el) {
    const mainView = document.getElementById("main-view");
    if (!mainView) return;

    mainView.src = url;

    document.querySelectorAll(".thumb").forEach((t) => {
        t.classList.remove("active-thumb");
    });

    el.classList.add("active-thumb");
};

async function loadProductDetails() {
    const params = new URLSearchParams(window.location.search);
    const productName = params.get("name");
    const contentDiv = document.getElementById("product-content");

    if (!productName) {
        contentDiv.innerHTML = "<h2 style='text-align:center;padding:50px;'>Produit non trouvé</h2>";
        return;
    }

    const CSV_URL =
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vR0qnUzNmU46GUWrjrFJNJUoV3jtOcfD0b7uK1Y_k-7ad0m1-0C_AGSdEL6Jgh1aonTLTYl3Z50SGq6/pub?output=csv";

    try {
        const res = await fetch(CSV_URL);
        if (!res.ok) throw new Error("Network error");

        const csvText = await res.text();
        const rows = csvText.split(/\r?\n/).filter(Boolean);

        const clean = (val) =>
            val ? val.replace(/^"|"$/g, "").trim() : "";

        let product = null;

        for (let i = 1; i < rows.length; i++) {
            const cols = rows[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            const nameFromCSV = clean(cols[1]);

            if (
                nameFromCSV &&
                decodeURIComponent(productName).trim().toLowerCase() ===
                    nameFromCSV.toLowerCase()
            ) {
                product = {
                    name: nameFromCSV,
                    category: clean(cols[2]),
                    subCategory: clean(cols[3]),
                    marque: clean(cols[4]),
                    description: clean(cols[5]),
                    img: clean(cols[6]),
                    desc2: clean(cols[8]),
                    img2: clean(cols[10]),
                    img3: clean(cols[11]),
                };
                break;
            }
        }

        if (!product) {
            contentDiv.innerHTML =
                "<h2 style='text-align:center;padding:50px;'>Produit introuvable</h2>";
            return;
        }

        renderProductPage(product);

    } catch (error) {
        console.error(error);
        contentDiv.innerHTML =
            "<h2 style='text-align:center;padding:50px;'>Erreur de chargement</h2>";
    }
}

function renderProductPage(p) {
    const container = document.getElementById("product-content");

    container.innerHTML = `
    <div class="product-container">
        <div class="product-gallery">
            <img src="${p.img}" id="main-view" class="main-img" alt="${p.name}">

            <div class="thumbnails">
                ${p.img ? `<img src="${p.img}" onclick="updateImg('${p.img}', this)" class="thumb active-thumb">` : ""}
                ${p.img2 ? `<img src="${p.img2}" onclick="updateImg('${p.img2}', this)" class="thumb">` : ""}
                ${p.img3 ? `<img src="${p.img3}" onclick="updateImg('${p.img3}', this)" class="thumb">` : ""}
            </div>
        </div>

        <div class="product-info">
            <span class="brand-label">${p.marque || "Original"}</span>
            <h1 class="p-title-detail">${p.name}</h1>

            <p class="p-desc">${p.description || ""}</p>

            <div class="extra-info">
                ${
                    p.desc2
                        ? `<div class="info-item">
                            <strong>Note:</strong>
                            <p>${p.desc2}</p>
                           </div>`
                        : ""
                }

                <div class="info-item">
                    <strong>Catégorie:</strong>
                    <p>${p.category || ""} / ${p.subCategory || ""}</p>
                </div>
            </div>

            <div class="actions">
                <a href="https://wa.me/212638069899?text=${encodeURIComponent(
                    "Je suis intéressé par: " + p.name
                )}"
                   class="btn-whatsapp-large"
                   target="_blank">
                    <i class="fab fa-whatsapp"></i>
                    Commander via WhatsApp
                </a>
            </div>
        </div>
    </div>
    `;
}

document.addEventListener("DOMContentLoaded", loadProductDetails);