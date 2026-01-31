/**
 * 🚀 usePhaseD Hook
 * 
 * Hook para gerenciar a Fase D (Ação) da sessão HOLD.
 * Captura próxima ação, define prazo, agenda revisão e encerra sessão.
 * 
 * @see prompt-engineer skill — Action capture systems
 * @see architecture skill — Session record structure
 * @see regras_decisoes.md — Pipeline de Decisões
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { Message, Persona } from "@/types";
import { CapturedDecision } from "@/lib/prompts/phaseL";
import {
    PhaseDState,
    SessionRecord,
    PhaseDResult,
    formatDatePtBr,
    calculateReviewDate,
    isPhaseDComplete
} from "@/lib/prompts/phaseD";
import { MODERATOR } from "@/lib/defaultPersonas";

// ============================================
// 📐 TYPES
// ============================================

export type PhaseDStatus =
    | "asking_action"     // Pedindo próxima ação
    | "asking_deadline"   // Pedindo prazo da ação
    | "asking_review"     // Pedindo data de revisão
    | "confirming"        // Confirmando antes de salvar
    | "saving"            // Salvando sessão
    | "complete";         // Sessão encerrada

interface UsePhaseDOptions {
    decision: CapturedDecision;
    sessionId: string;
    userId?: string;
    counselors: Persona[];
    mode: "solo" | "mesa";
    model?: string;
    onSessionComplete?: (result: PhaseDResult) => void;
}

interface UsePhaseDReturn {
    /** Status atual da fase */
    status: PhaseDStatus;
    /** Mensagens da fase D */
    messages: Message[];
    /** Se está carregando resposta */
    isLoading: boolean;
    /** Persona que está "digitando" */
    typingPersona: Persona | null;
    /** Próxima ação capturada */
    nextAction: string | null;
    /** Prazo da ação */
    actionDeadline: Date | null;
    /** Data de revisão */
    reviewDate: Date | null;
    /** Registro da sessão */
    sessionRecord: SessionRecord | null;
    /** Envia mensagem do usuário */
    sendMessage: (content: string) => Promise<void>;
    /** Inicia Fase D */
    startPhaseD: () => Promise<void>;
    /** Mensagem de erro, se houver */
    error: string | null;
}

// ============================================
// 🪝 HOOK
// ============================================

