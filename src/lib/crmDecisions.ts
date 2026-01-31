/**
 * 📋 CRM Decisions Firestore Service
 * 
 * CRUD operations for CRM Decisions in Firestore.
 * Decisions are stored as subcollection: users/{userId}/crmDecisions
 * 
 * @see regras_decisoes.md — CRM de Decisões (Hierarquia)
 * @see react-patterns skill — Custom hooks
 */

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
    serverTimestamp,
    onSnapshot,
    Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import { DecisionWithCRM, KanbanStatus } from "@/types/crm";

// ============================================
// 📐 CONSTANTS
// ============================================

const USERS_COLLECTION = "users";
const DECISIONS_SUBCOLLECTION = "crmDecisions";

// ============================================
// 🔧 HELPERS
// ============================================

function getDecisionsRef(userId: string) {
    return collection(db, USERS_COLLECTION, userId, DECISIONS_SUBCOLLECTION);
}

function getDecisionRef(userId: string, decisionId: string) {
    return doc(db, USERS_COLLECTION, userId, DECISIONS_SUBCOLLECTION, decisionId);
}

function parseDecision(data: any, id: string): DecisionWithCRM {
    return {
        id,
        userId: data.userId,
        sessionId: data.sessionId,
        projectId: data.projectId,
        projectName: data.projectName,
        title: data.title,
        decision: data.decision,
        reasoning: data.reasoning,
        alternatives: data.alternatives || [],
        acceptedRisks: data.acceptedRisks || [],
        nextAction: data.nextAction,
        actionDeadline: data.actionDeadline?.toDate?.() || undefined,
        reviewDate: data.reviewDate?.toDate?.() || undefined,
        outcome: data.outcome,
        learning: data.learning,
        pipelineStatus: data.pipelineStatus || 'draft',
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || undefined,
        reviewedAt: data.reviewedAt?.toDate?.() || undefined,
    };
}

// ============================================
// 📖 READ OPERATIONS
// ============================================

/**
 * Get all decisions for a user
 */
export async function getCRMDecisions(userId: string): Promise<DecisionWithCRM[]> {
    const q = query(
        getDecisionsRef(userId),
        orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => parseDecision(doc.data(), doc.id));
}

/**
 * Get decisions by project
 */
export async function getCRMDecisionsByProject(
    userId: string,
    projectId: string
): Promise<DecisionWithCRM[]> {
    const q = query(
        getDecisionsRef(userId),
        where("projectId", "==", projectId),
        orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => parseDecision(doc.data(), doc.id));
}

/**
 * Get decisions by pipeline status
 */
export async function getCRMDecisionsByStatus(
    userId: string,
    status: KanbanStatus
): Promise<DecisionWithCRM[]> {
    const q = query(
        getDecisionsRef(userId),
        where("pipelineStatus", "==", status),
        orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => parseDecision(doc.data(), doc.id));
}

/**
 * Get a single decision
 */
export async function getCRMDecision(
    userId: string,
    decisionId: string
): Promise<DecisionWithCRM | null> {
    const docRef = getDecisionRef(userId, decisionId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        return null;
    }

    return parseDecision(docSnap.data(), docSnap.id);
}

/**
 * Subscribe to decisions changes (real-time)
 */
export function subscribeToCRMDecisions(
    userId: string,
    onData: (decisions: DecisionWithCRM[]) => void,
    onError?: (error: Error) => void
): Unsubscribe {
    const q = query(
        getDecisionsRef(userId),
        orderBy("createdAt", "desc")
    );

    return onSnapshot(
        q,
        (snapshot) => {
            const decisions = snapshot.docs.map(doc => parseDecision(doc.data(), doc.id));
            onData(decisions);
        },
        (error) => {
            console.error("[CRMDecisions] Subscription error:", error);
            onError?.(error);
        }
    );
}

// ============================================
// ✏️ WRITE OPERATIONS
// ============================================

/**
 * Create a new decision
 */
export async function createCRMDecision(
    userId: string,
    data: Omit<DecisionWithCRM, "id" | "createdAt" | "updatedAt">
): Promise<DecisionWithCRM> {
    const decisionData = {
        ...data,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(getDecisionsRef(userId), decisionData);

    return {
        ...data,
        id: docRef.id,
        createdAt: new Date(),
    };
}

/**
 * Update decision fields
 */
export async function updateCRMDecision(
    userId: string,
    decisionId: string,
    updates: Partial<Omit<DecisionWithCRM, "id" | "userId" | "createdAt">>
): Promise<void> {
    const docRef = getDecisionRef(userId, decisionId);

    await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
    });
}

/**
 * Update decision pipeline status
 */
export async function updateCRMDecisionStatus(
    userId: string,
    decisionId: string,
    newStatus: KanbanStatus
): Promise<void> {
    const docRef = getDecisionRef(userId, decisionId);

    await updateDoc(docRef, {
        pipelineStatus: newStatus,
        updatedAt: serverTimestamp(),
    });
}

/**
 * Assign decision to project
 */
export async function assignCRMDecisionToProject(
    userId: string,
    decisionId: string,
    projectId: string | null,
    projectName?: string
): Promise<void> {
    const docRef = getDecisionRef(userId, decisionId);

    await updateDoc(docRef, {
        projectId: projectId,
        projectName: projectName || null,
        updatedAt: serverTimestamp(),
    });
}

/**
 * Mark decision as reviewed
 */
export async function markCRMDecisionReviewed(
    userId: string,
    decisionId: string,
    outcome: DecisionWithCRM["outcome"],
    learning?: string
): Promise<void> {
    const docRef = getDecisionRef(userId, decisionId);

    await updateDoc(docRef, {
        outcome,
        learning: learning || null,
        pipelineStatus: 'audited' as KanbanStatus,
        reviewedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
}

/**
 * Delete a decision
 */
export async function deleteCRMDecision(userId: string, decisionId: string): Promise<void> {
    const docRef = getDecisionRef(userId, decisionId);
    await deleteDoc(docRef);
}
