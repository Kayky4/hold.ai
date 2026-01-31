/**
 * 👥 Personas Service — HoldAI
 * 
 * CRUD e operações para personas do usuário.
 * Segue princípios de Clean Architecture e DDD.
 * 
 * @see regras_decisoes.md para regras de negócio
 * @see fluxos_jornadas.md para fluxos
 */

import { db } from "@/lib/firebase";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    Timestamp,
    serverTimestamp,
} from "firebase/firestore";
import type { Persona } from "@/types";
import { DEFAULT_PERSONAS, MODERATOR, DEFAULT_COUNSELORS } from "./defaultPersonas";

// ============================================
// 🔧 CONSTANTES
// ============================================

const USERS_COLLECTION = "users";
const PERSONAS_COLLECTION = "personas";

/**
 * Template padrão para criar novas personas
 * @deprecated Use DEFAULT_COUNSELORS para personas do sistema
 */
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
    riskTolerance: 5,
    objectives: [
        "Ajudar fundadores a tomar decisões melhores",
        "Desafiar suposições e identificar pontos cegos",
    ],
    instructions: [
        "Nunca bajule ou concorde só para agradar",
        "Faça perguntas provocativas que levem a insights",
        "Seja honesto mesmo quando a verdade é desconfortável",
    ],
    isSystem: false,
    isEditable: true,
    type: "counselor",
    intensity: 3,
};

// ============================================
// 🔄 CONVERSORES
// ============================================

/** Converte Firestore Timestamp para Date */
const timestampToDate = (timestamp: Timestamp | Date | undefined): Date => {
    if (!timestamp) return new Date();
    if (timestamp instanceof Date) return timestamp;
    return timestamp.toDate();
};

/** Converte dados do Firestore para Persona */
const firestoreToPersona = (data: Record<string, unknown>): Persona => ({
    id: data.id as string,
    name: data.name as string,
    description: data.description as string,
    style: data.style as string,
    tone: data.tone as string,
    principles: data.principles as string[] || [],
    biases: data.biases as string[] || [],
    riskTolerance: data.riskTolerance as number || 5,
    objectives: data.objectives as string[] || [],
    instructions: data.instructions as string[] || [],
    isSystem: data.isSystem as boolean | undefined,
    isEditable: data.isEditable as boolean | undefined,
    type: data.type as 'moderator' | 'counselor' | undefined,
    intensity: data.intensity as number | undefined,
});

// ============================================
// 📖 READ OPERATIONS
// ============================================

/**
 * Busca todas as personas de um usuário
 */
export const getUserPersonas = async (userId: string): Promise<Persona[]> => {
    try {
        const personasRef = collection(db, USERS_COLLECTION, userId, PERSONAS_COLLECTION);
        const querySnapshot = await getDocs(personasRef);

        if (querySnapshot.empty) {
            // User has no personas, return defaults
            return DEFAULT_PERSONAS;
        }

        return querySnapshot.docs.map(docSnap =>
            firestoreToPersona(docSnap.data())
        );
    } catch (error) {
        console.error("Error getting user personas:", error);
        throw error;
    }
};

/**
 * Busca apenas os conselheiros de um usuário
 */
export const getUserCounselors = async (userId: string): Promise<Persona[]> => {
    try {
        const personasRef = collection(db, USERS_COLLECTION, userId, PERSONAS_COLLECTION);
        const q = query(personasRef, where("type", "==", "counselor"));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            // User has no counselors, return defaults
            return DEFAULT_COUNSELORS;
        }

        return querySnapshot.docs.map(docSnap =>
            firestoreToPersona(docSnap.data())
        );
    } catch (error) {
        console.error("Error getting user counselors:", error);
        throw error;
    }
};

/**
 * Busca o moderador do usuário
 */
export const getUserModerator = async (userId: string): Promise<Persona> => {
    try {
        const moderatorRef = doc(db, USERS_COLLECTION, userId, PERSONAS_COLLECTION, "system-moderator");
        const moderatorSnap = await getDoc(moderatorRef);

        if (!moderatorSnap.exists()) {
            // Return default moderator
            return MODERATOR;
        }

        return firestoreToPersona(moderatorSnap.data());
    } catch (error) {
        console.error("Error getting moderator:", error);
        // Return default as fallback
        return MODERATOR;
    }
};

/**
 * Busca uma persona específica por ID
 */
export const getPersona = async (userId: string, personaId: string): Promise<Persona | null> => {
    try {
        const personaRef = doc(db, USERS_COLLECTION, userId, PERSONAS_COLLECTION, personaId);
        const personaSnap = await getDoc(personaRef);

        if (!personaSnap.exists()) {
            // Try to find in defaults
            const defaultPersona = DEFAULT_PERSONAS.find(p => p.id === personaId);
            return defaultPersona || null;
        }

        return firestoreToPersona(personaSnap.data());
    } catch (error) {
        console.error("Error getting persona:", error);
        throw error;
    }
};

/**
 * Busca múltiplas personas por IDs
 */
export const getPersonasByIds = async (userId: string, personaIds: string[]): Promise<Persona[]> => {
    try {
        const personas: Persona[] = [];

        for (const id of personaIds) {
            const persona = await getPersona(userId, id);
            if (persona) {
                personas.push(persona);
            }
        }

        return personas;
    } catch (error) {
        console.error("Error getting personas by IDs:", error);
        throw error;
    }
};

