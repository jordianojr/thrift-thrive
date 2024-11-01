import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from "firebase/storage"

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
const firebaseURL = import.meta.env.VITE_FIREBASE_URL
const firebaseKey = import.meta.env.VITE_FIREBASE_KEY

// import dotenv from 'dotenv';

// dotenv.config();
// const firebaseURL = process.env.VITE_FIREBASE_URL
// const firebaseKey = process.env.VITE_FIREBASE_KEY

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: firebaseKey,
  authDomain: firebaseURL,
  projectId: "thriftthrive-a28e7",
  storageBucket: "thriftthrive-a28e7.appspot.com",
  messagingSenderId: "1072129347623",
  appId: "1:1072129347623:web:fffa2e26961c564a30fe02",
  measurementId: "G-3TZWLLB8RP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get a reference to the auth service
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };