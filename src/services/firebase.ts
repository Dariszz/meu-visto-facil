// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBskUwPrREkDF9oPJ-7CmuZiIZ0qGwQviY",
  authDomain: "checklist-imigracao.firebaseapp.com",
  projectId: "checklist-imigracao",
  storageBucket: "checklist-imigracao.appspot.com",
  messagingSenderId: "189010303205",
  appId: "1:189010303205:web:aadde10b2cefb696821c0c",
  measurementId: "G-BTH6W9K5RV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);
