/**
 * 🔄 useRevision Hook
 * 
 * Hook para gerenciar fluxo de revisão de decisões.
 * Segue react-patterns skill.
 * 
 * @see regras_decisoes.md — Revisão e Outcomes
 * @see react-patterns skill — Custom hooks
 */

import { useState, useCallback } from "react";
import { Decision, DecisionOutcome, Message } from "@/types";
import { MODERATOR } from "@/lib/defaultPersonas";
import { RevisionResult } from "@/lib/prompts/revision";

// ============================================
// 📐 TYPES
// ============================================

type RevisionStep =
    | "presenting"
    | "asking_outcome"
    | "asking_explanation"
    | "asking_learning"
    | "confirming"
    | "complete";

interface UseRevisionProps {
    decision: Decision;
    onComplete: (result: RevisionResult) => void;
}

interface UseRevisionReturn {
    /** Mensagens da revisão */
    messages: Message[];
    /** Etapa atual */
    step: RevisionStep;
    /** Outcome selecionado */
    outcome: DecisionOutcome | null;
    /** Se está carregando */
    isLoading: boolean;
    /** Se está digitando */
    isTyping: boolean;
    /** Inicia a revisão */
    startRevision: () => Promise<void>;
    /** Envia resposta do usuário */
    sendMessage: (content: string) => Promise<void>;
    /** Seleciona outcome diretamente */
    selectOutcome: (outcome: DecisionOutcome) => Promise<void>;
    /** Confirma e salva */
    confirmAndSave: () => Promise<void>;
    /** Erro atual */
    error: string | null;
}

// ============================================
// 🪝 HOOK
// ============================================

