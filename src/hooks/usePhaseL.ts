/**
 * ⚖️ usePhaseL Hook
 * 
 * Hook para gerenciar a Fase L (Decisão) da sessão HOLD.
 * Sintetiza o debate, apresenta opções e captura a decisão do usuário.
 * 
 * @see prompt-engineer skill — Decision capture systems
 * @see prompt-engineering-patterns skill — Progressive disclosure
 * @see regras_decisoes.md — Schema de decisão
 */

import { useState, useCallback, useRef } from "react";
import { Message, Persona } from "@/types";
import { PhaseHContext } from "@/lib/prompts/phaseH";
import {
    PhaseLState,
    CapturedDecision,
    getNextLStep,
    isPhaseLComplete
} from "@/lib/prompts/phaseL";
import { MODERATOR } from "@/lib/defaultPersonas";

// ============================================
// 📐 TYPES
// ============================================

export type PhaseLStatus =
    | "synthesizing"      // Moderador sintetizando debate
    | "presenting"        // Apresentando opções
    | "awaiting_decision" // Esperando escolha do usuário
    | "confirming"        // Confirmando decisão
    | "capturing"         // Capturando raciocínio
    | "transitioning"     // Transicionando para Fase D
    | "complete";         // Fase L concluída

interface UsePhaseLOptions {
    counselors: Persona[];
    context: PhaseHContext;
    debateHistory: string;
    sessionId: string;
    model?: string;
    onPhaseComplete?: (decision: CapturedDecision) => void;
}

interface UsePhaseLReturn {
    /** Status atual da fase */
    status: PhaseLStatus;
    /** Mensagens da fase L */
    messages: Message[];
    /** Se está carregando resposta */
    isLoading: boolean;
    /** Persona que está "digitando" */
    typingPersona: Persona | null;
    /** Decisão capturada */
    capturedDecision: Partial<CapturedDecision>;
    /** Envia mensagem do usuário */
    sendMessage: (content: string) => Promise<void>;
    /** Inicia síntese do debate */
    startSynthesis: () => Promise<void>;
    /** Confirma decisão */
    confirmDecision: (choice: string) => Promise<void>;
    /** Adia decisão */
    deferDecision: () => Promise<void>;
    /** Avança para Fase D */
    proceedToPhaseD: () => Promise<void>;
    /** Mensagem de erro, se houver */
    error: string | null;
}

// ============================================
// 🪝 HOOK
// ============================================

