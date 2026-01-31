/**
 * ⏸️ useSessionPersistence Hook
 * 
 * Hook para gerenciar persistência de sessões pausadas.
 * Seguindo architecture skill (simplicity) e react-patterns.
 * 
 * @see fluxos_jornadas.md — Recapitulação ao Retomar
 * @see react-patterns skill — Custom hooks
 */

import { useState, useCallback, useEffect } from "react";
import { Session, SessionMessage, SessionContext, SessionPhase, SessionMode } from "@/types";

// ============================================
// 📐 TYPES
// ============================================

export interface PausedSession {
    id: string;
    title: string;
    preview: string;
    phase: SessionPhase;
    mode: SessionMode;
    pausedAt: Date;
    messageCount: number;
}

interface UseSessionPersistenceReturn {
    /** Lista de sessões pausadas */
    pausedSessions: PausedSession[];
    /** Sessão atual (se houver) */
    currentSession: Session | null;
    /** Se está carregando */
    isLoading: boolean;
    /** Erro atual */
    error: string | null;
    /** Pausa a sessão atual */
    pauseSession: (session: Session) => Promise<void>;
    /** Carrega uma sessão pausada */
    loadSession: (sessionId: string) => Promise<Session | null>;
    /** Remove uma sessão pausada */
    deleteSession: (sessionId: string) => Promise<void>;
    /** Salva estado da sessão */
    saveSessionState: (session: Session) => Promise<void>;
    /** Resume a sessão (marca como não pausada) */
    resumeSession: (sessionId: string) => Promise<Session | null>;
    /** Verifica se há sessões pausadas */
    hasPausedSessions: boolean;
}

// ============================================
// 🔑 STORAGE KEYS
// ============================================

const STORAGE_KEYS = {
    SESSIONS: 'holdai_sessions',
    CURRENT_SESSION: 'holdai_current_session'
} as const;

// ============================================
// 🪝 HOOK
// ============================================