export function useRevision({ decision, onComplete }: UseRevisionProps): UseRevisionReturn {
    // State
    const [messages, setMessages] = useState<Message[]>([]);
    const [step, setStep] = useState<RevisionStep>("presenting");
    const [outcome, setOutcome] = useState<DecisionOutcome | null>(null);
    const [explanation, setExplanation] = useState<string>("");
    const [learning, setLearning] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ============================================
    // 🔧 HELPERS
    // ============================================

    const generateMessageId = () => `rev-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    const addMessage = useCallback((role: "user" | "assistant", content: string, personaId?: string) => {
        const message: Message = {
            id: generateMessageId(),
            role,
            content,
            timestamp: new Date(),
            personaId: role === "assistant" ? (personaId || MODERATOR.id) : undefined
        };
        setMessages(prev => [...prev, message]);
        return message;
    }, []);

    /**
     * Process SSE stream response (same pattern as phase-d)
     */
    const processSSEStream = useCallback(async (
        response: Response,
        onChunk: (content: string) => void
    ): Promise<string> => {
        const reader = response.body?.getReader();
        if (!reader) throw new Error("No reader available");

        const decoder = new TextDecoder();
        let fullContent = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
                if (line.startsWith("data: ")) {
                    try {
                        const data = JSON.parse(line.slice(6));
                        if (data.type === "content" && data.content) {
                            fullContent += data.content;
                            onChunk(fullContent);
                        }
                    } catch {
                        // Ignore parsing errors
                    }
                }
            }
        }

        return fullContent;
    }, []);

    const streamResponse = useCallback(async (
        action: string,
        params: Record<string, unknown> = {}
    ): Promise<string> => {
        setIsTyping(true);

        try {
            const response = await fetch("/api/session/revision", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action,
                    decision,
                    ...params
                })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            // Check if SSE stream
            const contentType = response.headers.get("content-type");
            if (contentType?.includes("text/event-stream")) {
                // SSE streaming response
                const messageId = generateMessageId();

                // Add empty message that will be updated
                setMessages(prev => [...prev, {
                    id: messageId,
                    role: "assistant",
                    content: "",
                    timestamp: new Date(),
                    personaId: MODERATOR.id
                }]);

                const fullContent = await processSSEStream(response, (content) => {
                    // Update message content as chunks arrive
                    setMessages(prev => prev.map(m =>
                        m.id === messageId
                            ? { ...m, content }
                            : m
                    ));
                });

                return fullContent;
            } else {
                // JSON response
                return await response.json();
            }
        } finally {
            setIsTyping(false);
        }
    }, [decision, processSSEStream]);

    // ============================================
    // 🎯 ACTIONS
    // ============================================

    /**
     * Inicia o fluxo de revisão
     */
    const startRevision = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            await streamResponse("present_decision");
            setStep("asking_outcome");
        } catch (err) {
            setError("Erro ao iniciar revisão");
            console.error("[useRevision] startRevision error:", err);
        } finally {
            setIsLoading(false);
        }
    }, [streamResponse]);

    /**
     * Seleciona outcome diretamente (via botão)
     */
    const selectOutcome = useCallback(async (selectedOutcome: DecisionOutcome) => {
        setIsLoading(true);
        setError(null);

        try {
            // Add user message indicating selection
            const outcomeLabels: Record<DecisionOutcome, string> = {
                success: "✅ Funcionou",
                partial: "⚠️ Parcial",
                failure: "❌ Não funcionou",
                pending: "⏳ Ainda em andamento",
                pivoted: "🔄 Pivotei"
            };
            addMessage("user", outcomeLabels[selectedOutcome]);

            setOutcome(selectedOutcome);

            // Get exploration question
            await streamResponse("explore_outcome", { outcome: selectedOutcome });
            setStep("asking_explanation");
        } catch (err) {
            setError("Erro ao processar seleção");
            console.error("[useRevision] selectOutcome error:", err);
        } finally {
            setIsLoading(false);
        }
    }, [streamResponse, addMessage]);

    /**
     * Processa mensagem do usuário
     */
    const sendMessage = useCallback(async (content: string) => {
        if (!content.trim()) return;

        setIsLoading(true);
        setError(null);
        addMessage("user", content);

        try {
            switch (step) {
                case "asking_outcome": {
                    // Try to extract outcome from text
                    const response = await fetch("/api/session/revision", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            action: "process_outcome",
                            decision,
                            userMessage: content
                        })
                    });

                    const result = await response.json();

                    if (result.outcome) {
                        setOutcome(result.outcome);
                        await streamResponse("explore_outcome", { outcome: result.outcome });
                        setStep("asking_explanation");
                    } else {
                        // Unclear, ask again
                        addMessage("assistant", result.message || "Por favor, escolha uma das opções.");
                    }
                    break;
                }

                case "asking_explanation": {
                    setExplanation(content);
                    await streamResponse("capture_learning", { outcome });
                    setStep("asking_learning");
                    break;
                }

                case "asking_learning": {
                    setLearning(content);
                    await streamResponse("confirm", {
                        outcome,
                        explanation,
                        learning: content
                    });
                    setStep("confirming");
                    break;
                }

                case "confirming": {
                    // User wants to edit something
                    const lowerContent = content.toLowerCase();
                    if (lowerContent.includes("ok") || lowerContent.includes("sim") || lowerContent.includes("confirm")) {
                        await confirmAndSave();
                    } else {
                        addMessage("assistant", "O que você gostaria de ajustar?");
                    }
                    break;
                }

                default:
                    console.warn("[useRevision] Unexpected step:", step);
            }
        } catch (err) {
            setError("Erro ao processar mensagem");
            console.error("[useRevision] sendMessage error:", err);
        } finally {
            setIsLoading(false);
        }
    }, [step, outcome, explanation, decision, addMessage, streamResponse]);

    /**
     * Confirma e salva a revisão
     */
    const confirmAndSave = useCallback(async () => {
        if (!outcome || !explanation || !learning) {
            setError("Dados incompletos para salvar");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/session/revision", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "save_revision",
                    decision,
                    outcome,
                    explanation,
                    learning
                })
            });

            const result = await response.json();

            if (result.status === "saved") {
                addMessage("assistant", "✓ Revisão registrada. Esse aprendizado ficará vinculado à decisão original.");
                setStep("complete");

                // Call completion callback
                onComplete({
                    decisionId: decision.id,
                    outcome,
                    explanation,
                    learning,
                    reviewedAt: new Date()
                });
            } else {
                throw new Error("Failed to save revision");
            }
        } catch (err) {
            setError("Erro ao salvar revisão");
            console.error("[useRevision] confirmAndSave error:", err);
        } finally {
            setIsLoading(false);
        }
    }, [outcome, explanation, learning, decision, onComplete, addMessage]);

    // ============================================
    // 📦 RETURN
    // ============================================

    return {
        messages,
        step,
        outcome,
        isLoading,
        isTyping,
        startRevision,
        sendMessage,
        selectOutcome,
        confirmAndSave,
        error
    };
}
