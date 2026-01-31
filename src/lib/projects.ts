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
    limit,
} from "firebase/firestore";
import { db } from "./firebase";
import { ProjectContext, ProjectContextInput } from "@/types/project";

const COLLECTION_NAME = "projects";

// Get all projects for a user
export async function getProjects(userId: string): Promise<ProjectContext[]> {
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
    })) as ProjectContext[];
}

// Get a single project
export async function getProject(id: string): Promise<ProjectContext | null> {
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
    } as ProjectContext;
}

// Get the active/most recent project for a user
export async function getActiveProject(userId: string): Promise<ProjectContext | null> {
    const q = query(
        collection(db, COLLECTION_NAME),
        where("userId", "==", userId),
        orderBy("updatedAt", "desc"),
        limit(1)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        return null;
    }

    const docItem = snapshot.docs[0];
    const data = docItem.data();
    return {
        id: docItem.id,
        ...data,
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
    } as ProjectContext;
}

// Maximum number of projects per user
const MAX_PROJECTS_PER_USER = 3;

// Create a new project
export async function createProject(userId: string, data: ProjectContextInput): Promise<string> {
    // Validate project limit
    const existingProjects = await getProjects(userId);
    if (existingProjects.length >= MAX_PROJECTS_PER_USER) {
        throw new Error(`Limite de ${MAX_PROJECTS_PER_USER} projetos atingido. Exclua um projeto existente para criar um novo.`);
    }

    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        userId,
        name: data.name,
        description: data.description || "",
        problemSolved: data.problemSolved || "",
        targetAudience: data.targetAudience || "",
        differentials: data.differentials || "",
        currentStage: data.currentStage || "idea",
        keyMetrics: data.keyMetrics || "",
        currentGoals: data.currentGoals || "",
        additionalNotes: data.additionalNotes || "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
}

// Update a project
export async function updateProject(id: string, data: Partial<ProjectContextInput>): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
    });
}

// Delete a project
export async function deleteProject(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
}

// Generate context prompt from project
export function generateContextPrompt(project: ProjectContext): string {
    let prompt = `## Contexto do Projeto\n\n`;
    prompt += `**Nome**: ${project.name}\n`;
    prompt += `**Estágio**: ${project.currentStage}\n`;

    if (project.description) {
        prompt += `**Descrição**: ${project.description}\n`;
    }

    if (project.problemSolved) {
        prompt += `**Problema Resolvido**: ${project.problemSolved}\n`;
    }

    if (project.targetAudience) {
        prompt += `**Público-alvo**: ${project.targetAudience}\n`;
    }

    if (project.differentials) {
        prompt += `**Diferenciais**: ${project.differentials}\n`;
    }

    if (project.keyMetrics) {
        prompt += `**Métricas-chave**: ${project.keyMetrics}\n`;
    }

    if (project.currentGoals) {
        prompt += `**Objetivos atuais**: ${project.currentGoals}\n`;
    }

    if (project.additionalNotes) {
        prompt += `**Notas adicionais**: ${project.additionalNotes}\n`;
    }

    return prompt;
}
