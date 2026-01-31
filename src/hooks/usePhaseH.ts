/**
 * 🎯 usePhaseH Hook
 * 
 * Hook para gerenciar a Fase H (Clarificação) da sessão HOLD.
 * Integra com a API de streaming e gerencia o estado da fase.
 * 
 * @see prompt-engineer skill — Production prompt systems
 * @see react-patterns skill — Custom hooks
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { Message, Persona } from "@/types";
import {
    getInitialMessage,
    getTransitionToPhaseOMessage,
    PhaseHContext
} from "@/lib/prompts/phaseH";

// ============================================
// 📐 TYPES
// ============================================

export type PhaseHStatus =
    | "initial"      // Aguardando primeira resposta
    | "clarifying"   // Fazendo perguntas
    | "validating"   // Validando contexto
    | "ready"        // Pronto para transição
    | "transitioning"; // Transicionando para fase O

interface UsePhaseHOptions {
    mode: "solo" | "mesa";
    counselors: Persona[];
    sessionId: string;
    /** Modelo de IA a ser usado */
    model?: string;
    /** Mensagens iniciais para retomar sessão */
    initialMessages?: Message[];
    /** Callback quando mensagens mudam (para persistência) */
    onMessagesChange?: (messages: Message[]) => void;
    onPhaseComplete?: (context: PhaseHContext) => void;
}

interface UsePhaseHReturn {
    /** Status atual da fase */
    status: PhaseHStatus;
    /** Mensagens da conversa */
    messages: Message[];
    /** Contexto estruturado extraído */
    context: Partial<PhaseHContext>;
    /** Se está carregando resposta */
    isLoading: boolean;
    /** Persona que está "digitando" */
    typingPersona: Persona | null;
    /** Envia mensagem do usuário */
    sendMessage: (content: string) => Promise<void>;
    /** Força transição para fase O */
    proceedToPhaseO: () => void;
    /** Mensagem de erro, se houver */
    error: string | null;
}

// ============================================
// 🪝 HOOK
// ============================================

