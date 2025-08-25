// src/firebase.ts
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAqVcHeiwXuMXZ1cFKBelTZEHU67LOnFn8",
  authDomain: "avishkarca-86013.firebaseapp.com",
  projectId: "avishkarca-86013",
  storageBucket: "avishkarca-86013.appspot.com",
  messagingSenderId: "779694722832",
  appId: "1:779694722832:web:f2ef742787e172647e1f95",
};

// Prevent duplicate initialization
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// Firebase services
export const auth = getAuth(app);
export { app }; // named export
