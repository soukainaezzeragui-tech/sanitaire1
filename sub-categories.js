import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBAR61bCFZ3kC1XkXB1K6SRRdUyIVONAK8",
  authDomain: "sanitaire-al-houda.firebaseapp.com",
  projectId: "sanitaire-al-houda",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// HTML
const container = document.getElementById("subCategories");
const title = document.getElementById("catTitle");

// قراءة category من الرابط
const params = new URLSearchParams(window.location.search);
const category = params.get("cat");

if (!category) {
  title.innerText = "Catégorie non trouvée";
  throw new Error("Category missing");
}

title.innerText = category.toUpperCase();

// Query: كل المنتجات ديال category
const q = query(
  collection(db, "products"),
  where("category", "==", category),
  where("active", "==", true)
);

const snapshot = await getDocs(q);

// استخراج sub-categories بلا تكرار
const subs = new Set();

snapshot.forEach(doc => {
  const data = doc.data();
  if (data.subCategory) subs.add(data.subCategory);
});

if (subs.size === 0) {
  container.innerHTML = "<p>لا توجد فئات فرعية</p>";
} else {
  subs.forEach(sub => {
    container.innerHTML += `
      <a class="sub-card"
         href="products.html?cat=${category}&sub=${sub}">
        ${sub}
      </a>
    `;
  });
}
