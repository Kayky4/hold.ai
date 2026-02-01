import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Only initialize Firebase if we have a valid config (not during build time)
const hasValidConfig = !!firebaseConfig.apiKey;

let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

if (hasValidConfig) {
    // Initialize Firebase only if it hasn't been initialized yet AND we have valid config
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    db = getFirestore(app);
    auth = getAuth(app);
} else {
    // During build time, create mock objects to prevent crashes
    // These will never be used at runtime since the real config will be available
    console.warn("[Firebase] No valid config found - using mock objects (this is expected during build)");
    app = {} as FirebaseApp;
    db = {} as Firestore;
    auth = {} as Auth;
}

const googleProvider = new GoogleAuthProvider();

export { app, db, auth, googleProvider };