export function usePhaseD({
    decision,
    sessionId,
    userId = "anonymous",
    counselors,
    mode,
    model,
    onSessionComplete
}: UsePhaseDOptions): UsePhaseDReturn {
    // State
    const [messages, setMessages] = useState<Message[]>([]);
    const [status, setStatus] = useState<PhaseDStatus>("asking_action");
    const [isLoading, setIsLoading] = useState(false);
    const [typingPersona, setTypingPersona] = useState<Persona | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Captured data
    const [nextAction, setNextAction] = useState<string | null>(null);
    const [actionDeadline, setActionDeadline] = useState<Date | null>(null);
    const [reviewDate, setReviewDate] = useState<Date | null>(null);
    const [sessionRecord, setSessionRecord] = useState<SessionRecord | null>(null);

    // Refs
    const abortControllerRef = useRef<AbortController | null>(null);
    const hasStartedRef = useRef(false);

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
            const response = await fetch("/api/session/phase-d", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action,
                    decision,
                    nextAction,
                    actionDeadline: actionDeadline?.toISOString(),
                    reviewDate: reviewDate?.toISOString(),
                    sessionId,
                    userId,
                    counselors: counselors.map(c => c.name),
                    mode,
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
            console.error("[usePhaseD] Error streaming message:", err);
            setError(err instanceof Error ? err.message : "Erro ao gerar resposta");
            throw err;
        } finally {
            setIsLoading(false);
            setTypingPersona(null);
        }
    }, [decision, nextAction, actionDeadline, reviewDate, sessionId, userId, counselors, mode, messages]);

    // ============================================
    // 🚀 START PHASE D
    // ============================================

    const startPhaseD = useCallback(async () => {
        if (hasStartedRef.current) return;
        hasStartedRef.current = true;

        try {
            setStatus("asking_action");

            // Moderador pede próxima ação
            await streamMessage("ask_action");

        } catch (err) {
            console.error("[usePhaseD] Error starting Phase D:", err);
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
            const lowerContent = content.toLowerCase();

            // Estado: pedindo ação
            if (status === "asking_action") {
                // Extrai ação da resposta
                const extractResponse = await fetch("/api/session/phase-d", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        action: "extract_action",
                        messages: [{ role: "user", content }]
                    })
                });

                const extracted = await extractResponse.json();

                if (extracted.success && extracted.action && extracted.isSpecific) {
                    setNextAction(extracted.action);
                    setStatus("asking_deadline");
                    await streamMessage("ask_deadline", { nextAction: extracted.action });
                } else {
                    // Pede clarificação
                    await streamMessage("chat");
                }
                return;
            }

            // Estado: pedindo prazo
            if (status === "asking_deadline") {
                // Parse da resposta de prazo
                const deadline = parseDeadlineFromResponse(content);

                if (deadline) {
                    setActionDeadline(deadline);
                    setStatus("asking_review");
                    await streamMessage("ask_review", {
                        actionDeadline: formatDatePtBr(deadline)
                    });
                } else {
                    await streamMessage("chat");
                }
                return;
            }

            // Estado: pedindo data de revisão
            if (status === "asking_review") {
                // Parse da resposta de revisão
                const review = parseReviewFromResponse(content);

                if (review) {
                    setReviewDate(review);
                    setStatus("confirming");
                    await streamMessage("confirm", {
                        actionDeadline: actionDeadline ? formatDatePtBr(actionDeadline) : "",
                        reviewDate: formatDatePtBr(review)
                    });
                } else {
                    await streamMessage("chat");
                }
                return;
            }

            // Estado: confirmando
            if (status === "confirming") {
                if (lowerContent.includes("sim") || lowerContent.includes("correto") || lowerContent.includes("ok")) {
                    setStatus("saving");

                    // Salva sessão
                    const saveResponse = await fetch("/api/session/phase-d", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            action: "save_session",
                            sessionId,
                            userId,
                            decision,
                            nextAction,
                            actionDeadline: actionDeadline?.toISOString(),
                            reviewDate: reviewDate?.toISOString(),
                            counselors: counselors.map(c => c.name),
                            mode
                        })
                    });

                    const saveResult = await saveResponse.json();

                    if (saveResult.success) {
                        setSessionRecord(saveResult.sessionRecord);

                        // Mensagem de encerramento
                        await streamMessage("close", {
                            reviewDate: reviewDate ? formatDatePtBr(reviewDate) : ""
                        });

                        setStatus("complete");

                        // Callback de conclusão
                        if (onSessionComplete && reviewDate && nextAction) {
                            onSessionComplete({
                                nextAction,
                                actionDeadline: actionDeadline || new Date(),
                                reviewDate,
                                sessionRecord: saveResult.sessionRecord
                            });
                        }
                    }
                } else if (lowerContent.includes("não") || lowerContent.includes("corrigir")) {
                    // Volta para pedir ação
                    setStatus("asking_action");
                    await streamMessage("ask_action");
                } else {
                    await streamMessage("chat");
                }
                return;
            }

            // Chat geral
            await streamMessage("chat");

        } catch (err) {
            console.error("[usePhaseD] Error processing message:", err);
        }
    }, [isLoading, status, streamMessage, sessionId, userId, decision, nextAction, actionDeadline, reviewDate, counselors, mode, onSessionComplete]);

    // ============================================
    // 🔧 HELPERS
    // ============================================

    function parseDeadlineFromResponse(response: string): Date | null {
        const lower = response.toLowerCase();
        const today = new Date();

        // Opções numéricas
        if (lower === "1" || lower.includes("hoje")) {
            return today;
        }
        if (lower === "2" || lower.includes("amanhã")) {
            return new Date(today.getTime() + 24 * 60 * 60 * 1000);
        }
        if (lower === "3" || lower.includes("semana")) {
            return new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        }

        // Tenta parsear data explícita
        const dateMatch = response.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-]?(\d{2,4})?/);
        if (dateMatch) {
            const day = parseInt(dateMatch[1]);
            const month = parseInt(dateMatch[2]) - 1;
            const year = dateMatch[3] ? parseInt(dateMatch[3]) : today.getFullYear();
            return new Date(year < 100 ? 2000 + year : year, month, day);
        }

        return null;
    }

    function parseReviewFromResponse(response: string): Date | null {
        const lower = response.toLowerCase();
        const today = new Date();

        // Opções numéricas
        if (lower === "1" || lower.includes("1 semana")) {
            return calculateReviewDate("1week", today);
        }
        if (lower === "2" || lower.includes("2 semanas")) {
            return calculateReviewDate("2weeks", today);
        }
        if (lower === "3" || lower.includes("1 mês") || lower.includes("1 mes")) {
            return calculateReviewDate("1month", today);
        }
        if (lower === "4" || lower.includes("3 meses")) {
            return calculateReviewDate("3months", today);
        }

        // Tenta parsear data explícita
        const dateMatch = response.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-]?(\d{2,4})?/);
        if (dateMatch) {
            const day = parseInt(dateMatch[1]);
            const month = parseInt(dateMatch[2]) - 1;
            const year = dateMatch[3] ? parseInt(dateMatch[3]) : today.getFullYear();
            return new Date(year < 100 ? 2000 + year : year, month, day);
        }

        // Default: 2 semanas
        return calculateReviewDate("2weeks", today);
    }

    // ============================================
    // 📦 RETURN
    // ============================================

    return {
        status,
        messages,
        isLoading,
        typingPersona,
        nextAction,
        actionDeadline,
        reviewDate,
        sessionRecord,
        sendMessage,
        startPhaseD,
        error
    };
}
