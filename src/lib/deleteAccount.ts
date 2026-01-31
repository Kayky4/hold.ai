/**
 * 🗑️ Account Deletion Service
 * 
 * Handles complete account deletion including all user data.
 * 
 * @see regras_decisoes.md — Deleção de Dados
 * @see react-patterns skill — Error handling
 */

import {
    collection,
    doc,
    getDocs,
    deleteDoc,
    writeBatch,
} from "firebase/firestore";
import { deleteUser, User } from "firebase/auth";
import { db, auth } from "./firebase";

// ============================================
// 📐 TYPES
// ============================================

export interface DeletionProgress {
    step: string;
    current: number;
    total: number;
}

export type DeletionCallback = (progress: DeletionProgress) => void;

// ============================================
// 📐 CONSTANTS
// ============================================

const USERS_COLLECTION = "users";

// Subcollections to delete under users/{userId}
const USER_SUBCOLLECTIONS = [
    "northStar",
    "crmProjects",
    "crmDecisions",
    "personas",
    "settings",
];

// Top-level collections with userId field
const TOP_LEVEL_COLLECTIONS = [
    "conversations",
    "projects",
    "decisions",
];

// ============================================
// 🔧 HELPERS
// ============================================

/**
 * Delete all documents in a collection
 */
async function deleteCollection(
    collectionRef: ReturnType<typeof collection>,
    onProgress?: DeletionCallback
): Promise<number> {
    const snapshot = await getDocs(collectionRef);

    if (snapshot.empty) {
        return 0;
    }

    // Use batched writes for efficiency (max 500 per batch)
    const batchSize = 500;
    let deletedCount = 0;
    let batch = writeBatch(db);
    let count = 0;

    for (const docSnap of snapshot.docs) {
        batch.delete(docSnap.ref);
        count++;
        deletedCount++;

        if (count >= batchSize) {
            await batch.commit();
            batch = writeBatch(db);
            count = 0;
        }
    }

    // Commit remaining
    if (count > 0) {
        await batch.commit();
    }

    return deletedCount;
}

// ============================================
// 🗑️ DELETION OPERATIONS
// ============================================

/**
 * Delete all user data from Firestore
 */
export async function deleteUserData(
    userId: string,
    onProgress?: DeletionCallback
): Promise<void> {
    const totalSteps = USER_SUBCOLLECTIONS.length + TOP_LEVEL_COLLECTIONS.length + 1;
    let currentStep = 0;

    // 1. Delete user subcollections
    for (const subcollection of USER_SUBCOLLECTIONS) {
        currentStep++;
        onProgress?.({
            step: `Deletando ${subcollection}...`,
            current: currentStep,
            total: totalSteps,
        });

        const subcollectionRef = collection(db, USERS_COLLECTION, userId, subcollection);
        await deleteCollection(subcollectionRef);
    }

    // 2. Delete top-level collections with userId filter
    // Note: Firestore doesn't support delete with where clause directly
    // We need to query and delete manually
    for (const collectionName of TOP_LEVEL_COLLECTIONS) {
        currentStep++;
        onProgress?.({
            step: `Deletando ${collectionName}...`,
            current: currentStep,
            total: totalSteps,
        });

        try {
            const { query, where } = await import("firebase/firestore");
            const collectionRef = collection(db, collectionName);
            const q = query(collectionRef, where("userId", "==", userId));
            const snapshot = await getDocs(q);

            const batch = writeBatch(db);
            snapshot.docs.forEach((docSnap) => {
                batch.delete(docSnap.ref);
            });

            if (!snapshot.empty) {
                await batch.commit();
            }
        } catch (error) {
            console.error(`[DeleteAccount] Error deleting ${collectionName}:`, error);
            // Continue with other collections
        }
    }

    // 3. Delete user profile document
    currentStep++;
    onProgress?.({
        step: "Deletando perfil...",
        current: currentStep,
        total: totalSteps,
    });

    const userDocRef = doc(db, USERS_COLLECTION, userId);
    await deleteDoc(userDocRef);
}

/**
 * Delete user from Firebase Auth
 */
export async function deleteAuthUser(user: User): Promise<void> {
    await deleteUser(user);
}

/**
 * Complete account deletion (data + auth)
 */
export async function deleteAccount(
    user: User,
    onProgress?: DeletionCallback
): Promise<void> {
    const userId = user.uid;

    // Step 1: Delete all Firestore data
    await deleteUserData(userId, onProgress);

    // Step 2: Delete Firebase Auth user
    onProgress?.({
        step: "Finalizando exclusão...",
        current: 100,
        total: 100,
    });

    await deleteAuthUser(user);
}

/**
 * Validate deletion confirmation input
 */
export function validateDeletionConfirmation(input: string): boolean {
    return input.trim().toUpperCase() === "EXCLUIR";
}
