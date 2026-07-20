// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDqxVV-H0nFNcbtIuatIOloKo1jB9-I6q4",
  authDomain: "mine-idea.firebaseapp.com",
  projectId: "mine-idea",
  storageBucket: "mine-idea.firebasestorage.app",
  messagingSenderId: "427791717755",
  appId: "1:427791717755:web:f80868df9f9e3b6a6f59de",
  measurementId: "G-61Z47WF6G5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);