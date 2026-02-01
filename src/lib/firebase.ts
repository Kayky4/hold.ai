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

// Check if we're in a build environment without Firebase config
const isBuildTime = typeof window === "undefined" && !firebaseConfig.apiKey;

// Lazy initialization - only initialize when actually needed and config is available
let _app: FirebaseApp | null = null;
let _db: Firestore | null = null;
let _auth: Auth | null = null;

function getApp(): FirebaseApp {
    if (isBuildTime) {
        throw new Error("Firebase cannot be initialized during build time");
    }

    if (!_app) {
        _app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    }
    return _app;
}

function getDb(): Firestore {
    if (!_db) {
        _db = getFirestore(getApp());
    }
    return _db;
}

function getAuthInstance(): Auth {
    if (!_auth) {
        _auth = getAuth(getApp());
    }
    return _auth;
}

// Create proxy objects that lazily initialize Firebase
// This prevents Firebase from being initialized during SSG/build
const app = new Proxy({} as FirebaseApp, {
    get(_, prop) {
        return Reflect.get(getApp(), prop);
    }
});

const db = new Proxy({} as Firestore, {
    get(_, prop) {
        return Reflect.get(getDb(), prop);
    }
});

const auth = new Proxy({} as Auth, {
    get(_, prop) {
        return Reflect.get(getAuthInstance(), prop);
    }
});

const googleProvider = new GoogleAuthProvider();

export { app, db, auth, googleProvider };
