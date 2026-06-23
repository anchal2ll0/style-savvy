import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
};

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _storage: FirebaseStorage | null = null;

function ensure(): FirebaseApp {
  if (typeof window === "undefined") {
    throw new Error("Firebase client SDK is browser-only.");
  }
  if (!_app) {
    if (!config.apiKey) {
      throw new Error(
        "Firebase config missing. Set VITE_FIREBASE_* values in .env",
      );
    }
    _app = getApps().length ? getApp() : initializeApp(config);
  }
  return _app;
}

export const getFirebaseAuth = () => (_auth ??= getAuth(ensure()));
export const getDb = () => (_db ??= getFirestore(ensure()));
export const getFirebaseStorage = () => (_storage ??= getStorage(ensure()));