export function useSessionPersistence(): UseSessionPersistenceReturn {
    const [pausedSessions, setPausedSessions] = useState<PausedSession[]>([]);
    const [currentSession, setCurrentSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ============================================
    // 🔧 STORAGE HELPERS
    // ============================================

    /**
     * Save sessions to localStorage
     */
    const saveToStorage = useCallback((key: string, data: unknown) => {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (err) {
            console.error('[useSessionPersistence] Storage save error:', err);
            setError('Erro ao salvar dados localmente');
        }
    }, []);

    /**
     * Load sessions from localStorage
     */
    const loadFromStorage = useCallback(<T>(key: string): T | null => {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (err) {
            console.error('[useSessionPersistence] Storage load error:', err);
            return null;
        }
    }, []);

    /**
     * Convert Session to PausedSession summary
     */
    const toPausedSession = useCallback((session: Session): PausedSession => {
        const preview = session.context?.problem || session.title;
        return {
            id: session.id,
            title: session.title,
            preview: preview.length > 80 ? preview.substring(0, 77) + '...' : preview,
            phase: session.phase,
            mode: session.mode,
            pausedAt: session.pausedAt || new Date(),
            messageCount: session.messages.length
        };
    }, []);

    // ============================================
    // 📥 INITIAL LOAD
    // ============================================

    useEffect(() => {
        setIsLoading(true);
        try {
            // Load sessions index
            const sessions = loadFromStorage<Session[]>(STORAGE_KEYS.SESSIONS) || [];
            const paused = sessions
                .filter(s => s.phase === 'paused' || s.pausedAt)
                .map(toPausedSession)
                .sort((a, b) => new Date(b.pausedAt).getTime() - new Date(a.pausedAt).getTime());

            setPausedSessions(paused);

            // Load current session if exists
            const current = loadFromStorage<Session>(STORAGE_KEYS.CURRENT_SESSION);
            if (current) {
                setCurrentSession(current);
            }
        } catch (err) {
            console.error('[useSessionPersistence] Load error:', err);
            setError('Erro ao carregar sessões');
        } finally {
            setIsLoading(false);
        }
    }, [loadFromStorage, toPausedSession]);

    // ============================================
    // 📤 ACTIONS
    // ============================================

    /**
     * Pausa a sessão atual
     */
    const pauseSession = useCallback(async (session: Session) => {
        setIsLoading(true);
        setError(null);

        try {
            const pausedSession: Session = {
                ...session,
                phase: session.phase, // Mantém a fase, não muda para 'paused'
                pausedAt: new Date(),
                updatedAt: new Date()
            };

            // Load existing sessions
            const sessions = loadFromStorage<Session[]>(STORAGE_KEYS.SESSIONS) || [];

            // Update or add session
            const existingIndex = sessions.findIndex(s => s.id === session.id);
            if (existingIndex >= 0) {
                sessions[existingIndex] = pausedSession;
            } else {
                sessions.push(pausedSession);
            }

            // Save to storage
            saveToStorage(STORAGE_KEYS.SESSIONS, sessions);

            // Clear current session
            localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
            setCurrentSession(null);

            // Update paused sessions list
            const paused = sessions
                .filter(s => s.pausedAt && !s.completedAt)
                .map(toPausedSession)
                .sort((a, b) => new Date(b.pausedAt).getTime() - new Date(a.pausedAt).getTime());

            setPausedSessions(paused);

            console.log('[useSessionPersistence] Session paused:', session.id);
        } catch (err) {
            console.error('[useSessionPersistence] Pause error:', err);
            setError('Erro ao pausar sessão');
        } finally {
            setIsLoading(false);
        }
    }, [loadFromStorage, saveToStorage, toPausedSession]);

    /**
     * Carrega uma sessão específica
     */
    const loadSession = useCallback(async (sessionId: string): Promise<Session | null> => {
        setIsLoading(true);
        setError(null);

        try {
            const sessions = loadFromStorage<Session[]>(STORAGE_KEYS.SESSIONS) || [];
            const session = sessions.find(s => s.id === sessionId);

            if (!session) {
                setError('Sessão não encontrada');
                return null;
            }

            console.log('[useSessionPersistence] Session loaded:', sessionId);
            return session;
        } catch (err) {
            console.error('[useSessionPersistence] Load session error:', err);
            setError('Erro ao carregar sessão');
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [loadFromStorage]);

    /**
     * Resume uma sessão pausada
     */
    const resumeSession = useCallback(async (sessionId: string): Promise<Session | null> => {
        setIsLoading(true);
        setError(null);

        try {
            const sessions = loadFromStorage<Session[]>(STORAGE_KEYS.SESSIONS) || [];
            const sessionIndex = sessions.findIndex(s => s.id === sessionId);

            if (sessionIndex === -1) {
                setError('Sessão não encontrada');
                return null;
            }

            // Remove pausedAt to mark as resumed
            const resumedSession: Session = {
                ...sessions[sessionIndex],
                pausedAt: undefined,
                updatedAt: new Date()
            };

            // Update in storage
            sessions[sessionIndex] = resumedSession;
            saveToStorage(STORAGE_KEYS.SESSIONS, sessions);

            // Set as current session
            saveToStorage(STORAGE_KEYS.CURRENT_SESSION, resumedSession);
            setCurrentSession(resumedSession);

            // Update paused list
            const paused = sessions
                .filter(s => s.pausedAt && !s.completedAt)
                .map(toPausedSession)
                .sort((a, b) => new Date(b.pausedAt).getTime() - new Date(a.pausedAt).getTime());

            setPausedSessions(paused);

            console.log('[useSessionPersistence] Session resumed:', sessionId);
            return resumedSession;
        } catch (err) {
            console.error('[useSessionPersistence] Resume error:', err);
            setError('Erro ao retomar sessão');
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [loadFromStorage, saveToStorage, toPausedSession]);

    /**
     * Salva estado atual da sessão
     */
    const saveSessionState = useCallback(async (session: Session) => {
        try {
            const updatedSession: Session = {
                ...session,
                updatedAt: new Date()
            };

            // Update in sessions list
            const sessions = loadFromStorage<Session[]>(STORAGE_KEYS.SESSIONS) || [];
            const existingIndex = sessions.findIndex(s => s.id === session.id);

            if (existingIndex >= 0) {
                sessions[existingIndex] = updatedSession;
            } else {
                sessions.push(updatedSession);
            }

            saveToStorage(STORAGE_KEYS.SESSIONS, sessions);
            saveToStorage(STORAGE_KEYS.CURRENT_SESSION, updatedSession);
            setCurrentSession(updatedSession);

        } catch (err) {
            console.error('[useSessionPersistence] Save state error:', err);
        }
    }, [loadFromStorage, saveToStorage]);

    /**
     * Remove uma sessão
     */
    const deleteSession = useCallback(async (sessionId: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const sessions = loadFromStorage<Session[]>(STORAGE_KEYS.SESSIONS) || [];
            const filtered = sessions.filter(s => s.id !== sessionId);

            saveToStorage(STORAGE_KEYS.SESSIONS, filtered);

            // Update paused list
            const paused = filtered
                .filter(s => s.pausedAt && !s.completedAt)
                .map(toPausedSession)
                .sort((a, b) => new Date(b.pausedAt).getTime() - new Date(a.pausedAt).getTime());

            setPausedSessions(paused);

            console.log('[useSessionPersistence] Session deleted:', sessionId);
        } catch (err) {
            console.error('[useSessionPersistence] Delete error:', err);
            setError('Erro ao deletar sessão');
        } finally {
            setIsLoading(false);
        }
    }, [loadFromStorage, saveToStorage, toPausedSession]);

    // ============================================
    // 📦 RETURN
    // ============================================

    return {
        pausedSessions,
        currentSession,
        isLoading,
        error,
        pauseSession,
        loadSession,
        deleteSession,
        saveSessionState,
        resumeSession,
        hasPausedSessions: pausedSessions.length > 0
    };
}

// ============================================
// 🛠️ UTILITY: Create new session
// ============================================

export function createNewSession(
    title: string,
    mode: SessionMode,
    counselorIds: string[],
    userId: string = 'anonymous'
): Session {
    return {
        id: `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        userId,
        title,
        mode,
        counselorIds,
        phase: 'H',
        messages: [],
        context: {
            problem: '',
            details: {}
        },
        config: {
            useMemory: true,
            useProjectContext: false,
            isCrisisMode: mode === 'crisis'
        },
        createdAt: new Date(),
        updatedAt: new Date()
    };
}
