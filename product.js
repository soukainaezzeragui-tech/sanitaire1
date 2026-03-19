// تحسين: دمج الدالتين المتكررتين updateImg في دالة واحدة محدثة
window.updateImg = function (url, el) {
    const mainView = document.getElementById("main-view");
    if (!mainView) return;

    // بدلاً من تعديل opacity يدوياً، يمكن استخدام fade بسيط أو تغيير المصدر مباشرة مع transition
    // لكن الفكرة الحالية جيدة، تم تحسينها قليلاً
    
    // التأكد من أن الـ thumbnail الجديد ليس هو نفسه القديم
    const currentActive = document.querySelector(".thumb.active-thumb");
    if (currentActive === el) return; // لا تفعل شيء إذا كان نفس الصورة
    
    mainView.style.transition = "opacity 0.2s ease";
    mainView.style.opacity = "0.5";

    setTimeout(() => {
        mainView.src = url;
        mainView.style.opacity = "1";
    }, 150);

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
        const rows = csvText.split(/\r?\n/).filter(row => row.trim() !== ""); // تحسين: تجاهل الأسطر الفارغة

        const clean = (val) =>
            val ? val.replace(/^"|"$/g, "").trim() : "";

        let product = null;
        const decodedProductName = decodeURIComponent(productName).trim().toLowerCase();

        for (let i = 1; i < rows.length; i++) {
            const cols = rows[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            const nameFromCSV = clean(cols[1]);

            if (nameFromCSV && decodedProductName === nameFromCSV.toLowerCase()) {
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
        console.error("Error loading product:", error);
        contentDiv.innerHTML = `
            <div style='text-align:center;padding:50px;'>
                <h2>Erreur de chargement</h2>
                <p style='color:#666;'>Veuillez réessayer plus tard.</p>
            </div>
        `;
    }
}

function renderProductPage(p) {
    const container = document.getElementById("product-content");

    // تحسين: التأكد من وجود الصور قبل عرضها
    const images = [
        { url: p.img, active: true },
        { url: p.img2, active: false },
        { url: p.img3, active: false }
    ].filter(img => img.url && img.url.trim() !== ""); // إزالة الصور الفارغة

    // تحسين: إنشاء الـ thumbnails بناءً على الصور المتاحة فقط
    const thumbnailsHtml = images.map((img, index) => {
        return `<img src="${img.url}" onclick="updateImg('${img.url}', this)" class="thumb ${index === 0 ? 'active-thumb' : ''}">`;
    }).join('');

    // تحسين: معالجة النص الطويل في desc2 (تقسيم إلى أسطر إذا كان يحتوي على نقاط)
    const formatDescription = (text) => {
        if (!text) return '';
        // إذا كان النص يحتوي على رموز مثل 🔧 أو • أو - نقوم بتنسيقه
        if (text.includes('🔧') || text.includes('•') || text.includes(' - ')) {
            return text.split(/\n|•|🔧|🔄|⚡|⚖️/).filter(line => line.trim()).map(line => 
                `<span style="display: block; margin-bottom: 8px;">${line.trim()}</span>`
            ).join('');
        }
        return text;
    };

    container.innerHTML = `
    <div class="product-container">
        <div class="product-gallery" id="zoom-container">
            <img src="${p.img}" id="main-view" class="main-img" alt="${p.name.replace(/"/g, '&quot;')}">
            <div class="thumbnails">
                ${thumbnailsHtml}
            </div>
        </div>
        <div class="product-info">
            <span class="brand-label">${p.marque || "Original"}</span>
            <h1 class="p-title-detail">${p.name}</h1>
            ${p.description ? `<p class="p-desc">${p.description}</p>` : ''}
            ${p.desc2 ? `<div class="p-desc technical-desc">${formatDescription(p.desc2)}</div>` : ''}
            <div class="actions">
                <a href="https://wa.me/212667361575?text=${encodeURIComponent("Je suis intéressé par: " + p.name)}"
                   class="btn-whatsapp-large" target="_blank" rel="noopener noreferrer">
                    <i class="fab fa-whatsapp"></i> Commander via WhatsApp
                </a>
            </div>
            <div class="info-item">
                <i class="fas fa-tags" style="color: #25D366; margin-right: 8px;"></i>
                <strong>Catégorie:</strong>
                <span>${p.category || ""} ${p.subCategory ? '/ ' + p.subCategory : ''}</span>
            </div>
        </div>
    </div>
    `;

    // تفعيل الزوم بعد إضافة العناصر للـ DOM
    initZoom();
}

function initZoom() {
    const gallery = document.getElementById('zoom-container');
    const mainImg = document.getElementById('main-view');

    if (!gallery || !mainImg) return;

    let zoomActive = false;
    
    // تحسين: تشغيل الزوم فقط عندما يكون عرض الشاشة أكبر من 768px (مناسب للموبايل)
    const isDesktop = window.innerWidth > 768;
    
    if (!isDesktop) return; // إلغاء الزوم على الموبايل

    gallery.addEventListener('mousemove', (e) => {
        const rect = gallery.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // تحسين: التأكد أن الإحداثيات داخل الصورة
        if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
            const xPercent = (x / rect.width) * 100;
            const yPercent = (y / rect.height) * 100;
            
            mainImg.style.transformOrigin = `${xPercent}% ${yPercent}%`;
            mainImg.style.transform = "scale(1.8)"; // زيادة التكبير قليلاً
        }
    });

    gallery.addEventListener('mouseleave', () => {
        mainImg.style.transform = "scale(1)";
        mainImg.style.transformOrigin = "center center";
    });
    
    // تحسين: دعم اللمس للموبايل (تكبير عند النقر المزدوج)
    gallery.addEventListener('dblclick', (e) => {
        e.preventDefault();
        if (mainImg.style.transform === "scale(1.8)") {
            mainImg.style.transform = "scale(1)";
        } else {
            const rect = gallery.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width * 100;
            const y = (e.clientY - rect.top) / rect.height * 100;
            mainImg.style.transformOrigin = `${x}% ${y}%`;
            mainImg.style.transform = "scale(1.8)";
        }
    });
}

// تحسين: إضافة مستمع لإعادة تهيئة الزوم عند تغيير حجم النافذة
window.addEventListener('resize', () => {
    // إعادة تعيين transform إذا أصبحنا على شاشة صغيرة
    if (window.innerWidth <= 768) {
        const mainImg = document.getElementById('main-view');
        if (mainImg) {
            mainImg.style.transform = "scale(1)";
        }
    }
});

document.addEventListener("DOMContentLoaded", loadProductDetails);

    // تفعيل الزوم بعد إضافة العناصر للـ DOM
    initZoom();
}

function initZoom() {
    const gallery = document.getElementById('zoom-container');
    const mainImg = document.getElementById('main-view');

    if (!gallery || !mainImg) return;

    gallery.addEventListener('mousemove', (e) => {
        // حساب موقع الفأرة بالنسبة للحاوية
        const rect = gallery.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        mainImg.style.transformOrigin = `${x}px ${y}px`;
        mainImg.style.transform = "scale(1.5)"; // درجة التكبير
    });

    gallery.addEventListener('mouseleave', () => {
        mainImg.style.transform = "scale(1)";
        mainImg.style.transformOrigin = "center center";
    });
}


document.addEventListener("DOMContentLoaded", loadProductDetails);
