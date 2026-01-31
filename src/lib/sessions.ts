/**
 * 💾 Sessions Service — HoldAI
 * 
 * CRUD e operações para sessões HOLD.
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
    limit,
    Timestamp,
    serverTimestamp,
} from "firebase/firestore";
import type {
    Session,
    SessionMessage,
    SessionPhase,
    SessionMode,
    SessionContext,
    SessionConfig,
} from "@/types";

// ============================================
// 🔧 CONSTANTES
// ============================================

const COLLECTION_NAME = "sessions";

/** Configuração padrão para novas sessões */
const DEFAULT_SESSION_CONFIG: SessionConfig = {
    useMemory: true,
    useProjectContext: true,
    isCrisisMode: false,
};

/** Contexto vazio inicial */
const EMPTY_CONTEXT: SessionContext = {
    problem: "",
    details: {},
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

/** Converte dados do Firestore para Session */
const firestoreToSession = (id: string, data: Record<string, unknown>): Session => ({
    id,
    userId: data.userId as string,
    title: data.title as string || "Nova Sessão",
    mode: data.mode as SessionMode || "solo",
    counselorIds: data.counselorIds as string[] || [],
    phase: data.phase as SessionPhase || "H",
    messages: (data.messages as SessionMessage[]) || [],
    context: (data.context as SessionContext) || EMPTY_CONTEXT,
    config: (data.config as SessionConfig) || DEFAULT_SESSION_CONFIG,
    decisionId: data.decisionId as string | undefined,
    projectId: data.projectId as string | undefined,
    createdAt: timestampToDate(data.createdAt as Timestamp),
    updatedAt: timestampToDate(data.updatedAt as Timestamp),
    pausedAt: data.pausedAt ? timestampToDate(data.pausedAt as Timestamp) : undefined,
    completedAt: data.completedAt ? timestampToDate(data.completedAt as Timestamp) : undefined,
    tags: data.tags as string[] | undefined,
});

/** Converte Session para dados do Firestore */
const sessionToFirestore = (session: Partial<Session>): Record<string, unknown> => {
    const data: Record<string, unknown> = {};

    if (session.userId !== undefined) data.userId = session.userId;
    if (session.title !== undefined) data.title = session.title;
    if (session.mode !== undefined) data.mode = session.mode;
    if (session.counselorIds !== undefined) data.counselorIds = session.counselorIds;
    if (session.phase !== undefined) data.phase = session.phase;
    if (session.messages !== undefined) data.messages = session.messages;
    if (session.context !== undefined) data.context = session.context;
    if (session.config !== undefined) data.config = session.config;
    if (session.decisionId !== undefined) data.decisionId = session.decisionId;
    if (session.projectId !== undefined) data.projectId = session.projectId;
    if (session.tags !== undefined) data.tags = session.tags;

    // Timestamps são gerenciados pelo Firestore
    data.updatedAt = serverTimestamp();

    return data;
};

// ============================================
// 📖 READ OPERATIONS
// ============================================

/**
 * Busca uma sessão por ID
 */
export const getSession = async (sessionId: string): Promise<Session | null> => {
    try {
        const docRef = doc(db, COLLECTION_NAME, sessionId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) return null;

        return firestoreToSession(docSnap.id, docSnap.data());
    } catch (error) {
        console.error("Error getting session:", error);
        throw error;
    }
};

/**
 * Lista todas as sessões de um usuário
 */
export const getUserSessions = async (
    userId: string,
    options?: {
        limitCount?: number;
        phase?: SessionPhase;
        projectId?: string;
    }
): Promise<Session[]> => {
    try {
        // Construir query base
        let q = query(
            collection(db, COLLECTION_NAME),
            where("userId", "==", userId),
            orderBy("updatedAt", "desc")
        );

        // Adicionar filtros opcionais
        if (options?.phase) {
            q = query(q, where("phase", "==", options.phase));
        }

        if (options?.projectId) {
            q = query(q, where("projectId", "==", options.projectId));
        }

        if (options?.limitCount) {
            q = query(q, limit(options.limitCount));
        }

        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(docSnap =>
            firestoreToSession(docSnap.id, docSnap.data())
        );
    } catch (error) {
        console.error("Error getting user sessions:", error);
        throw error;
    }
};

/**
 * Lista sessões ativas (não concluídas) de um usuário
 */
export const getActiveSessions = async (userId: string): Promise<Session[]> => {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            where("userId", "==", userId),
            where("phase", "not-in", ["completed"]),
            orderBy("updatedAt", "desc"),
            limit(10)
        );

        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(docSnap =>
            firestoreToSession(docSnap.id, docSnap.data())
        );
    } catch (error) {
        console.error("Error getting active sessions:", error);
        throw error;
    }
};

