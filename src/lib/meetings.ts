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

// Get all meetings
export async function getMeetings(): Promise<Meeting[]> {
    const q = query(
        collection(db, COLLECTION_NAME),
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
    persona1Name: string,
    persona2Name: string,
    topic: string
): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        title: `${persona1Name} vs ${persona2Name}`,
        persona1Name,
        persona2Name,
        topic,
        messages: [],
        rounds: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
}

// Update meeting messages
export async function updateMeetingMessages(
    id: string,
    messages: MeetingMessage[],
    rounds: number
): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
        messages: messages.map(m => ({
            ...m,
            timestamp: m.timestamp instanceof Date ? Timestamp.fromDate(m.timestamp) : m.timestamp,
        })),
        rounds,
        updatedAt: serverTimestamp(),
    });
}

// Update meeting title
export async function updateMeetingTitle(
    id: string,
    title: string
): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
        title,
        updatedAt: serverTimestamp(),
    });
}

// Delete a meeting
export async function deleteMeeting(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
}

// Generate a title from the topic
export function generateMeetingTitle(topic: string, persona1: string, persona2: string): string {
    const shortTopic = topic.length > 30 ? topic.substring(0, 30) + "..." : topic;
    return `${shortTopic} • ${persona1} vs ${persona2}`;
}
