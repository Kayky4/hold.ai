import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    User,
    UserCredential,
    updateProfile,
    sendPasswordResetEmail,
    linkWithCredential,
    linkWithPopup,
    EmailAuthProvider,
    fetchSignInMethodsForEmail,
} from "firebase/auth";
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    serverTimestamp,
} from "firebase/firestore";
import { auth, googleProvider, db } from "./firebase";

// User profile stored in Firestore
export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    createdAt: Date;
    updatedAt: Date;
    isProfileComplete: boolean;
    hasCompletedOnboarding: boolean;
    // Additional profile fields
    company?: string;
    role?: string;
    projectType?: string;
}

export interface AuthResult {
    user: User;
    isNewUser: boolean;
    profile: UserProfile | null;
}

const USERS_COLLECTION = "users";

// Create or update user profile in Firestore
async function createOrUpdateUserProfile(
    user: User,
    isNew: boolean,
    additionalData?: Partial<UserProfile>
): Promise<UserProfile> {
    const userRef = doc(db, USERS_COLLECTION, user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        // Create new profile
        const newProfile: Omit<UserProfile, "createdAt" | "updatedAt"> = {
            uid: user.uid,
            email: user.email || "",
            displayName: user.displayName || "",
            photoURL: user.photoURL || undefined,
            isProfileComplete: false,
            hasCompletedOnboarding: false,
            ...additionalData,
        };

        await setDoc(userRef, {
            ...newProfile,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        return {
            ...newProfile,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    } else {
        // Update existing profile
        const existingData = userSnap.data();

        if (additionalData) {
            await updateDoc(userRef, {
                ...additionalData,
                updatedAt: serverTimestamp(),
            });
        }

        return {
            uid: existingData.uid,
            email: existingData.email,
            displayName: existingData.displayName || user.displayName || "",
            photoURL: existingData.photoURL || user.photoURL,
            createdAt: existingData.createdAt?.toDate?.() || new Date(),
            updatedAt: new Date(),
            isProfileComplete: existingData.isProfileComplete || false,
            hasCompletedOnboarding: existingData.hasCompletedOnboarding || false,
            company: existingData.company,
            role: existingData.role,
            projectType: existingData.projectType,
            ...additionalData,
        };
    }
}

// Get user profile from Firestore
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
    const userRef = doc(db, USERS_COLLECTION, uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        return null;
    }

    const data = userSnap.data();
    return {
        uid: data.uid,
        email: data.email,
        displayName: data.displayName,
        photoURL: data.photoURL,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date(),
        isProfileComplete: data.isProfileComplete || false,
        hasCompletedOnboarding: data.hasCompletedOnboarding || false,
        company: data.company,
        role: data.role,
        projectType: data.projectType,
    };
}

// Sign up with email and password
export async function signUpWithEmail(
    email: string,
    password: string,
    displayName: string
): Promise<AuthResult> {
    const credential = await createUserWithEmailAndPassword(auth, email, password);

    // Update Firebase Auth profile
    await updateProfile(credential.user, { displayName });

    // Create Firestore profile
    const profile = await createOrUpdateUserProfile(credential.user, true, {
        displayName,
        isProfileComplete: true, // Email signup includes name
    });

    return {
        user: credential.user,
        isNewUser: true,
        profile,
    };
}

// Sign in with email and password
export async function signInWithEmail(
    email: string,
    password: string
): Promise<AuthResult> {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const profile = await getUserProfile(credential.user.uid);

    return {
        user: credential.user,
        isNewUser: false,
        profile,
    };
}

// Sign in or sign up with Google
export async function signInWithGoogle(): Promise<AuthResult> {
    const credential = await signInWithPopup(auth, googleProvider);

    // Check if user exists in Firestore
    const existingProfile = await getUserProfile(credential.user.uid);
    const isNewUser = !existingProfile;

    // Create or update profile
    const profile = await createOrUpdateUserProfile(
        credential.user,
        isNewUser,
        {
            displayName: credential.user.displayName || "",
            photoURL: credential.user.photoURL || undefined,
        }
    );

    return {
        user: credential.user,
        isNewUser,
        profile,
    };
}

// Complete user profile (after Google signup)
export async function completeUserProfile(
    uid: string,
    data: {
        displayName?: string;
        company?: string;
        role?: string;
        projectType?: string;
    }
): Promise<UserProfile> {
    const userRef = doc(db, USERS_COLLECTION, uid);

    await updateDoc(userRef, {
        ...data,
        isProfileComplete: true,
        updatedAt: serverTimestamp(),
    });

    const profile = await getUserProfile(uid);
    return profile!;
}

// Mark onboarding as complete
export async function completeOnboarding(uid: string): Promise<void> {
    const userRef = doc(db, USERS_COLLECTION, uid);

    await updateDoc(userRef, {
        hasCompletedOnboarding: true,
        updatedAt: serverTimestamp(),
    });
}

// Update user profile
export async function updateUserProfile(
    uid: string,
    data: {
        displayName?: string;
        company?: string;
        role?: string;
        projectType?: string;
    }
): Promise<UserProfile> {
    const userRef = doc(db, USERS_COLLECTION, uid);

    await updateDoc(userRef, {
        ...data,
        updatedAt: serverTimestamp(),
    });

    const profile = await getUserProfile(uid);
    return profile!;
}

// Send password reset email
export async function resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
}

// Sign out
export async function logOut(): Promise<void> {
    await signOut(auth);
}

// Subscribe to auth state changes
export function onAuthChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
}

// Get current user
export function getCurrentUser(): User | null {
    return auth.currentUser;
}

// Get linked providers for current user
export function getLinkedProviders(user: User): string[] {
    return user.providerData.map((provider) => provider.providerId);
}

// Check if user has password authentication
export function hasPasswordAuth(user: User): boolean {
    return getLinkedProviders(user).includes("password");
}

// Check if user has Google authentication
export function hasGoogleAuth(user: User): boolean {
    return getLinkedProviders(user).includes("google.com");
}

// Link password to existing account (for Google users who want to add email/password)
export async function linkPasswordToAccount(
    user: User,
    password: string
): Promise<void> {
    if (!user.email) {
        throw new Error("Usuário não possui email associado");
    }

    if (hasPasswordAuth(user)) {
        throw new Error("Conta já possui uma senha cadastrada");
    }

    const credential = EmailAuthProvider.credential(user.email, password);
    await linkWithCredential(user, credential);
}

// Link Google to existing account (for email/password users who want to add Google)
export async function linkGoogleToAccount(user: User): Promise<void> {
    if (hasGoogleAuth(user)) {
        throw new Error("Conta já está vinculada ao Google");
    }

    await linkWithPopup(user, googleProvider);
}

// Check sign-in methods for an email (to detect conflicts during signup)
export async function getSignInMethodsForEmail(email: string): Promise<string[]> {
    try {
        return await fetchSignInMethodsForEmail(auth, email);
    } catch {
        return [];
    }
}

// Check if email is already registered
export async function isEmailRegistered(email: string): Promise<boolean> {
    const methods = await getSignInMethodsForEmail(email);
    return methods.length > 0;
}

// Get human-readable provider name
export function getProviderDisplayName(providerId: string): string {
    switch (providerId) {
        case "google.com":
            return "Google";
        case "password":
            return "Email e Senha";
        case "facebook.com":
            return "Facebook";
        case "twitter.com":
            return "Twitter";
        default:
            return providerId;
    }
}
