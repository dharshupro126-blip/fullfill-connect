
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
];

const deliveries = [
    {
        donorName: "Sunrise Bakery",
        receiverName: "Community Shelter",
        itemName: "Assorted Pastries",
        status: "Assigned",
        donorCoords: { lat: 40.7128, lng: -74.0060 }, // NYC
        receiverCoords: { lat: 40.7580, lng: -73.9855 }, // Times Square
        volunteerId: "uid_demo_volunteer",
        donorId: "uid_demo_donor",
        receiverId: "uid_demo_receiver"
    },
    {
        donorName: "The Corner Cafe",
        receiverName: "Downtown Food Bank",
        itemName: "Vegetable Soup (10L)",
        status: "In Transit",
        donorCoords: { lat: 40.7484, lng: -73.9857 }, // Empire State Building
        receiverCoords: { lat: 40.7061, lng: -73.9969 }, // Near Wall Street
        volunteerId: "uid_demo_volunteer",
        donorId: "uid_demo_donor_2",
        receiverId: "uid_demo_receiver_2"
    },
    {
        donorName: "Good Eats Catering",
        receiverName: "Uptown Soup Kitchen",
        itemName: "Chicken & Rice (50 servings)",
        status: "Delivered",
        donorCoords: { lat: 40.7796, lng: -73.9632 }, // Central Park
        receiverCoords: { lat: 40.8116, lng: -73.9465 }, // Harlem
        volunteerId: "uid_demo_volunteer",
        donorId: "uid_demo_donor_3",
        receiverId: "uid_demo_receiver_3"
    }
];

async function seedListings() {
  console.log("Seeding listings...");
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
      console.log(`Added listing: ${food.title}`);
    } catch (err) {
      console.error("Error adding listing:", err);
    }
  }
  console.log("Listings seeding complete!");
}


async function seedDeliveries() {
  console.log("Seeding deliveries...");
  for (const delivery of deliveries) {
    try {
      await addDoc(collection(db, "deliveries"), {
        ...delivery,
        createdAt: new Date(),
      });
      console.log(`Added delivery: ${delivery.itemName}`);
    } catch (err) {
      console.error("Error adding delivery:", err);
    }
  }
  console.log("Deliveries seeding complete!");
}


async function main() {
    await seedListings();
    await seedDeliveries();
    console.log("All data seeded!");
}

main();
