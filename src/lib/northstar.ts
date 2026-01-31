/**
 * 🌟 North Star Firestore Service
 * 
 * CRUD operations for North Star in Firestore.
 * North Star: 1 per user (macro objective)
 * 
 * @see regras_decisoes.md — CRM de Decisões (Hierarquia)
 * @see react-patterns skill — Custom hooks, State Management
 */

import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    onSnapshot,
    Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import { NorthStar } from "@/types/crm";

// ============================================
// 📐 CONSTANTS
// ============================================

const USERS_COLLECTION = "users";
const NORTH_STAR_DOC = "northStar";

// ============================================
// 🔧 HELPERS
// ============================================

function getNorthStarRef(userId: string) {
    return doc(db, USERS_COLLECTION, userId, NORTH_STAR_DOC, "current");
}

function parseNorthStar(data: any, id: string): NorthStar {
    return {
        id,
        userId: data.userId,
        title: data.title,
        description: data.description,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || undefined,
    };
}

// ============================================
// 📖 READ OPERATIONS
// ============================================

/**
 * Get user's North Star
 */
export async function getNorthStar(userId: string): Promise<NorthStar | null> {
    const docRef = getNorthStarRef(userId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        return null;
    }

    return parseNorthStar(docSnap.data(), docSnap.id);
}

/**
 * Subscribe to North Star changes (real-time)
 */
export function subscribeToNorthStar(
    userId: string,
    onData: (northStar: NorthStar | null) => void,
    onError?: (error: Error) => void
): Unsubscribe {
    const docRef = getNorthStarRef(userId);

    return onSnapshot(
        docRef,
        (docSnap) => {
            if (docSnap.exists()) {
                onData(parseNorthStar(docSnap.data(), docSnap.id));
            } else {
                onData(null);
            }
        },
        (error) => {
            console.error("[NorthStar] Subscription error:", error);
            onError?.(error);
        }
    );
}

// ============================================
// ✏️ WRITE OPERATIONS
// ============================================

/**
 * Create or update North Star
 */
export async function setNorthStar(
    userId: string,
    data: { title: string; description?: string }
): Promise<NorthStar> {
    const docRef = getNorthStarRef(userId);
    const existingDoc = await getDoc(docRef);

    const northStarData = {
        userId,
        title: data.title,
        description: data.description || null,
        updatedAt: serverTimestamp(),
        ...(existingDoc.exists() ? {} : { createdAt: serverTimestamp() }),
    };

    await setDoc(docRef, northStarData, { merge: true });

    return {
        id: "current",
        userId,
        title: data.title,
        description: data.description,
        createdAt: existingDoc.exists()
            ? existingDoc.data()?.createdAt?.toDate?.() || new Date()
            : new Date(),
        updatedAt: new Date(),
    };
}

/**
 * Update North Star fields
 */
export async function updateNorthStar(
    userId: string,
    updates: Partial<Pick<NorthStar, "title" | "description">>
): Promise<void> {
    const docRef = getNorthStarRef(userId);

    await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
    });
}

/**
 * Delete North Star
 */
export async function deleteNorthStar(userId: string): Promise<void> {
    const docRef = getNorthStarRef(userId);
    await deleteDoc(docRef);
}
