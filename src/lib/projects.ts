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
    limit,
} from "firebase/firestore";
import { db } from "./firebase";
import { ProjectContext, ProjectContextInput } from "@/types/project";

const COLLECTION_NAME = "projects";

// Get all projects
export async function getProjects(): Promise<ProjectContext[]> {
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

// Get the active/most recent project (for quick access)
export async function getActiveProject(): Promise<ProjectContext | null> {
    const q = query(
        collection(db, COLLECTION_NAME),
        orderBy("updatedAt", "desc"),
        limit(1)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        return null;
    }

    const doc = snapshot.docs[0];
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
    } as ProjectContext;
}

// Create a new project
export async function createProject(
    input: ProjectContextInput
): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...input,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
}

// Update a project
export async function updateProject(
    id: string,
    input: Partial<ProjectContextInput>
): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
        ...input,
        updatedAt: serverTimestamp(),
    });
}

// Delete a project
export async function deleteProject(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
}

// Generate context string for persona prompts
export function generateContextPrompt(project: ProjectContext): string {
    return `## Contexto do Projeto: ${project.name}

### Descrição
${project.description || "Não informado"}

### Problema que Resolve
${project.problemSolved || "Não informado"}

### Público-Alvo
${project.targetAudience || "Não informado"}

### Diferenciais
${project.differentials || "Não informado"}

### Estágio Atual
${project.currentStage === "idea" ? "Ideia" :
            project.currentStage === "validation" ? "Validação" :
                project.currentStage === "mvp" ? "MVP" :
                    project.currentStage === "growth" ? "Crescimento" : "Escala"}

### Métricas-Chave
${project.keyMetrics || "Não informado"}

### Objetivos Atuais
${project.currentGoals || "Não informado"}

${project.additionalNotes ? `### Notas Adicionais\n${project.additionalNotes}` : ""}
`;
}
