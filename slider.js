document.addEventListener("DOMContentLoaded", function () {
  const sliderData = [
    {
      src: "images/ms-ourstore.webp",
      title: "Visitez notre magasin",
      subtitle: "Découvrez des produits de qualité et un service de confiance",
      link: "/contact",
    },
    {
      src: "images/ms-sallebain.webp",
      title: "Salle de bain moderne",
      subtitle: "Design élégant et équipements de haute qualité",
      link: "/salle-de-bain",
    },
    {
      src: "images/ms-outilage.webp",
      title: "Outillage professionnel",
      subtitle: "Des outils fiables pour tous vos projets",
      link: "/bricolage",
    },
    {
      src: "images/ms-doorphone.webp",
      title: "Interphones & sécurité",
      subtitle: "Contrôle d’accès moderne et protection optimale",
      link: "https://wa.me/212667361575",
    },
    {
      src: "images/ms-electrisite.webp",
      title: "Électricité & éclairage",
      subtitle: "Solutions performantes pour vos installations",
      link: "/electricite",
    },

  ];


  let currentIndex = 0;
  let autoSlideInterval = null;
  const SLIDE_DELAY = 5000; // 5 ثوانٍ لكل صورة

  const mainImage = document.getElementById("mainImage");
  const imageTitle = document.getElementById("imageTitle");
  const subtitle = document.getElementById("imageSubtitle");
  const sliderBtn = document.getElementById("sliderBtn");
  const slideContainer = document.querySelector(".slide");

  if (!mainImage || !slideContainer) return;

  function updateSlider(index) {
    // 1. إزالة كلاس active لإعادة تصفير الأنيميشن (النصوص والزووم)
    slideContainer.classList.remove("active");

    // 2. تحديث المحتوى بعد فجوة زمنية قصيرة جداً لضمان شعور المتصفح بالتغيير
    setTimeout(() => {
      currentIndex = index;
      mainImage.src = sliderData[currentIndex].src;
      if (imageTitle) imageTitle.innerText = sliderData[currentIndex].title;
      if (sliderBtn) sliderBtn.href = sliderData[currentIndex].link;
      subtitle.textContent = sliderData[index].subtitle;

      // 3. إعادة كلاس active لتفعيل الظهور التدريجي وحركة الزووم
      slideContainer.classList.add("active");
    }, 50);
  }

  // وظائف التنقل للأزرار
  window.nextImage = function () {
    let nextIndex = (currentIndex + 1) % sliderData.length;
    updateSlider(nextIndex);
  };

  window.prevImage = function () {
    let prevIndex = (currentIndex - 1 + sliderData.length) % sliderData.length;
    updateSlider(prevIndex);
  };

  // التحكم في التشغيل التلقائي
  function startAutoSlide() {
    stopAutoSlide();
    autoSlideInterval = setInterval(window.nextImage, SLIDE_DELAY);
  }

  function stopAutoSlide() {
    if (autoSlideInterval) {
      clearInterval(autoSlideInterval);
      autoSlideInterval = null;
    }
  }

  // بدء التشغيل
  updateSlider(0);
  startAutoSlide();

  // إيقاف مؤقت عند تمرير الفأرة
  const mainSlider = document.querySelector(".main-slider");
  mainSlider.addEventListener("mouseenter", stopAutoSlide);
  mainSlider.addEventListener("mouseleave", startAutoSlide);
});