/**
 * Busca todas as personas (para compatibilidade com código legado)
 * @deprecated Use getUserPersonas instead
 */
export const getPersonas = async (userId: string): Promise<Persona[]> => {
    return getUserPersonas(userId);
};

// ============================================
// ✏️ WRITE OPERATIONS
// ============================================

/**
 * Cria uma nova persona personalizada
 */
export const createPersona = async (
    userId: string,
    persona: Omit<Persona, "id" | "isSystem">
): Promise<Persona> => {
    try {
        const personasRef = collection(db, USERS_COLLECTION, userId, PERSONAS_COLLECTION);
        const personaRef = doc(personasRef);

        const newPersona: Persona = {
            ...persona,
            id: personaRef.id,
            isSystem: false,
            isEditable: true,
            type: "counselor",
        };

        await setDoc(personaRef, {
            ...newPersona,
            userId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        return newPersona;
    } catch (error) {
        console.error("Error creating persona:", error);
        throw error;
    }
};

/**
 * Atualiza uma persona existente
 * 
 * ⚠️ Moderador não pode ser editado
 */
export const updatePersona = async (
    userId: string,
    personaId: string,
    updates: Partial<Omit<Persona, "id" | "isSystem">>
): Promise<void> => {
    try {
        // Check if editable
        const persona = await getPersona(userId, personaId);
        if (!persona) {
            throw new Error("Persona not found");
        }

        if (persona.type === "moderator" || persona.isEditable === false) {
            throw new Error("This persona cannot be edited");
        }

        const personaRef = doc(db, USERS_COLLECTION, userId, PERSONAS_COLLECTION, personaId);
        await updateDoc(personaRef, {
            ...updates,
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error updating persona:", error);
        throw error;
    }
};

/**
 * Reseta uma persona do sistema para os valores padrão
 */
export const resetPersonaToDefault = async (
    userId: string,
    personaId: string
): Promise<Persona | null> => {
    try {
        const defaultPersona = DEFAULT_PERSONAS.find(p => p.id === personaId);
        if (!defaultPersona) {
            throw new Error("Default persona not found");
        }

        const personaRef = doc(db, USERS_COLLECTION, userId, PERSONAS_COLLECTION, personaId);
        await setDoc(personaRef, {
            ...defaultPersona,
            userId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        return defaultPersona;
    } catch (error) {
        console.error("Error resetting persona:", error);
        throw error;
    }
};

// ============================================
// 🗑️ DELETE OPERATIONS
// ============================================

/**
 * Deleta uma persona personalizada
 * 
 * ⚠️ Personas do sistema e Moderador não podem ser deletadas
 */
export const deletePersona = async (userId: string, personaId: string): Promise<void> => {
    try {
        // Check if deletable
        const persona = await getPersona(userId, personaId);
        if (!persona) {
            throw new Error("Persona not found");
        }

        // Moderator cannot be deleted
        if (persona.type === "moderator") {
            throw new Error("O Moderador não pode ser removido");
        }

        if (persona.isSystem) {
            throw new Error("Personas do sistema não podem ser deletadas");
        }

        const personaRef = doc(db, USERS_COLLECTION, userId, PERSONAS_COLLECTION, personaId);
        await deleteDoc(personaRef);
    } catch (error) {
        console.error("Error deleting persona:", error);
        throw error;
    }
};

// ============================================
// 🔍 UTILITY FUNCTIONS
// ============================================

/**
 * Verifica se o usuário pode editar uma persona
 */
export const canEditPersona = (persona: Persona): boolean => {
    // Moderator cannot be edited
    if (persona.type === "moderator") return false;

    // System personas with isEditable false cannot be edited
    if (persona.isSystem && persona.isEditable === false) return false;

    return true;
};

/**
 * Verifica se o usuário pode deletar uma persona
 */
export const canDeletePersona = (persona: Persona): boolean => {
    // System personas cannot be deleted
    return !persona.isSystem;
};

/**
 * Retorna a cor associada a uma persona (para UI)
 */
export const getPersonaColor = (persona: Persona): string => {
    const colors: Record<string, string> = {
        "system-moderator": "#6B7280",      // Gray
        "system-strategist": "#3B82F6",     // Blue
        "system-pragmatist": "#10B981",     // Green
        "system-risk-analyst": "#EF4444",   // Red
        "system-mentor": "#8B5CF6",         // Purple
    };

    return colors[persona.id] || "#6366F1"; // Default indigo
};

/**
 * Retorna o ícone associado a uma persona (para UI)
 */
export const getPersonaIcon = (persona: Persona): string => {
    const icons: Record<string, string> = {
        "system-moderator": "🎯",
        "system-strategist": "🧠",
        "system-pragmatist": "🔧",
        "system-risk-analyst": "⚠️",
        "system-mentor": "🌱",
    };

    return icons[persona.id] || "👤";
};

/**
 * Gera o system prompt para uma persona
 */
export const generateSystemPrompt = (persona: Persona): string => {
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
Sua tolerância a risco é ${persona.riskTolerance}/10 (${persona.riskTolerance <= 3
            ? "conservador"
            : persona.riskTolerance <= 6
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
};
