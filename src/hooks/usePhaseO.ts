/**
 * 🗣️ usePhaseO Hook
 * 
 * Hook para gerenciar a Fase O (Debate) da sessão HOLD.
 * Gerencia turnos de fala entre Moderador e Conselheiro.
 * 
 * @see prompt-engineer skill — Multi-agent orchestration
 * @see prompt-engineering-patterns skill — Sequential prompting
 * @see regras_decisoes.md — Streaming sequencial
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { Message, Persona } from "@/types";
import { PhaseHContext } from "@/lib/prompts/phaseH";
import {
    PhaseOState,
    SpeakingTurn,
    getNextSpeaker,
    shouldContinueDebate,
    getRandomUserInvitation
} from "@/lib/prompts/phaseO";
import { MODERATOR } from "@/lib/defaultPersonas";

// ============================================
// 📐 TYPES
// ============================================

export type PhaseOStatus =
    | "presenting"        // Moderador apresentando contexto
    | "counselor_turn"    // Conselheiro dando perspectiva
    | "moderator_probing" // Moderador aprofundando
    | "user_turn"         // Esperando input do usuário
    | "transitioning"     // Transicionando para Fase L
    | "ready";            // Pronto para Fase L

interface UsePhaseOOptions {
    counselor: Persona;
    context: PhaseHContext;
    sessionId: string;
    model?: string;
    onPhaseComplete?: () => void;
}

interface UsePhaseOReturn {
    /** Status atual da fase */
    status: PhaseOStatus;
    /** Mensagens do debate */
    messages: Message[];
    /** Se está carregando resposta */
    isLoading: boolean;
    /** Persona que está "digitando" */
    typingPersona: Persona | null;
    /** Round atual do debate */
    currentRound: number;
    /** Envia mensagem do usuário */
    sendMessage: (content: string) => Promise<void>;
    /** Inicia o debate (apresenta contexto) */
    startDebate: () => Promise<void>;
    /** Avança para próxima fase */
    proceedToPhaseL: () => Promise<void>;
    /** Mensagem de erro, se houver */
    error: string | null;
}

// ============================================
// 🪝 HOOK
// ============================================

