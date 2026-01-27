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
    Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { Persona } from "@/types";

const PERSONAS_COLLECTION = "personas";

// Default persona template
export const DEFAULT_PERSONA: Omit<Persona, "id"> = {
    name: "Mentor Estratégico",
    description: "Consultor de negócios experiente e direto",
    style: "Direto, analítico e provocador",
    tone: "Informal, casual e natural",
    principles: [
        "Clareza acima de tudo",
        "Decisões baseadas em dados",
        "Evitar complexidade desnecessária",
    ],
    biases: [
        "Prefere validação rápida",
        "Cético em relação a planos muito elaborados",
    ],
    riskTolerance: 0.5,
    objectives: [
        "Ajudar fundadores a tomar decisões melhores",
        "Desafiar suposições e identificar pontos cegos",
    ],
    instructions: [
        "Nunca bajule ou concorde só para agradar",
        "Faça perguntas provocativas que levem a insights",
        "Seja honesto mesmo quando a verdade é desconfortável",
    ],
};

// Convert Firestore timestamp to Date
function timestampToDate(timestamp: Timestamp | null): Date {
    return timestamp?.toDate() || new Date();
}

// Create a new persona
export async function createPersona(persona: Omit<Persona, "id">): Promise<string> {
    const docRef = await addDoc(collection(db, PERSONAS_COLLECTION), {
        ...persona,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
}

// Get all personas
export async function getPersonas(): Promise<Persona[]> {
    const q = query(
        collection(db, PERSONAS_COLLECTION),
        orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
            id: doc.id,
            name: data.name || "",
            description: data.description || "",
            style: data.style || "",
            tone: data.tone || "",
            principles: data.principles || [],
            biases: data.biases || [],
            riskTolerance: data.riskTolerance ?? 0.5,
            objectives: data.objectives || [],
            instructions: data.instructions || [],
        };
    });
}

// Get a single persona by ID
export async function getPersona(id: string): Promise<Persona | null> {
    const docRef = doc(db, PERSONAS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        return null;
    }

    const data = docSnap.data();
    return {
        id: docSnap.id,
        name: data.name || "",
        description: data.description || "",
        style: data.style || "",
        tone: data.tone || "",
        principles: data.principles || [],
        biases: data.biases || [],
        riskTolerance: data.riskTolerance ?? 0.5,
        objectives: data.objectives || [],
        instructions: data.instructions || [],
    };
}

// Update a persona
export async function updatePersona(
    id: string,
    persona: Partial<Omit<Persona, "id">>
): Promise<void> {
    const docRef = doc(db, PERSONAS_COLLECTION, id);
    await updateDoc(docRef, {
        ...persona,
        updatedAt: serverTimestamp(),
    });
}

// Delete a persona
export async function deletePersona(id: string): Promise<void> {
    const docRef = doc(db, PERSONAS_COLLECTION, id);
    await deleteDoc(docRef);
}

// Generate system prompt from persona
export function generateSystemPrompt(persona: Persona): string {
    return `Você é ${persona.name}, ${persona.description}.

## Seu Perfil
- **Nome**: ${persona.name}
- **Estilo**: ${persona.style}
- **Tom**: ${persona.tone}

## Seus Princípios
${persona.principles.map((p) => `- ${p}`).join("\n")}

## Seus Vieses e Tendências
${persona.biases.map((b) => `- ${b}`).join("\n")}

## Seus Objetivos
${persona.objectives.map((o) => `- ${o}`).join("\n")}

## Instruções Específicas
${persona.instructions.map((i) => `- ${i}`).join("\n")}

## Tolerância a Risco
Sua tolerância a risco é ${Math.round(persona.riskTolerance * 100)}% (${persona.riskTolerance < 0.3
            ? "conservador"
            : persona.riskTolerance < 0.7
                ? "moderado"
                : "agressivo"
        }).

## Regras Gerais de Comportamento
- Responda sempre em português brasileiro (PT-BR)
- Mantenha respostas concisas e acionáveis
- Use exemplos práticos quando possível
- Se discordar, explique o porquê com clareza
- Faça perguntas de follow-up quando precisar de mais contexto
- Seja humano, não robótico

## Formato
- Use parágrafos curtos
- Destaque pontos importantes quando fizer sentido
- Evite listas longas, prefira texto fluido
`;
}