export function usePhaseH({
    mode,
    counselors,
    sessionId,
    model,
    initialMessages,
    onMessagesChange,
    onPhaseComplete
}: UsePhaseHOptions): UsePhaseHReturn {
    // State - initialize with existing messages if resuming
    const [messages, setMessages] = useState<Message[]>(initialMessages || []);
    const [status, setStatus] = useState<PhaseHStatus>(
        initialMessages && initialMessages.length > 0 ? "clarifying" : "initial"
    );
    const [context, setContext] = useState<Partial<PhaseHContext>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [typingPersona, setTypingPersona] = useState<Persona | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Refs
    const abortControllerRef = useRef<AbortController | null>(null);
    const messageCountRef = useRef(initialMessages?.length || 0);
    const isInitialLoadRef = useRef(true);

    // Persist messages when they change
    useEffect(() => {
        // Skip initial load to avoid overwriting with empty array
        if (isInitialLoadRef.current) {
            isInitialLoadRef.current = false;
            return;
        }

        // Only persist if there are messages and callback exists
        if (messages.length > 0 && onMessagesChange && !isLoading) {
            console.log('[usePhaseH] Persisting messages:', messages.length);
            onMessagesChange(messages);
        }
    }, [messages, onMessagesChange, isLoading]);

    // Moderador placeholder (será substituído pelo MODERATOR real)
    const moderator: Persona = {
        id: "system-moderator",
        name: "Moderador",
        description: "Condutor de sessões HOLD",
        style: "Estruturado e metódico",
        tone: "Neutro, calmo, firme",
        principles: [],
        biases: [],
        riskTolerance: 5,
        objectives: [],
        instructions: [],
        type: "moderator"
    };

    // ============================================
    // 📨 SEND MESSAGE
    // ============================================

    const sendMessage = useCallback(async (content: string) => {
        if (!content.trim() || isLoading) return;

        // Cancel any pending request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        const userMessage: Message = {
            id: `user-${Date.now()}`,
            role: "user",
            content: content.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);
        setTypingPersona(moderator);
        setError(null);

        try {
            // Prepare messages for API - exclude initial message if it was locally generated
            const apiMessages = messages
                .filter(m => !m.id.startsWith("initial-")) // Exclude local initial messages
                .concat([userMessage])
                .map(m => ({
                    role: m.role,
                    content: m.content
                }));

            console.log("[usePhaseH] Sending messages to API:", apiMessages.length);

            // Call streaming API
            const response = await fetch("/api/session/phase-h", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: apiMessages,
                    counselors: counselors.map(c => ({
                        name: c.name,
                        description: c.description
                    })),
                    mode,
                    model,
                    action: "chat"
                }),
                signal: abortControllerRef.current.signal
            });

            console.log("[usePhaseH] Response status:", response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error("[usePhaseH] API error response:", errorText);
                throw new Error(`API error: ${response.status} - ${errorText}`);
            }

            // Handle streaming response
            const reader = response.body?.getReader();
            if (!reader) throw new Error("No response body");

            const decoder = new TextDecoder();
            let assistantContent = "";
            let assistantMessageId = `mod-${Date.now()}`;

            // Add placeholder message for streaming
            const assistantMessage: Message = {
                id: assistantMessageId,
                role: "assistant",
                content: "",
                timestamp: new Date(),
                personaId: moderator.id
            };
            setMessages(prev => [...prev, assistantMessage]);

            // Process stream
            let buffer = "";
            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    console.log("[usePhaseH] Stream complete, total content length:", assistantContent.length);
                    break;
                }

                const chunk = decoder.decode(value, { stream: true });
                buffer += chunk;
                const lines = buffer.split("\n");
                buffer = lines.pop() || ""; // Keep incomplete line in buffer

                for (const line of lines) {
                    if (!line.startsWith("data: ")) continue;

                    try {
                        const data = JSON.parse(line.slice(6));

                        if (data.type === "content") {
                            assistantContent += data.content;
                            // Update message content
                            setMessages(prev => prev.map(m =>
                                m.id === assistantMessageId
                                    ? { ...m, content: assistantContent }
                                    : m
                            ));
                        } else if (data.type === "done") {
                            // Streaming complete
                            messageCountRef.current++;
                            console.log("[usePhaseH] Message complete, count:", messageCountRef.current);

                            // Check if ready to transition
                            if (assistantContent.includes("📋 RESUMO DA CLARIFICAÇÃO")) {
                                setStatus("validating");
                            } else if (messageCountRef.current >= 3) {
                                setStatus("clarifying");
                            }
                        } else if (data.type === "error") {
                            console.error("[usePhaseH] Stream error:", data.error);
                            throw new Error(data.error);
                        }
                    } catch (parseError) {
                        // Ignore parse errors for partial chunks
                        if (!(parseError instanceof SyntaxError)) {
                            throw parseError;
                        }
                    }
                }
            }

        } catch (err) {
            if ((err as Error).name === "AbortError") {
                console.log("[usePhaseH] Request aborted");
                return;
            }
            console.error("[usePhaseH] Error sending message:", err);
            setError(err instanceof Error ? err.message : "Erro ao enviar mensagem");
        } finally {
            setIsLoading(false);
            setTypingPersona(null);
        }
    }, [messages, isLoading, counselors, mode, moderator]);

    // ============================================
    // 🔄 INITIALIZE
    // ============================================

    const initialize = useCallback(() => {
        if (messages.length === 0) {
            const initialMsg: Message = {
                id: "initial-1",
                role: "assistant",
                content: getInitialMessage(mode, counselors),
                timestamp: new Date(),
                personaId: moderator.id
            };
            setMessages([initialMsg]);
        }
    }, [messages.length, mode, counselors, moderator]);

    // Auto-initialize
    if (messages.length === 0) {
        initialize();
    }

    // ============================================
    // ➡️ TRANSITION TO PHASE O
    // ============================================

    const proceedToPhaseO = useCallback(() => {
        setStatus("transitioning");

        // Add transition message
        const transitionMsg: Message = {
            id: `transition-${Date.now()}`,
            role: "assistant",
            content: getTransitionToPhaseOMessage(counselors),
            timestamp: new Date(),
            personaId: moderator.id
        };
        setMessages(prev => [...prev, transitionMsg]);

        // Extract context and notify
        if (onPhaseComplete) {
            extractContext().then(extractedContext => {
                if (extractedContext) {
                    onPhaseComplete(extractedContext as PhaseHContext);
                }
            });
        }
    }, [counselors, moderator, onPhaseComplete]);

    // ============================================
    // 📊 EXTRACT CONTEXT
    // ============================================

    const extractContext = useCallback(async (): Promise<Partial<PhaseHContext> | null> => {
        try {
            const apiMessages = messages.map(m => ({
                role: m.role,
                content: m.content
            }));

            const response = await fetch("/api/session/phase-h", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: apiMessages,
                    action: "extract_context"
                })
            });

            if (!response.ok) return null;

            const data = await response.json();
            if (data.success && data.context) {
                setContext(data.context);
                return data.context;
            }
            return null;
        } catch (err) {
            console.error("Error extracting context:", err);
            return null;
        }
    }, [messages]);

    // ============================================
    // 📦 RETURN
    // ============================================

    return {
        status,
        messages,
        context,
        isLoading,
        typingPersona,
        sendMessage,
        proceedToPhaseO,
        error
    };
}