export function usePhaseL({
    counselors,
    context,
    debateHistory,
    sessionId,
    model,
    onPhaseComplete
}: UsePhaseLOptions): UsePhaseLReturn {
    // State
    const [messages, setMessages] = useState<Message[]>([]);
    const [status, setStatus] = useState<PhaseLStatus>("synthesizing");
    const [isLoading, setIsLoading] = useState(false);
    const [typingPersona, setTypingPersona] = useState<Persona | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Decision state
    const [capturedDecision, setCapturedDecision] = useState<Partial<CapturedDecision>>({});

    // Phase state
    const [phaseState, setPhaseState] = useState<PhaseLState>({
        phase: "synthesizing",
        synthesisComplete: false,
        optionsPresented: false,
        decisionMade: false,
        reasoningCaptured: false
    });

    // Refs
    const abortControllerRef = useRef<AbortController | null>(null);
    const hasStartedRef = useRef(false);
    const userChoiceRef = useRef<string>("");

    // ============================================
    // 📡 STREAM MESSAGE
    // ============================================

    const streamMessage = useCallback(async (
        action: string,
        additionalData: Record<string, unknown> = {}
    ): Promise<string> => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        setIsLoading(true);
        setTypingPersona(MODERATOR);

        const messageId = `mod-${Date.now()}`;

        const placeholderMessage: Message = {
            id: messageId,
            role: "assistant",
            content: "",
            timestamp: new Date(),
            personaId: MODERATOR.id
        };
        setMessages(prev => [...prev, placeholderMessage]);

        let fullContent = "";

        try {
            const response = await fetch("/api/session/phase-l", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action,
                    counselors: counselors.map(c => ({
                        id: c.id,
                        name: c.name,
                        description: c.description
                    })),
                    context,
                    debateHistory,
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
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                buffer += chunk;
                const lines = buffer.split("\n");
                buffer = lines.pop() || "";

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
            console.error("[usePhaseL] Error streaming message:", err);
            setError(err instanceof Error ? err.message : "Erro ao gerar resposta");
            throw err;
        } finally {
            setIsLoading(false);
            setTypingPersona(null);
        }
    }, [counselors, context, debateHistory, phaseState, messages]);

    // ============================================
    // 🚀 START SYNTHESIS
    // ============================================

    const startSynthesis = useCallback(async () => {
        if (hasStartedRef.current) return;
        hasStartedRef.current = true;

        try {
            setStatus("synthesizing");

            // Moderador sintetiza o debate
            await streamMessage("synthesize");

            setPhaseState(prev => ({
                ...prev,
                synthesisComplete: true,
                optionsPresented: true,
                phase: "awaiting_decision"
            }));

            setStatus("awaiting_decision");

        } catch (err) {
            console.error("[usePhaseL] Error starting synthesis:", err);
        }
    }, [streamMessage]);

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

        try {
            // Detecta tipo de resposta
            const lowerContent = content.toLowerCase();

            // Check for defer
            if (lowerContent.includes("adiar") || lowerContent.includes("pausar") || lowerContent === "3") {
                await deferDecision();
                return;
            }

            // Check for decision confirmation
            if (status === "confirming" && (lowerContent.includes("sim") || lowerContent.includes("correto"))) {
                // Usuário confirmou decisão
                setPhaseState(prev => ({
                    ...prev,
                    decisionMade: true,
                    phase: "capturing_reasoning"
                }));

                // Capturar raciocínio
                setStatus("capturing");
                await streamMessage("capture_reasoning");
                return;
            }

            // Se já capturou raciocínio, armazena e avança
            if (status === "capturing") {
                setCapturedDecision(prev => ({
                    ...prev,
                    reasoning: content
                }));

                setPhaseState(prev => ({
                    ...prev,
                    reasoningCaptured: true,
                    phase: "ready_for_action"
                }));

                setStatus("transitioning");
                await streamMessage("transition");

                setStatus("complete");
                return;
            }

            // Se está esperando decisão, confirma a escolha
            if (status === "awaiting_decision") {
                userChoiceRef.current = content;

                // Extrai riscos do debate history
                const risksFromDebate = extractRisksFromHistory(debateHistory);

                setStatus("confirming");
                setCapturedDecision(prev => ({
                    ...prev,
                    decision: content
                }));

                await streamMessage("confirm_decision", {
                    userChoice: content,
                    risksFromDebate
                });
                return;
            }

            // Chat geral
            await streamMessage("chat");

        } catch (err) {
            console.error("[usePhaseL] Error processing message:", err);
        }
    }, [isLoading, status, streamMessage, debateHistory]);

    // ============================================
    // ✅ CONFIRM DECISION
    // ============================================

    const confirmDecision = useCallback(async (choice: string) => {
        userChoiceRef.current = choice;

        setCapturedDecision(prev => ({
            ...prev,
            decision: choice
        }));

        const risksFromDebate = extractRisksFromHistory(debateHistory);

        setStatus("confirming");
        await streamMessage("confirm_decision", {
            userChoice: choice,
            risksFromDebate
        });
    }, [streamMessage, debateHistory]);

    // ============================================
    // ⏸️ DEFER DECISION
    // ============================================

    const deferDecision = useCallback(async () => {
        setStatus("awaiting_decision");
        await streamMessage("defer");
    }, [streamMessage]);

    // ============================================
    // ➡️ PROCEED TO PHASE D
    // ============================================

    const proceedToPhaseD = useCallback(async () => {
        setStatus("transitioning");

        await streamMessage("transition");

        setStatus("complete");

        if (onPhaseComplete && capturedDecision.decision) {
            onPhaseComplete(capturedDecision as CapturedDecision);
        }
    }, [streamMessage, onPhaseComplete, capturedDecision]);

    // ============================================
    // 🔧 HELPERS
    // ============================================

    function extractRisksFromHistory(history: string): string[] {
        // Simple extraction - looks for common risk patterns
        const riskPatterns = [
            /risco[s]? de ([^.]+)/gi,
            /perigo de ([^.]+)/gi,
            /pode falhar ([^.]+)/gi,
            /se der errado ([^.]+)/gi
        ];

        const risks: string[] = [];

        for (const pattern of riskPatterns) {
            const matches = history.matchAll(pattern);
            for (const match of matches) {
                if (match[1]) {
                    risks.push(match[1].trim());
                }
            }
        }

        return risks.slice(0, 5); // Limit to 5 risks
    }

    // ============================================
    // 📦 RETURN
    // ============================================

    return {
        status,
        messages,
        isLoading,
        typingPersona,
        capturedDecision,
        sendMessage,
        startSynthesis,
        confirmDecision,
        deferDecision,
        proceedToPhaseD,
        error
    };
}
