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

export interface MeetingMessage {
    id: string;
    speaker: string;
    speakerIndex: number;
    content: string;
    timestamp: Date;
}

export interface Meeting {
    id: string;
    userId: string;
    title: string;
    persona1Name: string;
    persona2Name: string;
    topic: string;
    messages: MeetingMessage[];
    rounds: number;
    createdAt: Date;
    updatedAt: Date;
}

const COLLECTION_NAME = "meetings";

// Get all meetings for a user
export async function getMeetings(userId: string): Promise<Meeting[]> {
    const q = query(
        collection(db, COLLECTION_NAME),
        where("userId", "==", userId),
        orderBy("updatedAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as Timestamp)?.toDate() || new Date(),
        updatedAt: (doc.data().updatedAt as Timestamp)?.toDate() || new Date(),
        messages: (doc.data().messages || []).map((m: MeetingMessage & { timestamp: Timestamp | Date }) => ({
            ...m,
            timestamp: m.timestamp instanceof Timestamp ? m.timestamp.toDate() : m.timestamp,
        })),
    })) as Meeting[];
}

// Get a single meeting
export async function getMeeting(id: string): Promise<Meeting | null> {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        return null;
    }

    const data = docSnap.data();
    return {
        id: docSnap.id,
        ...data,
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
        messages: (data.messages || []).map((m: MeetingMessage & { timestamp: Timestamp | Date }) => ({
            ...m,
            timestamp: m.timestamp instanceof Timestamp ? m.timestamp.toDate() : m.timestamp,
        })),
    } as Meeting;
}

// Create a new meeting
export async function createMeeting(
    userId: string,
    data: {
        title: string;
        persona1Name: string;
        persona2Name: string;
        topic: string;
        messages: MeetingMessage[];
        rounds: number;
    }
): Promise<string> {
    // Convert Date to Timestamp for storage
    const messagesForStorage = data.messages.map((m) => ({
        ...m,
        timestamp: Timestamp.fromDate(m.timestamp),
    }));

    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        userId,
        title: data.title,
        persona1Name: data.persona1Name,
        persona2Name: data.persona2Name,
        topic: data.topic,
        messages: messagesForStorage,
        rounds: data.rounds,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
}

// Update a meeting
export async function updateMeeting(
    id: string,
    data: Partial<{
        title: string;
        messages: MeetingMessage[];
        rounds: number;
    }>
): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);

    const updateData: Record<string, unknown> = {
        updatedAt: serverTimestamp(),
    };

    if (data.title !== undefined) {
        updateData.title = data.title;
    }

    if (data.rounds !== undefined) {
        updateData.rounds = data.rounds;
    }

    if (data.messages !== undefined) {
        updateData.messages = data.messages.map((m) => ({
            ...m,
            timestamp: Timestamp.fromDate(m.timestamp),
        }));
    }

    await updateDoc(docRef, updateData);
}

// Delete a meeting
export async function deleteMeeting(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
}

// Get meeting count for a user
export async function getMeetingCount(userId: string): Promise<number> {
    const q = query(
        collection(db, COLLECTION_NAME),
        where("userId", "==", userId)
    );
    const snapshot = await getDocs(q);
    return snapshot.size;
}

// Update meeting messages (alias for updateMeeting with just messages)
export async function updateMeetingMessages(
    id: string,
    messages: MeetingMessage[],
    rounds?: number
): Promise<void> {
    await updateMeeting(id, { messages, rounds });
}

