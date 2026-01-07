import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Load Firebase config from JSON file (for production) or env vars (for local dev)
let firebaseConfig;

// Try to load from JSON file first (production/Docker)
try {
  const response = await fetch("/firebase-config.json");
  if (response.ok) {
    firebaseConfig = await response.json();
    console.log("Loaded Firebase config from firebase-config.json");
  }
} catch (error) {
  console.log("Firebase config file not found, using environment variables");
}


// Fallback to environment variables (local development)
if (!firebaseConfig) {
  firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
  };
}

// Initialize Firebase with config
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
