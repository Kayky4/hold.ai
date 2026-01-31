/**
 * 📁 CRM Projects Firestore Service
 * 
 * CRUD operations for CRM Projects in Firestore.
 * Projects are stored as subcollection: users/{userId}/crmProjects
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
    serverTimestamp,
    onSnapshot,
    Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import { Project, ProjectStatus } from "@/types/crm";

// ============================================
// 📐 CONSTANTS
// ============================================

const USERS_COLLECTION = "users";
const PROJECTS_SUBCOLLECTION = "crmProjects";
const MAX_PROJECTS = 3;

// ============================================
// 🔧 HELPERS
// ============================================

function getProjectsRef(userId: string) {
    return collection(db, USERS_COLLECTION, userId, PROJECTS_SUBCOLLECTION);
}

function getProjectRef(userId: string, projectId: string) {
    return doc(db, USERS_COLLECTION, userId, PROJECTS_SUBCOLLECTION, projectId);
}

function parseProject(data: any, id: string): Project {
    return {
        id,
        userId: data.userId,
        name: data.name,
        description: data.description,
        northStarId: data.northStarId,
        status: data.status || 'active',
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || undefined,
        decisionCount: data.decisionCount || 0,
        // Context fields (Phase 21)
        context: data.context || undefined,
        goals: data.goals || undefined,
        constraints: data.constraints || undefined,
        stakeholders: data.stakeholders || undefined,
    };
}

// ============================================
// 📖 READ OPERATIONS
// ============================================

/**
 * Get all projects for a user
 */
export async function getCRMProjects(userId: string): Promise<Project[]> {
    const q = query(
        getProjectsRef(userId),
        orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => parseProject(doc.data(), doc.id));
}

/**
 * Get a single project
 */
export async function getCRMProject(userId: string, projectId: string): Promise<Project | null> {
    const docRef = getProjectRef(userId, projectId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        return null;
    }

    return parseProject(docSnap.data(), docSnap.id);
}

/**
 * Subscribe to projects changes (real-time)
 */
export function subscribeToCRMProjects(
    userId: string,
    onData: (projects: Project[]) => void,
    onError?: (error: Error) => void
): Unsubscribe {
    const q = query(
        getProjectsRef(userId),
        orderBy("createdAt", "desc")
    );

    return onSnapshot(
        q,
        (snapshot) => {
            const projects = snapshot.docs.map(doc => parseProject(doc.data(), doc.id));
            onData(projects);
        },
        (error) => {
            console.error("[CRMProjects] Subscription error:", error);
            onError?.(error);
        }
    );
}

// ============================================
// ✏️ WRITE OPERATIONS
// ============================================

/**
 * Create a new project
 */
export async function createCRMProject(
    userId: string,
    data: { name: string; description?: string; northStarId?: string }
): Promise<Project> {
    // Check project limit
    const existingProjects = await getCRMProjects(userId);
    if (existingProjects.length >= MAX_PROJECTS) {
        throw new Error(`Limite de ${MAX_PROJECTS} projetos atingido. Exclua um projeto existente para criar um novo.`);
    }

    const projectData = {
        userId,
        name: data.name,
        description: data.description || null,
        northStarId: data.northStarId || null,
        status: 'active' as ProjectStatus,
        decisionCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(getProjectsRef(userId), projectData);

    return {
        id: docRef.id,
        userId,
        name: data.name,
        description: data.description,
        northStarId: data.northStarId,
        status: 'active',
        createdAt: new Date(),
        decisionCount: 0,
    };
}

/**
 * Update a project
 */
export async function updateCRMProject(
    userId: string,
    projectId: string,
    updates: Partial<Pick<Project, "name" | "description" | "status" | "northStarId" | "context" | "goals" | "constraints" | "stakeholders">>
): Promise<void> {
    const docRef = getProjectRef(userId, projectId);

    await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
    });
}

/**
 * Delete a project
 */
export async function deleteCRMProject(userId: string, projectId: string): Promise<void> {
    const docRef = getProjectRef(userId, projectId);
    await deleteDoc(docRef);
}

/**
 * Increment decision count for a project
 */
export async function incrementProjectDecisionCount(
    userId: string,
    projectId: string,
    increment: number = 1
): Promise<void> {
    const docRef = getProjectRef(userId, projectId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const currentCount = docSnap.data().decisionCount || 0;
        await updateDoc(docRef, {
            decisionCount: currentCount + increment,
            updatedAt: serverTimestamp(),
        });
    }
}
