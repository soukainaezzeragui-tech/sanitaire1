/* ================================
   SLIDER DATA
================================ */
const sliderImages = [
  {
    src: "images/cat1.jpg",
    title: "Salle de bain",
    desc: "Meubles et accessoires de salle de bain premium",
  },
  {
    src: "images/cat2.jpg",
    title: "Sanitaire",
    desc: "Équipements sanitaires modernes et durables",
  },
  {
    src: "images/cat3.jpg",
    title: "Peinture",
    desc: "Peintures et revêtements muraux haute qualité",
  },
  {
    src: "images/cat4.jpg",
    title: "Accessoires",
    desc: "Accessoires de construction et décoration",
  },
  {
    src: "images/cat5.jpg",
    title: "Électricité",
    desc: "Matériel électrique professionnel",
  },
  {
    src: "images/cat6.jpg",
    title: "Outillage",
    desc: "Outils professionnels pour tous vos travaux",
  },
  {
    src: "images/cat7.jpg",
    title: "Plomberie",
    desc: "Tuyaux, raccords et équipements de plomberie",
  },
  {
    src: "images/cat8.jpg",
    title: "Construction",
    desc: "Matériaux de construction de première qualité",
  },
  {
    src: "images/cat9.jpg",
    title: "Cuisine",
    desc: "Équipements et accessoires de cuisine modernes",
  },
];

let currentIndex = 0;
let autoSlideInterval;

/* ================================
   SLIDER FUNCTIONS
================================ */
function initSlider() {
  const indicatorsContainer = document.getElementById("indicators");
  if (!indicatorsContainer) return;

  indicatorsContainer.innerHTML = "";

  sliderImages.forEach((_, index) => {
    const indicator = document.createElement("div");
    indicator.className = `indicator ${index === currentIndex ? "active" : ""}`;
    indicator.addEventListener("click", () => changeImage(index));
    indicatorsContainer.appendChild(indicator);
  });

  changeImage(0);
  startAutoSlide();
}

function changeImage(index) {
  currentIndex = index;

  const mainImage = document.getElementById("mainImage");
  const slideTitle = document.getElementById("slideTitle");
  const slideDesc = document.getElementById("slideDesc");

  if (mainImage) {
    mainImage.src = sliderImages[index].src;
    mainImage.alt = sliderImages[index].title;
  }
  if (slideTitle) slideTitle.textContent = sliderImages[index].title;
  if (slideDesc) slideDesc.textContent = sliderImages[index].desc;

  document.querySelectorAll(".indicator").forEach((ind, i) => {
    ind.classList.toggle("active", i === index);
  });
}

function startAutoSlide() {
  clearInterval(autoSlideInterval);
  autoSlideInterval = setInterval(() => {
    currentIndex = (currentIndex + 1) % sliderImages.length;
    changeImage(currentIndex);
  }, 4000);
}

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
         <a href="product-details.html?id=${i}" class="btn-explore">Découvrir</a>
      </div>
    </div> 
  </div>`; // تأكد أن هذا هو الإغلاق الوحيد للكارت

      // تحديد القسم المناسب بناءً على الاسم أو الفئة الفرعية
      let targetSection = "";
      const textToSearch = (pName + " " + pSubCat).toLowerCase();

      if (textToSearch.includes("bidet")) targetSection = "Bidet";
      else if (textToSearch.includes("meuble")) targetSection = "Meuble";
      else if (textToSearch.includes("robinet")) targetSection = "Robinetterie";
      else if (textToSearch.includes("Miroir")) targetSection = "Miroir";
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


function commandeProduit(produit) {
  const phoneNumber = "212638069899"; // ضع رقمك هنا مع رمز الدولة بدون "+"
  const message = `Bonjour, je souhaite commander le produit: ${produit}`;
  const encodedMessage = encodeURIComponent(message); // ترميز الرسالة لتكون صالحة للروابط
  const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

  window.open(whatsappURL, "_blank"); // يفتح رابط واتساب في تبويب جديد
}