// ============================================
// ✏️ WRITE OPERATIONS
// ============================================

/**
 * Cria uma nova sessão
 */
export const createSession = async (
    userId: string,
    mode: SessionMode,
    counselorIds: string[],
    options?: {
        title?: string;
        projectId?: string;
        config?: Partial<SessionConfig>;
    }
): Promise<Session> => {
    try {
        const docRef = doc(collection(db, COLLECTION_NAME));
        const now = new Date();

        const session: Session = {
            id: docRef.id,
            userId,
            title: options?.title || "Nova Sessão",
            mode,
            counselorIds,
            phase: "H", // Sempre começa na Fase H
            messages: [],
            context: EMPTY_CONTEXT,
            config: {
                ...DEFAULT_SESSION_CONFIG,
                ...options?.config,
                isCrisisMode: mode === "crisis",
            },
            projectId: options?.projectId,
            createdAt: now,
            updatedAt: now,
        };

        await setDoc(docRef, {
            ...sessionToFirestore(session),
            createdAt: serverTimestamp(),
        });

        return session;
    } catch (error) {
        console.error("Error creating session:", error);
        throw error;
    }
};

/**
 * Atualiza uma sessão existente
 */
export const updateSession = async (
    sessionId: string,
    updates: Partial<Session>
): Promise<void> => {
    try {
        const docRef = doc(db, COLLECTION_NAME, sessionId);
        await updateDoc(docRef, sessionToFirestore(updates));
    } catch (error) {
        console.error("Error updating session:", error);
        throw error;
    }
};

/**
 * Adiciona uma mensagem à sessão
 */
export const addMessage = async (
    sessionId: string,
    message: Omit<SessionMessage, "id" | "timestamp">
): Promise<SessionMessage> => {
    try {
        const session = await getSession(sessionId);
        if (!session) throw new Error("Session not found");

        const newMessage: SessionMessage = {
            ...message,
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date(),
        };

        const updatedMessages = [...session.messages, newMessage];

        await updateSession(sessionId, { messages: updatedMessages });

        return newMessage;
    } catch (error) {
        console.error("Error adding message:", error);
        throw error;
    }
};

/**
 * Avança a sessão para a próxima fase
 */
export const advancePhase = async (sessionId: string): Promise<SessionPhase> => {
    try {
        const session = await getSession(sessionId);
        if (!session) throw new Error("Session not found");

        const phaseOrder: SessionPhase[] = ["H", "O", "L", "D", "completed"];
        const currentIndex = phaseOrder.indexOf(session.phase);

        if (currentIndex === -1 || currentIndex >= phaseOrder.length - 1) {
            return session.phase; // Já está completa ou em estado inválido
        }

        const nextPhase = phaseOrder[currentIndex + 1];

        const updates: Partial<Session> = { phase: nextPhase };

        if (nextPhase === "completed") {
            updates.completedAt = new Date();
        }

        await updateSession(sessionId, updates);

        return nextPhase;
    } catch (error) {
        console.error("Error advancing phase:", error);
        throw error;
    }
};

/**
 * Pausa uma sessão
 */
