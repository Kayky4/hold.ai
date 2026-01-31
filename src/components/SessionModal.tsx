/**
 * 💬 SessionModal Component
 * 
 * Modal para sessões de chat (Solo/Mesa).
 * O chat agora abre como modal, não como tela principal.
 * 
 * @see visao_holdai.md — "O Chat é a entrada. O CRM é o produto."
 */

"use client";

import { useState, useRef, useEffect, FormEvent, useCallback } from "react";
import { Message, Persona, SessionMode } from "@/types";
import { AIModel, DEFAULT_MODEL } from "@/types/models";
import Portal from "./Portal";
import CounselorSelection from "./CounselorSelection";
import SessionInterface from "./SessionInterface";
import PersonaManager from "./PersonaManager";
import ModelSelector from "./ModelSelector";
import { useAuth } from "@/contexts/AuthContext";
import {
    createConversation,
    updateConversationMessages,
    updateConversationTitle,
    generateTitleFromMessage,
} from "@/lib/conversations";
import { generateSystemPrompt, getPersonasByIds } from "@/lib/personas";

interface SessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    /** ID da sessão para retomar (opcional) */
    resumeSessionId?: string | null;
    /** Decisão existente para editar (opcional) */
    decisionId?: string;
    /** Projeto para vincular a decisão */
    projectId?: string;
}

function generateId(): string {
    return Math.random().toString(36).substring(2, 15);
}

