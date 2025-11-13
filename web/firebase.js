
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"


const firebaseConfig = {
  apiKey: "AIzaSyALukVSn70obzS6-5aAdktVnZxhO4h2hsE",
  authDomain: "kuryentech-9a713.firebaseapp.com",
  projectId: "kuryentech-9a713",
  storageBucket: "kuryentech-9a713.firebasestorage.app",
  messagingSenderId: "685928959485",
  appId: "1:685928959485:web:9a1318d49a2c1d65d69d94",
  measurementId: "G-RSBC231VER"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app); 
const db = getFirestore(app);

export { app, analytics, auth, db };