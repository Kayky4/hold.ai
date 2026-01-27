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

export interface Decision {
    id: string;
    userId: string;
    decision: string;
    context: string;
    status: "pending" | "taken" | "revisited";
    outcome?: "success" | "failure" | null;
    meetingId: string;
    meetingTitle: string;
    projectId?: string;
    personas: string[];
    createdAt: Date;
    updatedAt: Date;
}

const COLLECTION_NAME = "decisions";

// Get all decisions for a user
export async function getDecisions(userId: string, projectId?: string): Promise<Decision[]> {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            where("userId", "==", userId),
            orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);
        let decisions = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: (doc.data().createdAt as Timestamp)?.toDate() || new Date(),
            updatedAt: (doc.data().updatedAt as Timestamp)?.toDate() || new Date(),
        })) as Decision[];

        // Filter by projectId on client side to avoid composite index
        if (projectId) {
            decisions = decisions.filter(d => d.projectId === projectId);
        }

        return decisions;
    } catch (error) {
        console.error("Error fetching decisions:", error);
        return [];
    }
}

// Get decision count for a user
export async function getDecisionCount(userId: string): Promise<number> {
    const q = query(
        collection(db, COLLECTION_NAME),
        where("userId", "==", userId)
    );
    const snapshot = await getDocs(q);
    return snapshot.size;
}

// Get decisions by meeting
export async function getDecisionsByMeeting(userId: string, meetingId: string): Promise<Decision[]> {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            where("userId", "==", userId),
            orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);
        const allDecisions = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: (doc.data().createdAt as Timestamp)?.toDate() || new Date(),
            updatedAt: (doc.data().updatedAt as Timestamp)?.toDate() || new Date(),
        })) as Decision[];

        // Filter by meetingId on client side to avoid composite index
        return allDecisions.filter(d => d.meetingId === meetingId);
    } catch (error) {
        console.error("Error fetching decisions by meeting:", error);
        return [];
    }
}

// Create a new decision
export async function createDecision(
    userId: string,
    decision: string,
    context: string,
    status: "pending" | "taken",
    meetingId: string,
    meetingTitle: string,
    personas: string[],
    projectId?: string
): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        userId,
        decision,
        context,
        status,
        outcome: null,
        meetingId,
        meetingTitle,
        projectId: projectId || null,
        personas,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
}

// Create multiple decisions at once
export async function createDecisionsFromSummary(
    userId: string,
    decisions: Array<{ decision: string; context: string; status: "pending" | "taken" }>,
    meetingId: string,
    meetingTitle: string,
    personas: string[],
    projectId?: string
): Promise<string[]> {
    const ids: string[] = [];

    for (const d of decisions) {
        const id = await createDecision(
            userId,
            d.decision,
            d.context,
            d.status,
            meetingId,
            meetingTitle,
            personas,
            projectId
        );
        ids.push(id);
    }

    return ids;
}

// Update decision status
export async function updateDecisionStatus(
    id: string,
    status: "pending" | "taken" | "revisited"
): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
        status,
        updatedAt: serverTimestamp(),
    });
}

// Update decision outcome
export async function updateDecisionOutcome(
    id: string,
    outcome: "success" | "failure"
): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
        outcome,
        status: "revisited",
        updatedAt: serverTimestamp(),
    });
}

// Delete a decision
export async function deleteDecision(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
}

// Get a single decision
export async function getDecision(id: string): Promise<Decision | null> {
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
    } as Decision;
}