export default function SessionModal({ isOpen, onClose, resumeSessionId, decisionId, projectId }: SessionModalProps) {
    const { user } = useAuth();
    const userId = user?.uid || "";

    const [step, setStep] = useState<"portal" | "counselors" | "session">("portal");
    const [selectedSessionMode, setSelectedSessionMode] = useState<SessionMode | null>(null);
    const [activeSession, setActiveSession] = useState<{
        mode: SessionMode;
        counselors: Persona[];
        sessionId: string;
    } | null>(null);

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
    const [showPersonaManager, setShowPersonaManager] = useState(false);
    const [selectedModel, setSelectedModel] = useState<AIModel>(DEFAULT_MODEL);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Load existing session if resumeSessionId is provided
    useEffect(() => {
        const loadExistingSession = async () => {
            console.log('[SessionModal] loadExistingSession called', { isOpen, resumeSessionId, userId });

            if (isOpen && resumeSessionId && userId) {
                try {
                    const { getConversation } = await import("@/lib/conversations");
                    const conversation = await getConversation(resumeSessionId);
                    console.log('[SessionModal] Loaded conversation:', conversation);
                    console.log('[SessionModal] Messages count:', conversation?.messages?.length);
                    console.log('[SessionModal] CounselorIds:', conversation?.counselorIds);

                    if (conversation) {
                        // Determine the session mode from saved data
                        const sessionMode = conversation.mode === 'mesa' ? 'mesa' : 'solo';

                        // Reconstruct counselors from saved IDs
                        let counselors: Persona[] = [];
                        if (conversation.counselorIds && conversation.counselorIds.length > 0) {
                            try {
                                counselors = await getPersonasByIds(userId, conversation.counselorIds);
                                console.log('[SessionModal] Restored counselors:', counselors.map(c => c.name));
                            } catch (error) {
                                console.warn('[SessionModal] Failed to restore counselors:', error);
                            }
                        }

                        // Set all state together to avoid race conditions
                        setActiveConversationId(resumeSessionId);
                        setSelectedSessionMode(sessionMode);
                        setActiveSession({
                            mode: sessionMode,
                            counselors,
                            sessionId: resumeSessionId
                        });
                        setMessages(conversation.messages || []);
                        console.log('[SessionModal] State updated, messages set to:', conversation.messages?.length);
                        setStep("session");
                    }
                } catch (error) {
                    console.error("Error loading session:", error);
                }
            } else if (isOpen && !resumeSessionId) {
                // Only reset when opening fresh (not resuming)
                console.log('[SessionModal] Opening fresh, resetting state');
                setStep("portal");
                setSelectedSessionMode(null);
                setActiveSession(null);
                setMessages([]);
                setInput("");
                setActiveConversationId(null);
            }
        };
        loadExistingSession();
    }, [isOpen, resumeSessionId, userId]);

    // Reset ONLY when modal is closed
    useEffect(() => {
        if (!isOpen) {
            // Delay reset to avoid race conditions
            const timer = setTimeout(() => {
                setStep("portal");
                setSelectedSessionMode(null);
                setActiveSession(null);
                setMessages([]);
                setInput("");
                setActiveConversationId(null);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, [input]);

    const handlePortalModeSelect = (mode: SessionMode) => {
        setSelectedSessionMode(mode);
        if (mode === "revision") {
            handleStartRevisionSession();
        } else {
            setStep("counselors");
        }
    };

    const handleCounselorConfirm = async (counselors: Persona[]) => {
        if (!userId || !selectedSessionMode) return;

        try {
            const mode = selectedSessionMode === 'mesa' ? 'mesa' : 'solo';
            const id = await createConversation(userId, "Nova Conversa", {
                mode,
                phase: 'H',
                counselorCount: counselors.length,
                counselorIds: counselors.map(c => c.id)
            });
            setActiveConversationId(id);
            setMessages([]);

            setActiveSession({
                mode: selectedSessionMode,
                counselors,
                sessionId: id
            });

            setStep("session");
        } catch (error) {
            console.error("Error creating conversation:", error);
        }
    };

    const handleCounselorBack = () => {
        setSelectedSessionMode(null);
        setStep("portal");
    };

    const handleStartRevisionSession = async () => {
        if (!userId) return;

        try {
            const id = await createConversation(userId, "Nova Conversa", {
                mode: 'revisao',
                phase: 'H'
            });
            setActiveConversationId(id);
            setMessages([]);
            // TODO: Iniciar sessão de revisão
            console.log("Sessão de revisão iniciada");
            setSelectedSessionMode(null);
            setStep("session");
        } catch (error) {
            console.error("Error creating revision session:", error);
        }
    };

    const handleEndSession = () => {
        setActiveSession(null);
        onClose();
    };

    const handlePauseSession = () => {
        // TODO: Implementar lógica de pausar sessão
        console.log("Sessão pausada");
        onClose();
    };

    const saveMessages = useCallback(async (conversationId: string, msgs: Message[], isFirstMessage: boolean = false) => {
        setIsSaving(true);
        try {
            await updateConversationMessages(conversationId, msgs);
            if (isFirstMessage) {
                const firstUserMessage = msgs.find(m => m.role === "user");
                if (firstUserMessage) {
                    const title = generateTitleFromMessage(firstUserMessage.content);
                    await updateConversationTitle(conversationId, title);
                }
            }
        } catch (error) {
            console.error("Error saving messages:", error);
        } finally {
            setIsSaving(false);
        }
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e as unknown as FormEvent);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        let conversationId = activeConversationId;
        let isFirstMessage = false;

        if (!conversationId) {
            if (!userId) return;
            try {
                const mode = activeSession?.mode === 'mesa' ? 'mesa' : 'solo';
                conversationId = await createConversation(userId, "Nova Conversa", {
                    mode,
                    phase: 'H',
                    counselorCount: activeSession?.counselors?.length || 0
                });
                setActiveConversationId(conversationId);
                isFirstMessage = true;
            } catch (error) {
                console.error("Error creating conversation:", error);
                return;
            }
        }

        const userMessage: Message = {
            id: generateId(),
            role: "user",
            content: input.trim(),
            timestamp: new Date(),
        };

        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput("");
        setIsLoading(true);

        try {
            const systemPrompt = selectedPersona
                ? generateSystemPrompt(selectedPersona)
                : undefined;

            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: newMessages.map((m) => ({
                        role: m.role,
                        content: m.content,
                    })),
                    systemPrompt,
                    model: selectedModel,
                }),
            });

            if (!response.ok) throw new Error("Failed to get response");

            const data = await response.json();
            const assistantMessage: Message = {
                id: generateId(),
                role: "assistant",
                content: data.message,
                timestamp: new Date(),
            };

            const updatedMessages = [...newMessages, assistantMessage];
            setMessages(updatedMessages);
            await saveMessages(conversationId, updatedMessages, isFirstMessage);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const currentPersonaName = selectedPersona?.name || "Mentor Estratégico";
    const currentPersonaInitial = currentPersonaName.charAt(0);
    const currentPersonaDescription = selectedPersona?.description || "Consultor de Negócios";

    if (!isOpen) return null;

    // Step 1: Portal (select mode)
    if (step === "portal") {
        return (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fadeIn">
                <div className="relative h-full">
                    <button
                        onClick={onClose}
                        className="absolute top-5 right-5 z-10 p-2.5 rounded-xl bg-card border border-border hover:bg-background transition-colors"
                        title="Fechar"
                    >
                        <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <Portal onSelectMode={handlePortalModeSelect} />
                </div>
            </div>
        );
    }

    // Step 2: Counselor Selection
    if (step === "counselors" && selectedSessionMode && (selectedSessionMode === "solo" || selectedSessionMode === "mesa")) {
        return (
            <div className="fixed inset-0 z-50 bg-background animate-slideUp">
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 z-10 p-2.5 rounded-xl bg-card border border-border hover:bg-background transition-colors"
                    title="Fechar"
                >
                    <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <CounselorSelection
                    mode={selectedSessionMode}
                    onConfirm={handleCounselorConfirm}
                    onBack={handleCounselorBack}
                />
            </div>
        );
    }

    // Step 3: Active Session (SessionInterface or MeetingRoom)
    if (step === "session") {
        if (activeSession) {
            return (
                <div className="fixed inset-0 z-50 bg-background animate-slideUp">
                    <SessionInterface
                        mode={activeSession.mode}
                        counselors={activeSession.counselors}
                        sessionId={activeSession.sessionId}
                        userId={userId}
                        onEndSession={handleEndSession}
                        onPauseSession={handlePauseSession}
                        initialMessages={messages}
                    />
                </div>
            );
        }

        // Fallback: Simple chat (for revision or direct chat)
        return (
            <div className="fixed inset-0 z-50 bg-background flex flex-col animate-slideUp">
                {/* Header */}
                <header className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <button
                        onClick={() => setShowPersonaManager(true)}
                        className="flex items-center gap-3 hover:bg-card p-2 pr-4 rounded-xl transition-colors duration-200"
                    >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">{currentPersonaInitial}</span>
                        </div>
                        <div className="text-left">
                            <h2 className="text-sm font-semibold text-foreground">{currentPersonaName}</h2>
                            <p className="text-xs text-muted-foreground">{currentPersonaDescription}</p>
                        </div>
                    </button>

                    <div className="flex items-center gap-3">
                        {isSaving && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <div className="w-3 h-3 border-2 border-muted border-t-primary rounded-full animate-spin"></div>
                                Salvando...
                            </div>
                        )}
                        <ModelSelector
                            selectedModel={selectedModel}
                            onModelChange={setSelectedModel}
                            compact
                        />
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-card transition-colors"
                            title="Fechar"
                        >
                            <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </header>

                {/* Messages */}
                <main className="flex-1 overflow-y-auto px-6 py-6">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center mb-6">
                                <span className="text-white font-bold text-3xl">{currentPersonaInitial}</span>
                            </div>
                            <h2 className="text-2xl font-semibold text-foreground mb-2">
                                Olá! Sou {currentPersonaName}
                            </h2>
                            <p className="text-muted-foreground max-w-md mb-8">
                                Estou aqui para ajudar você a tomar decisões melhores.
                                Compartilhe o que está pensando ou sobre o que precisa de clareza.
                            </p>
                        </div>
                    ) : (
                        <div className="max-w-3xl mx-auto space-y-6">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[80%] ${message.role === "user"
                                            ? "bg-primary text-white rounded-2xl rounded-br-md px-4 py-3"
                                            : "bg-card text-foreground rounded-2xl rounded-bl-md px-4 py-3 border border-border"
                                            }`}
                                    >
                                        <p className="whitespace-pre-wrap leading-relaxed text-sm">
                                            {message.content}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-card rounded-2xl rounded-bl-md px-4 py-3 border border-border">
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 rounded-full bg-muted animate-pulse"></div>
                                            <div className="w-2 h-2 rounded-full bg-muted animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                                            <div className="w-2 h-2 rounded-full bg-muted animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </main>

                {/* Input */}
                <footer className="px-6 py-4 border-t border-border">
                    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
                        <div className="flex items-end gap-3 bg-card rounded-2xl border border-border p-3 focus-within:border-primary transition-colors">
                            <textarea
                                ref={textareaRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Compartilhe sua ideia, desafio ou dúvida..."
                                rows={1}
                                className="flex-1 bg-transparent text-foreground placeholder-muted resize-none outline-none text-sm leading-relaxed max-h-[200px]"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="px-4 py-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white rounded-xl font-medium text-sm transition-all flex items-center gap-2"
                            >
                                {isLoading ? (
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Enviar
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </footer>

                {/* Persona Manager Modal */}
                {showPersonaManager && (
                    <PersonaManager
                        selectedPersonaId={selectedPersona?.id || null}
                        onSelectPersona={(persona) => {
                            setSelectedPersona(persona);
                            setShowPersonaManager(false);
                        }}
                        onClose={() => setShowPersonaManager(false)}
                    />
                )}
            </div>
        );
    }

    return null;
}
