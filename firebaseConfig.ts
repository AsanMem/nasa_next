import { initializeApp, getApps, getApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim();

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

if (process.env.NODE_ENV !== "production" && !storageBucket) {
  console.warn(
    "Firebase Storage bucket is not configured. Set NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET.",
  );
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const storage = getStorage(app);
const hasFirebaseStorageBucket = Boolean(storageBucket);

export { storage, hasFirebaseStorageBucket };
