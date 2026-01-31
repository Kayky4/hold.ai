/**
 * ⚙️ User Settings Firestore Service
 * 
 * CRUD operations for user settings in Firestore.
 * Settings stored as: users/{userId}/settings/preferences
 * 
 * @see regras_decisoes.md — Notificações de Revisão
 * @see react-patterns skill — Custom hooks
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

// ============================================
// 📐 TYPES
// ============================================

export interface NotificationSettings {
    /** Enable review reminders */
    reviewReminders: boolean;
    /** Days before review date to remind */
    reminderDays: number;
    /** Enable in-app notifications */
    inAppNotifications: boolean;
    /** Enable email notifications (future) */
    emailNotifications: boolean;
    /** Enable push notifications (future) */
    pushNotifications: boolean;
}

export interface UserSettings {
    notifications: NotificationSettings;
    createdAt: Date;
    updatedAt: Date;
}

// ============================================
// 📐 CONSTANTS
// ============================================

const USERS_COLLECTION = "users";
const SETTINGS_DOC = "preferences";

const DEFAULT_SETTINGS: Omit<UserSettings, "createdAt" | "updatedAt"> = {
    notifications: {
        reviewReminders: true,
        reminderDays: 7,
        inAppNotifications: true,
        emailNotifications: false,
        pushNotifications: false,
    },
};

// ============================================
// 🔧 HELPERS
// ============================================

function getSettingsRef(userId: string) {
    return doc(db, USERS_COLLECTION, userId, "settings", SETTINGS_DOC);
}

function parseSettings(data: any): UserSettings {
    return {
        notifications: {
            reviewReminders: data?.notifications?.reviewReminders ?? true,
            reminderDays: data?.notifications?.reminderDays ?? 7,
            inAppNotifications: data?.notifications?.inAppNotifications ?? true,
            emailNotifications: data?.notifications?.emailNotifications ?? false,
            pushNotifications: data?.notifications?.pushNotifications ?? false,
        },
        createdAt: data?.createdAt?.toDate?.() || new Date(),
        updatedAt: data?.updatedAt?.toDate?.() || new Date(),
    };
}

// ============================================
// 📖 READ OPERATIONS
// ============================================

/**
 * Get user settings (with defaults if not found)
 */
export async function getUserSettings(userId: string): Promise<UserSettings> {
    const docRef = getSettingsRef(userId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        // Return defaults if no settings exist
        return {
            ...DEFAULT_SETTINGS,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }

    return parseSettings(docSnap.data());
}

/**
 * Subscribe to settings changes (real-time)
 */
export function subscribeToUserSettings(
    userId: string,
    onData: (settings: UserSettings) => void,
    onError?: (error: Error) => void
): Unsubscribe {
    const docRef = getSettingsRef(userId);

    return onSnapshot(
        docRef,
        (docSnap) => {
            if (docSnap.exists()) {
                onData(parseSettings(docSnap.data()));
            } else {
                // Return defaults
                onData({
                    ...DEFAULT_SETTINGS,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            }
        },
        (error) => {
            console.error("[UserSettings] Subscription error:", error);
            onError?.(error);
        }
    );
}

// ============================================
// ✏️ WRITE OPERATIONS
// ============================================

/**
 * Save user settings
 */
export async function saveUserSettings(
    userId: string,
    settings: Partial<UserSettings>
): Promise<void> {
    const docRef = getSettingsRef(userId);
    const existingDoc = await getDoc(docRef);

    const settingsData = {
        ...settings,
        updatedAt: serverTimestamp(),
        ...(existingDoc.exists() ? {} : { createdAt: serverTimestamp() }),
    };

    await setDoc(docRef, settingsData, { merge: true });
}

/**
 * Update notification settings
 */
export async function updateNotificationSettings(
    userId: string,
    notifications: Partial<NotificationSettings>
): Promise<void> {
    const docRef = getSettingsRef(userId);
    const existingDoc = await getDoc(docRef);

    if (!existingDoc.exists()) {
        // Create with defaults + updates
        await setDoc(docRef, {
            notifications: { ...DEFAULT_SETTINGS.notifications, ...notifications },
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    } else {
        // Merge notification updates
        const currentData = existingDoc.data();
        await updateDoc(docRef, {
            notifications: { ...currentData.notifications, ...notifications },
            updatedAt: serverTimestamp(),
        });
    }
}

/**
 * Reset settings to defaults
 */
export async function resetUserSettings(userId: string): Promise<void> {
    const docRef = getSettingsRef(userId);

    await setDoc(docRef, {
        ...DEFAULT_SETTINGS,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
}
