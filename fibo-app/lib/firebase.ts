import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAndTo8RcOeJfUiWXO8BXdvaQoZItesEXs",
  authDomain: "sistema-correntes.firebaseapp.com",
  projectId: "sistema-correntes",
  storageBucket: "sistema-correntes.firebasestorage.app",
  messagingSenderId: "405298912737",
  appId: "1:405298912737:web:bdd1be056e1b7925d3c6a0"
};

// Initialize Firebase only if not already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export { db };
