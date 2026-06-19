import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

// Read client-side configuration from the auto-generated config
const firebaseConfig = {
  apiKey: "AIzaSyCVHcGM7RwZLC6XwCIUmVGJ21_yJ-5GkJQ",
  authDomain: "hybrid-league-f07pf.firebaseapp.com",
  projectId: "hybrid-league-f07pf",
  storageBucket: "hybrid-league-f07pf.firebasestorage.app",
  messagingSenderId: "244294403576",
  appId: "1:244294403576:web:612d237d371b18d119020d",
  firestoreDatabaseId: "ai-studio-1bd2c62a-ded1-41b9-ad02-1a842d7699ef"
};

let app;
let auth: any;
let db: any;
let isInitialized = false;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }

  auth = getAuth(app);
  // Pass the firestoreDatabaseId explicitly if required by the cloud project
  db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  isInitialized = true;
  console.log("Firebase client initialized successfully.");
} catch (error) {
  console.warn("Failed to initialize Firebase SDK client. Using local client database model.", error);
}

export { app, auth, db, isInitialized };