export function usePhaseO({
    counselor,
    context,
    sessionId,
    model,
    onPhaseComplete
}: UsePhaseOOptions): UsePhaseOReturn {
    // State
    const [messages, setMessages] = useState<Message[]>([]);
    const [status, setStatus] = useState<PhaseOStatus>("presenting");
    const [isLoading, setIsLoading] = useState(false);
    const [typingPersona, setTypingPersona] = useState<Persona | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Phase state
    const [phaseState, setPhaseState] = useState<PhaseOState>({
        phase: "presenting",
        currentRound: 0,
        maxRounds: 3,
        counselorHasSpoken: false,
        userHasIntervened: false,
        keyPoints: []
    });

    // Refs
    const abortControllerRef = useRef<AbortController | null>(null);
    const hasStartedRef = useRef(false);

    // ============================================
    // 📡 STREAM MESSAGE
    // ============================================

    const streamMessage = useCallback(async (
        action: string,
        speakerPersona: Persona,
        additionalData: Record<string, unknown> = {}
    ): Promise<string> => {
        // Cancel any pending request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        setIsLoading(true);
        setTypingPersona(speakerPersona);

        const messageId = `${speakerPersona.id}-${Date.now()}`;

        // Add placeholder message
        const placeholderMessage: Message = {
            id: messageId,
            role: "assistant",
            content: "",
            timestamp: new Date(),
            personaId: speakerPersona.id
        };
        setMessages(prev => [...prev, placeholderMessage]);

        let fullContent = "";

        try {
            const response = await fetch("/api/session/phase-o", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action,
                    counselor: {
                        id: counselor.id,
                        name: counselor.name,
                        description: counselor.description,
                        tone: counselor.tone,
                        principles: counselor.principles,
                        biases: counselor.biases,
                        riskTolerance: counselor.riskTolerance,
                        instructions: counselor.instructions
                    },
                    context,
                    phaseState,
                    model,
                    messages: messages.map(m => ({
                        role: m.role,
                        content: m.content
                    })),
                    ...additionalData
                }),
                signal: abortControllerRef.current.signal
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const reader = response.body?.getReader();
            if (!reader) throw new Error("No response body");

            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split("\n");

                for (const line of lines) {
                    if (!line.startsWith("data: ")) continue;

                    try {
                        const data = JSON.parse(line.slice(6));

                        if (data.type === "content") {
                            fullContent += data.content;
                            setMessages(prev => prev.map(m =>
                                m.id === messageId
                                    ? { ...m, content: fullContent }
                                    : m
                            ));
                        } else if (data.type === "error") {
                            throw new Error(data.error);
                        }
                    } catch (parseError) {
                        if (!(parseError instanceof SyntaxError)) {
                            throw parseError;
                        }
                    }
                }
            }

            return fullContent;

        } catch (err) {
            if ((err as Error).name === "AbortError") {
                return fullContent;
            }
            console.error("Error streaming message:", err);
            setError(err instanceof Error ? err.message : "Erro ao gerar resposta");
            throw err;
        } finally {
            setIsLoading(false);
            setTypingPersona(null);
        }
    }, [counselor, context, phaseState, messages]);

    // ============================================
    // 🚀 START DEBATE
    // ============================================

    const startDebate = useCallback(async () => {
        if (hasStartedRef.current) return;
        hasStartedRef.current = true;

        try {
            // Step 1: Moderador apresenta contexto
            setStatus("presenting");
            await streamMessage("present_context", MODERATOR);

            // Step 2: Conselheiro dá perspectiva
            setStatus("counselor_turn");
            setPhaseState(prev => ({ ...prev, phase: "counselor_speaking" }));

            await streamMessage("counselor_response", counselor);

            setPhaseState(prev => ({
                ...prev,
                counselorHasSpoken: true,
                currentRound: 1
            }));

            // Step 3: Moderador convida usuário
            setStatus("moderator_probing");
            await streamMessage("moderator_probe", MODERATOR);

            // Aguarda input do usuário
            setStatus("user_turn");

        } catch (err) {
            console.error("Error starting debate:", err);
        }
    }, [streamMessage, counselor]);

    // ============================================
    // 📨 SEND MESSAGE
    // ============================================

    const sendMessage = useCallback(async (content: string) => {
        if (!content.trim() || isLoading) return;

        // Adiciona mensagem do usuário
        const userMessage: Message = {
            id: `user-${Date.now()}`,
            role: "user",
            content: content.trim(),
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);

        setPhaseState(prev => ({
            ...prev,
            userHasIntervened: true,
            currentRound: prev.currentRound + 1
        }));

        try {
            // Verifica se deve continuar ou avançar
            const updatedState = {
                ...phaseState,
                userHasIntervened: true,
                currentRound: phaseState.currentRound + 1
            };

            if (shouldContinueDebate(updatedState)) {
                // Conselheiro responde ao usuário
                setStatus("counselor_turn");
                await streamMessage("counselor_response", counselor);

                // Moderador faz follow-up
                setStatus("moderator_probing");
                await streamMessage("moderator_probe", MODERATOR);

                setStatus("user_turn");
            } else {
                // Hora de avançar
                await proceedToPhaseL();
            }

        } catch (err) {
            console.error("Error processing user message:", err);
        }
    }, [isLoading, phaseState, streamMessage, counselor]);

    // ============================================
    // ➡️ PROCEED TO PHASE L
    // ============================================

    const proceedToPhaseL = useCallback(async () => {
        setStatus("transitioning");

        try {
            // Moderador sintetiza e transiciona
            await streamMessage("transition", MODERATOR);

            setStatus("ready");

            if (onPhaseComplete) {
                onPhaseComplete();
            }
        } catch (err) {
            console.error("Error transitioning to Phase L:", err);
        }
    }, [streamMessage, onPhaseComplete]);

    // ============================================
    // 📦 RETURN
    // ============================================

    return {
        status,
        messages,
        isLoading,
        typingPersona,
        currentRound: phaseState.currentRound,
        sendMessage,
        startDebate,
        proceedToPhaseL,
        error
    };
}
