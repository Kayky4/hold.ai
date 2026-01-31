/**
 * 🎭 usePhaseOMesa Hook
 * 
 * Hook para gerenciar a Fase O (Debate) da sessão HOLD com 2 conselheiros.
 * Orquestra debate cruzado sequencial entre conselheiros.
 * 
 * @see prompt-engineer skill — Multi-agent orchestration
 * @see prompt-engineering-patterns skill — Sequential conflict prompting
 * @see regras_decisoes.md — Streaming sequencial obrigatório
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { Message, Persona } from "@/types";
import { PhaseHContext } from "@/lib/prompts/phaseH";
import {
    PhaseOMesaState,
    getNextMesaSpeaker,
    shouldMesaContinue,
    getRandomMesaInvitation
} from "@/lib/prompts/phaseOMesa";
import { MODERATOR } from "@/lib/defaultPersonas";

// ============================================
// 📐 TYPES
// ============================================

export type PhaseOMesaStatus =
    | "presenting"         // Moderador apresentando contexto
    | "counselor1_turn"    // Conselheiro 1 falando
    | "counselor2_turn"    // Conselheiro 2 reagindo
    | "moderator_provoking" // Moderador provocando tensão
    | "debate_continuing"  // Debate cruzado em andamento
    | "user_turn"          // Esperando input do usuário
    | "transitioning"      // Transicionando para Fase L
    | "ready";             // Pronto para Fase L

interface UsePhaseOMesaOptions {
    counselor1: Persona;
    counselor2: Persona;
    context: PhaseHContext;
    sessionId: string;
    model?: string;
    onPhaseComplete?: () => void;
}

interface UsePhaseOMesaReturn {
    /** Status atual da fase */
    status: PhaseOMesaStatus;
    /** Mensagens do debate */
    messages: Message[];
    /** Se está carregando resposta */
    isLoading: boolean;
    /** Persona que está "digitando" */
    typingPersona: Persona | null;
    /** Round atual do debate */
    currentRound: number;
    /** Nível de tensão do debate */
    tensionLevel: "low" | "medium" | "high";
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

export function usePhaseOMesa({
    counselor1,
    counselor2,
    context,
    sessionId,
    model,
    onPhaseComplete
}: UsePhaseOMesaOptions): UsePhaseOMesaReturn {
    // State
    const [messages, setMessages] = useState<Message[]>([]);
    const [status, setStatus] = useState<PhaseOMesaStatus>("presenting");
    const [isLoading, setIsLoading] = useState(false);
    const [typingPersona, setTypingPersona] = useState<Persona | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Phase state
    const [phaseState, setPhaseState] = useState<PhaseOMesaState>({
        phase: "presenting",
        currentRound: 0,
        maxRounds: 4, // Mais rounds para mesa (2 conselheiros)
        counselor1HasSpoken: false,
        counselor2HasSpoken: false,
        userHasIntervened: false,
        debatePoints: [],
        tensionLevel: "low"
    });

    // Refs
    const abortControllerRef = useRef<AbortController | null>(null);
    const hasStartedRef = useRef(false);
    const lastCounselorResponseRef = useRef<string>("");

    // ============================================
    // 📡 STREAM MESSAGE
    // ============================================

    const streamMessage = useCallback(async (
        action: string,
        speakerPersona: Persona,
        additionalData: Record<string, unknown> = {}
    ): Promise<string> => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        setIsLoading(true);
        setTypingPersona(speakerPersona);

        const messageId = `${speakerPersona.id}-${Date.now()}`;

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
            const response = await fetch("/api/session/phase-o-mesa", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action,
                    counselor1: serializePersona(counselor1),
                    counselor2: serializePersona(counselor2),
                    context,
                    phaseState,
                    model,
                    lastCounselorResponse: lastCounselorResponseRef.current,
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

            // Store last counselor response for reactions
            if (speakerPersona.id !== MODERATOR.id) {
                lastCounselorResponseRef.current = fullContent;
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
    }, [counselor1, counselor2, context, phaseState, messages]);

    // ============================================
    // 🚀 START MESA DEBATE
    // ============================================

    const startDebate = useCallback(async () => {
        if (hasStartedRef.current) return;
        hasStartedRef.current = true;

        try {
            // Step 1: Moderador apresenta contexto à mesa
            setStatus("presenting");
            await streamMessage("present_context", MODERATOR);

            // Step 2: Conselheiro 1 dá perspectiva inicial
            setStatus("counselor1_turn");
            const c1Response = await streamMessage("counselor1_response", counselor1);

            setPhaseState(prev => ({
                ...prev,
                counselor1HasSpoken: true,
                currentRound: 1
            }));

            // Step 3: Conselheiro 2 reage/contrapõe
            setStatus("counselor2_turn");
            await streamMessage("counselor2_reaction", counselor2, {
                lastCounselorResponse: c1Response
            });

            setPhaseState(prev => ({
                ...prev,
                counselor2HasSpoken: true,
                tensionLevel: "medium" // Após primeira troca, tensão aumenta
            }));

            // Step 4: Moderador provoca tensão/convida usuário
            setStatus("moderator_provoking");
            await streamMessage("moderator_provoke", MODERATOR);

            // Aguarda input do usuário
            setStatus("user_turn");

        } catch (err) {
            console.error("Error starting mesa debate:", err);
        }
    }, [streamMessage, counselor1, counselor2]);

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

        const newRound = phaseState.currentRound + 1;

        setPhaseState(prev => ({
            ...prev,
            userHasIntervened: true,
            currentRound: newRound
        }));

        try {
            const updatedState = {
                ...phaseState,
                userHasIntervened: true,
                currentRound: newRound
            };

            if (shouldMesaContinue(updatedState)) {
                // Continua debate: Conselheiro 1 responde ao usuário
                setStatus("counselor1_turn");
                const c1Response = await streamMessage("counselor1_rebuttal", counselor1);

                // Conselheiro 2 responde
                setStatus("counselor2_turn");
                await streamMessage("counselor2_rebuttal", counselor2, {
                    lastCounselorResponse: c1Response
                });

                // Moderador faz follow-up
                setStatus("moderator_provoking");
                await streamMessage("moderator_provoke", MODERATOR);

                setPhaseState(prev => ({
                    ...prev,
                    currentRound: prev.currentRound + 1
                }));

                setStatus("user_turn");
            } else {
                // Hora de avançar
                await proceedToPhaseL();
            }

        } catch (err) {
            console.error("Error processing user message:", err);
        }
    }, [isLoading, phaseState, streamMessage, counselor1, counselor2]);

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
    // 🔧 HELPERS
    // ============================================

    function serializePersona(persona: Persona) {
        return {
            id: persona.id,
            name: persona.name,
            description: persona.description,
            tone: persona.tone,
            principles: persona.principles,
            biases: persona.biases,
            riskTolerance: persona.riskTolerance,
            instructions: persona.instructions
        };
    }

    // ============================================
    // 📦 RETURN
    // ============================================

    return {
        status,
        messages,
        isLoading,
        typingPersona,
        currentRound: phaseState.currentRound,
        tensionLevel: phaseState.tensionLevel,
        sendMessage,
        startDebate,
        proceedToPhaseL,
        error
    };
}