export const pauseSession = async (sessionId: string): Promise<void> => {
    try {
        await updateSession(sessionId, {
            phase: "paused",
            pausedAt: new Date(),
        });
    } catch (error) {
        console.error("Error pausing session:", error);
        throw error;
    }
};

/**
 * Retoma uma sessão pausada
 */
export const resumeSession = async (
    sessionId: string,
    resumeToPhase: SessionPhase
): Promise<void> => {
    try {
        await updateSession(sessionId, {
            phase: resumeToPhase,
            pausedAt: undefined,
        });
    } catch (error) {
        console.error("Error resuming session:", error);
        throw error;
    }
};

/**
 * Atualiza o contexto da sessão (Fase H)
 */
export const updateContext = async (
    sessionId: string,
    context: Partial<SessionContext>
): Promise<void> => {
    try {
        const session = await getSession(sessionId);
        if (!session) throw new Error("Session not found");

        const updatedContext: SessionContext = {
            ...session.context,
            ...context,
        };

        await updateSession(sessionId, { context: updatedContext });
    } catch (error) {
        console.error("Error updating context:", error);
        throw error;
    }
};

/**
 * Vincula uma decisão à sessão
 */
export const linkDecision = async (
    sessionId: string,
    decisionId: string
): Promise<void> => {
    try {
        await updateSession(sessionId, {
            decisionId,
            phase: "completed",
            completedAt: new Date(),
        });
    } catch (error) {
        console.error("Error linking decision:", error);
        throw error;
    }
};

// ============================================
// 🗑️ DELETE OPERATIONS
// ============================================

/**
 * Deleta uma sessão permanentemente
 * 
 * ⚠️ Atenção: Esta ação é irreversível!
 */
export const deleteSession = async (sessionId: string): Promise<void> => {
    try {
        const docRef = doc(db, COLLECTION_NAME, sessionId);
        await deleteDoc(docRef);
    } catch (error) {
        console.error("Error deleting session:", error);
        throw error;
    }
};

// ============================================
// 🔍 UTILITY FUNCTIONS
// ============================================

/**
 * Gera um título para a sessão baseado no contexto
 */
export const generateSessionTitle = (context: SessionContext): string => {
    if (context.problem) {
        // Limita a 50 caracteres
        const truncated = context.problem.substring(0, 47);
        return truncated.length < context.problem.length
            ? `${truncated}...`
            : truncated;
    }
    return "Nova Sessão";
};

/**
 * Verifica se uma sessão pode avançar de fase
 */
export const canAdvancePhase = (session: Session): boolean => {
    const { phase, messages, context } = session;

    // Fase H: Precisa ter contexto definido
    if (phase === "H") {
        return context.problem.trim().length > 0;
    }

    // Fase O: Precisa ter pelo menos uma mensagem de conselheiro
    if (phase === "O") {
        return messages.some(m =>
            m.speaker !== "user" && m.speaker !== "moderator" && m.phase === "O"
        );
    }

    // Fase L: Precisa ter síntese do moderador
    if (phase === "L") {
        return messages.some(m => m.speaker === "moderator" && m.phase === "L");
    }

    // Fase D: Sempre pode concluir
    if (phase === "D") {
        return true;
    }

    return false;
};

/**
 * Retorna o nome legível da fase
 */
export const getPhaseName = (phase: SessionPhase): string => {
    const names: Record<SessionPhase, string> = {
        H: "Clarificação",
        O: "Debate",
        L: "Decisão",
        D: "Ação",
        completed: "Concluída",
        paused: "Pausada",
    };
    return names[phase] || phase;
};

/**
 * Retorna a descrição da fase
 */
export const getPhaseDescription = (phase: SessionPhase): string => {
    const descriptions: Record<SessionPhase, string> = {
        H: "Definindo o problema e o contexto",
        O: "Conselheiros debatem perspectivas",
        L: "Sintetizando opções para decisão",
        D: "Definindo próxima ação concreta",
        completed: "Sessão finalizada",
        paused: "Sessão em espera",
    };
    return descriptions[phase] || "";
};
