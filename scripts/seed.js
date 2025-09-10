
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

// Firebase config - IMPORTANT: REPLACE WITH YOUR OWN CONFIG
const firebaseConfig = {
  apiKey: "<YOUR_API_KEY>",
  authDomain: "<YOUR_PROJECT_ID>.firebaseapp.com",
  projectId: "<YOUR_PROJECT_ID>",
  storageBucket: "<YOUR_PROJECT_ID>.appspot.com",
  messagingSenderId: "<YOUR_MESSAGING_SENDER_ID>",
  appId: "<YOUR_APP_ID>",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const foods = [
  { title: "Paneer Butter Masala", desc: "Rich, creamy tomato-based paneer curry", qty: 100, img: "paneer_butter_masala.jpg" },
  { title: "Chole Bhature", desc: "Spicy chickpeas with fried bread", qty: 120, img: "chole_bhature.jpg" },
  { title: "Masala Dosa", desc: "Crispy rice crepe with potato filling", qty: 150, img: "masala_dosa.jpg" },
  { title: "Biryani", desc: "Aromatic basmati rice with spices & meat", qty: 80, img: "biryani.jpg" },
  { title: "Pav Bhaji", desc: "Spicy vegetable mash with buttered bread", qty: 100, img: "pav_bhaji.jpg" },
  { title: "Idli Sambar", desc: "Steamed rice cakes with lentil soup", qty: 200, img: "idli_sambar.jpg" },
  { title: "Rajma Chawal", desc: "Kidney beans curry with steamed rice", qty: 120, img: "rajma_chawal.jpg" },
  { title: "Aloo Paratha", desc: "Stuffed potato flatbread", qty: 150, img: "aloo_paratha.jpg" },
  { title: "Dhokla", desc: "Steamed chickpea flour cake", qty: 90, img: "dhokla.jpg" },
  { title: "Butter Naan & Dal", desc: "Soft naan with spiced lentil curry", qty: 100, img: "butter_naan_dal.jpg" },
  { title: "Pani Puri", desc: "Hollow fried crisp with spicy water", qty: 250, img: "pani_puri.jpg" },
  { title: "Samosa Chaat", desc: "Crunchy samosa with tangy toppings", qty: 120, img: "samosa_chaat.jpg" },
  { title: "Malai Kofta", desc: "Deep-fried dumplings in creamy gravy", qty: 80, img: "malai_kofta.jpg" },
  { title: "Veg Thali", desc: "Full vegetarian plate with sides", qty: 100, img: "veg_thali.jpg" },
  { title: "Jalebi & Rabri", desc: "Sweet fried spirals with condensed milk", qty: 150, img: "jalebi_rabri.jpg" },
  { title: "Chicken Tikka", desc: "Spiced grilled chicken chunks", qty: 100, img: "chicken_tikka.jpg" },
  { title: "Fish Curry", desc: "Spicy coastal fish curry", qty: 80, img: "fish_curry.jpg" },
  { title: "Matar Paneer", desc: "Peas and paneer curry", qty: 120, img: "matar_paneer.jpg" },
  { title: "Lemon Rice", desc: "Tangy and fragrant lemon rice", qty: 150, img: "lemon_rice.jpg" },
  { title: "Vegetable Pulao", desc: "Mildly spiced rice with veggies", qty: 150, img: "veg_pulao.jpg" },
  { title: "Tandoori Roti", desc: "Whole wheat flatbread", qty: 200, img: "tandoori_roti.jpg" },
  { title: "Dal Makhani", desc: "Creamy black lentil curry", qty: 100, img: "dal_makhani.jpg" },
  { title: "Bhindi Masala", desc: "Stir-fried okra with spices", qty: 120, img: "bhindi_masala.jpg" },
  { title: "Gajar Halwa", desc: "Carrot-based sweet dessert", qty: 100, img: "gajar_halwa.jpg" },
  { title: "Rasgulla", desc: "Soft spongy sweet syrup balls", qty: 150, img: "rasgulla.jpg" },
];

async function seed() {
  for (const food of foods) {
    try {
      await addDoc(collection(db, "listings"), {
        title: food.title,
        description: food.desc,
        quantity: food.qty,
        imageUrls: [`https://firebasestorage.googleapis.com/v0/b/<YOUR_PROJECT_ID>.appspot.com/o/listings%2F${food.img}?alt=media`],
        aiFreshness: Math.floor(Math.random() * 14) + 85,
        donorId: "uid_demo_donor",
        pickupWindow: new Date().toISOString(),
        location: { lat: 28.6139, lng: 77.209 },
        status: "open",
      });
      console.log(`Added: ${food.title}`);
    } catch (err) {
      console.error("Error:", err);
    }
  }
  console.log("All foods seeded!");
}

seed();
