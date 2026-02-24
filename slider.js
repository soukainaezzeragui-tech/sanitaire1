document.addEventListener("DOMContentLoaded", function () {
  const sliderData = [
    {
      src: "images/mainsalide1.webp",
      title: "Visitez notre magasin",
      subtitle: "Découvrez des produits de qualité et un service de confiance",
      link: "https://wa.me/212638069899",
    },
    {
      src: "images/mainsalide1.webp",
      title: "Cuisines au design moderne",
      subtitle: "Élégance, fonctionnalité et finitions soignées",
      link: "https://wa.me/212638069899",
    },
    {
      src: "images/mainsalide1.webp",
      loading: "lazy",
      title: "Plomberie professionnelle",
      subtitle: "Des solutions fiables pour tous vos projets",
      link: "https://wa.me/212638069899",
    },
    {
      src: "images/mainsalide1.webp",
      loading: "lazy",
      title: "Matériaux de construction de qualité",
      subtitle: "La solidité au service de vos réalisations",
      link: "https://wa.me/212638069899",
    },
    {
      src: "images/mainsalide1.webp",
      loading: "lazy",
      title: "Éclairage et électricité",
      subtitle: "Performance, sécurité et économies d’énergie",
      link: "https://wa.me/212638069899",
    },
    {
      src: "images/mainsalide1.webp",
      loading: "lazy",
      title: "Peintures et décoration",
      subtitle: "Des couleurs qui donnent vie à vos espaces",
      link: "https://wa.me/212638069899",
    },
    {
      src: "images/mainsalide1.webp",
      loading: "lazy",
      title: "Jardin et équipements extérieurs",
      subtitle: "Tout pour entretenir et embellir vos espaces verts",
      link: "https://wa.me/212638069899",
    },
    {
      src: "images/mainsalide1.webp",
      loading: "lazy",
      title: "Chauffage et ventilation",
      subtitle: "Confort optimal en toute saison",
      link: "https://wa.me/212638069899",
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
