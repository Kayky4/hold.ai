import {
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    where,
    Timestamp,
    serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { Conversation, Message } from "@/types";

const CONVERSATIONS_COLLECTION = "conversations";

// Convert Firestore timestamp to Date
function timestampToDate(timestamp: Timestamp | null): Date {
    return timestamp?.toDate() || new Date();
}

// Create a new conversation
export interface CreateConversationOptions {
    mode?: 'solo' | 'mesa' | 'revisao';
    phase?: 'H' | 'O' | 'L' | 'D';
    counselorCount?: number;
    counselorIds?: string[];
}

export async function createConversation(
    userId: string,
    title: string = "Nova Conversa",
    options: CreateConversationOptions = {}
): Promise<string> {
    const docRef = await addDoc(collection(db, CONVERSATIONS_COLLECTION), {
        userId,
        title,
        messages: [],
        mode: options.mode || 'solo',
        phase: options.phase || 'H',
        counselorCount: options.counselorCount || 0,
        counselorIds: options.counselorIds || [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
}

// Get all conversations for a user
export async function getConversations(userId: string): Promise<Conversation[]> {
    const q = query(
        collection(db, CONVERSATIONS_COLLECTION),
        where("userId", "==", userId),
        orderBy("updatedAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
            id: doc.id,
            title: data.title || "Sem título",
            messages: (data.messages || []).map((msg: {
                id: string;
                role: "user" | "assistant";
                content: string;
                timestamp: Timestamp;
            }) => ({
                ...msg,
                timestamp: timestampToDate(msg.timestamp),
            })),
            createdAt: timestampToDate(data.createdAt),
            updatedAt: timestampToDate(data.updatedAt),
            mode: data.mode || 'solo',
            phase: data.phase || 'H',
            counselorCount: data.counselorCount || 0,
            counselorIds: data.counselorIds || [],
        };
    });
}

// Get a single conversation by ID
export async function getConversation(id: string): Promise<Conversation | null> {
    const docRef = doc(db, CONVERSATIONS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        return null;
    }

    const data = docSnap.data();
    return {
        id: docSnap.id,
        title: data.title || "Sem título",
        messages: (data.messages || []).map((msg: {
            id: string;
            role: "user" | "assistant";
            content: string;
            timestamp: Timestamp;
        }) => ({
            ...msg,
            timestamp: timestampToDate(msg.timestamp),
        })),
        createdAt: timestampToDate(data.createdAt),
        updatedAt: timestampToDate(data.updatedAt),
        mode: data.mode || 'solo',
        phase: data.phase || 'H',
        counselorCount: data.counselorCount || 0,
        counselorIds: data.counselorIds || [],
    };
}

// Update conversation with new messages
export async function updateConversationMessages(
    id: string,
    messages: Message[]
): Promise<void> {
    const docRef = doc(db, CONVERSATIONS_COLLECTION, id);

    // Convert Date to Timestamp for storage
    const messagesForStorage = messages.map((msg) => ({
        ...msg,
        timestamp: Timestamp.fromDate(msg.timestamp),
    }));

    await updateDoc(docRef, {
        messages: messagesForStorage,
        updatedAt: serverTimestamp(),
    });
}

// Update conversation title
export async function updateConversationTitle(
    id: string,
    title: string
): Promise<void> {
    const docRef = doc(db, CONVERSATIONS_COLLECTION, id);
    await updateDoc(docRef, {
        title,
        updatedAt: serverTimestamp(),
    });
}

// Delete a conversation
export async function deleteConversation(id: string): Promise<void> {
    const docRef = doc(db, CONVERSATIONS_COLLECTION, id);
    await deleteDoc(docRef);
}

// Generate a title from the first message
export function generateTitleFromMessage(content: string): string {
    const maxLength = 40;
    const cleaned = content.replace(/\n/g, " ").trim();
    if (cleaned.length <= maxLength) {
        return cleaned;
    }
    return cleaned.substring(0, maxLength).trim() + "...";
}
