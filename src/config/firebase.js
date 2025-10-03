import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
// Try to get from runtime config first (for Docker), then build-time env vars (for local dev)
const runtimeConfig = window._env_ || {};
const firebaseConfig = {
  apiKey:
    runtimeConfig.REACT_APP_FIREBASE_API_KEY ||
    process.env.REACT_APP_FIREBASE_API_KEY ||
    "YOUR_API_KEY",
  authDomain:
    runtimeConfig.REACT_APP_FIREBASE_AUTH_DOMAIN ||
    process.env.REACT_APP_FIREBASE_AUTH_DOMAIN ||
    "YOUR_PROJECT_ID.firebaseapp.com",
  projectId:
    runtimeConfig.REACT_APP_FIREBASE_PROJECT_ID ||
    process.env.REACT_APP_FIREBASE_PROJECT_ID ||
    "YOUR_PROJECT_ID",
  storageBucket:
    runtimeConfig.REACT_APP_FIREBASE_STORAGE_BUCKET ||
    process.env.REACT_APP_FIREBASE_STORAGE_BUCKET ||
    "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId:
    runtimeConfig.REACT_APP_FIREBASE_MESSAGING_SENDER_ID ||
    process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID ||
    "YOUR_MESSAGING_SENDER_ID",
  appId:
    runtimeConfig.REACT_APP_FIREBASE_APP_ID ||
    process.env.REACT_APP_FIREBASE_APP_ID ||
    "YOUR_APP_ID",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
