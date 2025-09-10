
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

// 25 Indian Food Items
const foodItems = [
  { title: "Paneer Butter Masala", description: "Rich, creamy tomato-based paneer curry", quantity: 100, image: "paneer_butter_masala.jpg" },
  { title: "Chole Bhature", description: "Spicy chickpeas with fried bread", quantity: 120, image: "chole_bhature.jpg" },
  { title: "Masala Dosa", description: "Crispy rice crepe with potato filling", quantity: 150, image: "masala_dosa.jpg" },
  { title: "Biryani", description: "Aromatic basmati rice with spices & meat", quantity: 80, image: "biryani.jpg" },
  { title: "Pav Bhaji", description: "Spicy vegetable mash with buttered bread", quantity: 100, image: "pav_bhaji.jpg" },
  { title: "Idli Sambar", description: "Steamed rice cakes with lentil soup", quantity: 200, image: "idli_sambar.jpg" },
  { title: "Rajma Chawal", description: "Kidney beans curry with steamed rice", quantity: 120, image: "rajma_chawal.jpg" },
  { title: "Aloo Paratha", description: "Stuffed potato flatbread", quantity: 150, image: "aloo_paratha.jpg" },
  { title: "Dhokla", description: "Steamed chickpea flour cake", quantity: 90, image: "dhokla.jpg" },
  { title: "Butter Naan & Dal", description: "Soft naan with spiced lentil curry", quantity: 100, image: "butter_naan_dal.jpg" },
  { title: "Pani Puri", description: "Hollow fried crisp with spicy water", quantity: 250, image: "pani_puri.jpg" },
  { title: "Samosa Chaat", description: "Crunchy samosa with tangy toppings", quantity: 120, image: "samosa_chaat.jpg" },
  { title: "Malai Kofta", description: "Deep-fried dumplings in creamy gravy", quantity: 80, image: "malai_kofta.jpg" },
  { title: "Veg Thali", description: "Full vegetarian plate with sides", quantity: 100, image: "veg_thali.jpg" },
  { title: "Jalebi & Rabri", description: "Sweet fried spirals with condensed milk", quantity: 150, image: "jalebi_rabri.jpg" },
  { title: "Chicken Tikka", description: "Spiced grilled chicken chunks", quantity: 100, image: "chicken_tikka.jpg" },
  { title: "Fish Curry", description: "Spicy coastal fish curry", quantity: 80, image: "fish_curry.jpg" },
  { title: "Matar Paneer", description: "Peas and paneer curry", quantity: 120, image: "matar_paneer.jpg" },
  { title: "Lemon Rice", description: "Tangy and fragrant lemon rice", quantity: 150, image: "lemon_rice.jpg" },
  { title: "Vegetable Pulao", description: "Mildly spiced rice with veggies", quantity: 150, image: "veg_pulao.jpg" },
  { title: "Tandoori Roti", description: "Whole wheat flatbread", quantity: 200, image: "tandoori_roti.jpg" },
  { title: "Dal Makhani", description: "Creamy black lentil curry", quantity: 100, image: "dal_makhani.jpg" },
  { title: "Bhindi Masala", description: "Stir-fried okra with spices", quantity: 120, image: "bhindi_masala.jpg" },
  { title: "Gajar Halwa", description: "Carrot-based sweet dessert", quantity: 100, image: "gajar_halwa.jpg" },
  { title: "Rasgulla", description: "Soft spongy sweet syrup balls", quantity: 150, image: "rasgulla.jpg" },
];

async function seedFirestore() {
  for (const item of foodItems) {
    try {
      const docRef = await addDoc(collection(db, "listings"), {
        title: item.title,
        description: item.description,
        quantity: item.quantity,
        imageUrls: [`https://firebasestorage.googleapis.com/v0/b/<YOUR_PROJECT_ID>.appspot.com/o/listings%2F${item.image}?alt=media`],
        aiFreshness: Math.floor(Math.random() * 14) + 85, // 85-98%
        donorId: "uid_demo_donor",
        pickupWindow: new Date().toISOString(),
        location: { lat: 28.6139, lng: 77.209 },
        status: "open",
      });
      console.log("Added document with ID:", docRef.id);
    } catch (error) {
      console.error("Error adding document:", error);
    }
  }
  console.log("Seeding completed!");
}

seedFirestore();
