"use client";

import { useState, useRef, useEffect, FormEvent, useCallback } from "react";
import { Message, Conversation, Persona } from "@/types";
import { ProjectContext } from "@/types/project";
import { AIModel, DEFAULT_MODEL } from "@/types/models";
import Sidebar from "./Sidebar";
import PersonaManager from "./PersonaManager";
import MeetingSetup from "./MeetingSetup";
import MeetingRoom from "./MeetingRoom";
import MeetingViewer from "./MeetingViewer";
import SettingsModal from "./SettingsModal";
import ModelSelector from "./ModelSelector";
import {
    getConversations,
    getConversation,
    createConversation,
    updateConversationMessages,
    updateConversationTitle,
    deleteConversation,
    generateTitleFromMessage,
} from "@/lib/conversations";
import { getMeetings, deleteMeeting, Meeting } from "@/lib/meetings";
import { getActiveProject, generateContextPrompt } from "@/lib/projects";
import { generateSystemPrompt } from "@/lib/personas";

function generateId(): string {
    return Math.random().toString(36).substring(2, 15);
}

export default function ChatInterface() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [viewingMeeting, setViewingMeeting] = useState<Meeting | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarLoading, setIsSidebarLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showPersonaManager, setShowPersonaManager] = useState(false);
    const [showMeetingSetup, setShowMeetingSetup] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [projectContext, setProjectContext] = useState<ProjectContext | null>(null);
    const [selectedModel, setSelectedModel] = useState<AIModel>(DEFAULT_MODEL);
    const [meetingConfig, setMeetingConfig] = useState<{
        persona1: Persona;
        persona2: Persona;
        topic: string;
    } | null>(null);
    const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Load conversations on mount
    useEffect(() => {
        loadConversations();
    }, []);

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

    const loadConversations = async () => {
        setIsSidebarLoading(true);
        try {
            const [convs, meets, project] = await Promise.all([
                getConversations(),
                getMeetings(),
                getActiveProject(),
            ]);
            setConversations(convs);
            setMeetings(meets);
            setProjectContext(project);
        } catch (error) {
            console.error("Error loading conversations:", error);
        } finally {
            setIsSidebarLoading(false);
        }
    };

    const handleSelectConversation = async (id: string) => {
        if (id === activeConversationId) return;

        try {
            const conversation = await getConversation(id);
            if (conversation) {
                setActiveConversationId(id);
                setMessages(conversation.messages);
                setViewingMeeting(null); // Clear meeting view when selecting conversation
            }
        } catch (error) {
            console.error("Error loading conversation:", error);
        }
    };

    const handleNewConversation = async () => {
        try {
            const id = await createConversation();
            setActiveConversationId(id);
            setMessages([]);
            await loadConversations();
        } catch (error) {
            console.error("Error creating conversation:", error);
        }
    };

    const handleDeleteConversation = async (id: string) => {
        try {
            await deleteConversation(id);
            if (activeConversationId === id) {
                setActiveConversationId(null);
                setMessages([]);
            }
            await loadConversations();
        } catch (error) {
            console.error("Error deleting conversation:", error);
        }
    };

    const handleSelectPersona = (persona: Persona) => {
        setSelectedPersona(persona);
        setShowPersonaManager(false);
    };

    const handleStartMeeting = (persona1: Persona, persona2: Persona, topic: string) => {
        setShowMeetingSetup(false);
        setMeetingConfig({ persona1, persona2, topic });
    };

    const handleCloseMeeting = async () => {
        setMeetingConfig(null);
        // Reload to get the newly saved meeting
        await loadConversations();
    };

    const handleDeleteMeeting = async (id: string) => {
        try {
            await deleteMeeting(id);
            await loadConversations();
        } catch (error) {
            console.error("Error deleting meeting:", error);
        }
    };

    const handleMeetingSaved = () => {
        // Reload meetings list
        loadConversations();
    };

    const handleSelectMeeting = (meeting: Meeting) => {
        // Clear conversation state and show the meeting
        setActiveConversationId(null);
        setMessages([]);
        setViewingMeeting(meeting);
    };

    const saveMessages = useCallback(async (conversationId: string, msgs: Message[], isFirstMessage: boolean = false) => {
        setIsSaving(true);
        try {
            await updateConversationMessages(conversationId, msgs);

            // Update title if this is the first user message
            if (isFirstMessage) {
                const firstUserMessage = msgs.find(m => m.role === "user");
                if (firstUserMessage) {
                    const title = generateTitleFromMessage(firstUserMessage.content);
                    await updateConversationTitle(conversationId, title);
                }
            }

            await loadConversations();
        } catch (error) {
            console.error("Error saving messages:", error);
        } finally {
            setIsSaving(false);
        }
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        // Create conversation if none exists
        let conversationId = activeConversationId;
        let isFirstMessage = false;

        if (!conversationId) {
            try {
                conversationId = await createConversation();
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

        // Check if this is the first message for title generation
        if (messages.length === 0) {
            isFirstMessage = true;
        }

        try {
            // Generate system prompt from selected persona or use default
            const systemPrompt = selectedPersona ? generateSystemPrompt(selectedPersona) : undefined;

            // Generate context string from project context
            const contextString = projectContext ? generateContextPrompt(projectContext) : undefined;

            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    messages: newMessages.map((m) => ({
                        role: m.role,
                        content: m.content,
                    })),
                    systemPrompt,
                    projectContext: contextString,
                    model: selectedModel,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to get response");
            }

            const data = await response.json();

            const assistantMessage: Message = {
                id: generateId(),
                role: "assistant",
                content: data.content,
                timestamp: new Date(),
            };

            const finalMessages = [...newMessages, assistantMessage];
            setMessages(finalMessages);

            // Save to Firestore
            if (conversationId) {
                await saveMessages(conversationId, finalMessages, isFirstMessage);
            }
        } catch (error) {
            console.error("Error sending message:", error);
            const errorMessage: Message = {
                id: generateId(),
                role: "assistant",
                content: "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.",
                timestamp: new Date(),
            };
            const finalMessages = [...newMessages, errorMessage];
            setMessages(finalMessages);

            if (conversationId) {
                await saveMessages(conversationId, finalMessages, isFirstMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const currentPersonaName = selectedPersona?.name || "Mentor Estratégico";
    const currentPersonaDescription = selectedPersona?.description || "Consultor de Negócios";
    const currentPersonaInitial = currentPersonaName.charAt(0).toUpperCase();

    // Render Meeting Room if active
    if (meetingConfig) {
        return (
            <MeetingRoom
                persona1={meetingConfig.persona1}
                persona2={meetingConfig.persona2}
                initialTopic={meetingConfig.topic}
                onClose={handleCloseMeeting}
                onMeetingSaved={handleMeetingSaved}
            />
        );
    }

    return (
        <div className="flex h-screen bg-[var(--background)]">
            {/* Sidebar */}
            <Sidebar
                conversations={conversations}
                meetings={meetings}
                activeConversationId={activeConversationId}
                activeMeetingId={viewingMeeting?.id || null}
                onSelectConversation={handleSelectConversation}
                onSelectMeeting={handleSelectMeeting}
                onNewConversation={handleNewConversation}
                onDeleteConversation={handleDeleteConversation}
                onDeleteMeeting={handleDeleteMeeting}
                onStartMeeting={() => setShowMeetingSetup(true)}
                onOpenSettings={() => setShowSettings(true)}
                isLoading={isSidebarLoading}
            />

            {/* Meeting Viewer (for saved meetings) */}
            {viewingMeeting ? (
                <MeetingViewer
                    meeting={viewingMeeting}
                    onClose={() => setViewingMeeting(null)}
                />
            ) : (
                /* Main Chat Area */
                <div className="flex-1 flex flex-col">
                    {/* Header */}
                    <header className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
                        <button
                            onClick={() => setShowPersonaManager(true)}
                            className="flex items-center gap-3 hover:bg-[var(--card)] p-2 pr-4 rounded-xl transition-colors duration-200"
                        >
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center">
                                <span className="text-white font-bold text-sm">{currentPersonaInitial}</span>
                            </div>
                            <div className="text-left">
                                <h2 className="text-sm font-semibold text-[var(--foreground)]">{currentPersonaName}</h2>
                                <p className="text-xs text-[var(--muted-foreground)]">{currentPersonaDescription}</p>
                            </div>
                            <svg className="w-4 h-4 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        <div className="flex items-center gap-3">
                            {isSaving && (
                                <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                                    <div className="w-3 h-3 border-2 border-[var(--muted)] border-t-[var(--primary)] rounded-full animate-spin"></div>
                                    Salvando...
                                </div>
                            )}
                            <ModelSelector
                                selectedModel={selectedModel}
                                onModelChange={setSelectedModel}
                                compact
                            />
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[var(--accent)]"></div>
                                <span className="text-xs text-[var(--muted-foreground)]">Online</span>
                            </div>
                        </div>
                    </header>

                    {/* Messages Area */}
                    <main className="flex-1 overflow-y-auto px-6 py-6">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center mb-6">
                                    <span className="text-white font-bold text-3xl">{currentPersonaInitial}</span>
                                </div>
                                <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-2">
                                    Olá! Sou {currentPersonaName}
                                </h2>
                                <p className="text-[var(--muted-foreground)] max-w-md mb-8">
                                    Estou aqui para ajudar você a tomar decisões melhores sobre seu SaaS.
                                    Compartilhe o que está pensando, qual desafio está enfrentando, ou
                                    sobre o que precisa de clareza.
                                </p>
                                <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                                    {[
                                        "Preciso definir o posicionamento do meu produto",
                                        "Estou em dúvida sobre qual feature priorizar",
                                        "Quero validar uma hipótese de negócio",
                                    ].map((suggestion, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setInput(suggestion)}
                                            className="px-4 py-2 text-sm rounded-lg border border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--border-hover)] hover:text-[var(--foreground)] transition-all duration-200"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="max-w-3xl mx-auto space-y-6">
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
                                    >
                                        <div
                                            className={`max-w-[80%] ${message.role === "user"
                                                ? "bg-[var(--primary)] text-white rounded-2xl rounded-br-md px-4 py-3"
                                                : "bg-[var(--card)] text-[var(--foreground)] rounded-2xl rounded-bl-md px-4 py-3 border border-[var(--border)]"
                                                }`}
                                        >
                                            {message.role === "assistant" && (
                                                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[var(--border)]">
                                                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center">
                                                        <span className="text-white font-bold text-xs">{currentPersonaInitial}</span>
                                                    </div>
                                                    <span className="text-xs font-medium text-[var(--muted-foreground)]">
                                                        {currentPersonaName}
                                                    </span>
                                                </div>
                                            )}
                                            <p className="whitespace-pre-wrap leading-relaxed text-sm">
                                                {message.content}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex justify-start animate-fade-in">
                                        <div className="bg-[var(--card)] text-[var(--foreground)] rounded-2xl rounded-bl-md px-4 py-3 border border-[var(--border)]">
                                            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[var(--border)]">
                                                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center">
                                                    <span className="text-white font-bold text-xs">{currentPersonaInitial}</span>
                                                </div>
                                                <span className="text-xs font-medium text-[var(--muted-foreground)]">
                                                    {currentPersonaName}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <div className="w-2 h-2 rounded-full bg-[var(--muted)] animate-pulse-slow"></div>
                                                <div className="w-2 h-2 rounded-full bg-[var(--muted)] animate-pulse-slow" style={{ animationDelay: "0.2s" }}></div>
                                                <div className="w-2 h-2 rounded-full bg-[var(--muted)] animate-pulse-slow" style={{ animationDelay: "0.4s" }}></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </main>

                    {/* Input Area */}
                    <footer className="px-6 py-4 border-t border-[var(--border)]">
                        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
                            <div className="flex items-end gap-3 bg-[var(--card)] rounded-2xl border border-[var(--border)] p-3 focus-within:border-[var(--primary)] transition-colors duration-200">
                                <textarea
                                    ref={textareaRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Compartilhe sua ideia, desafio ou dúvida..."
                                    rows={1}
                                    className="flex-1 bg-transparent text-[var(--foreground)] placeholder-[var(--muted)] resize-none outline-none text-sm leading-relaxed max-h-[200px]"
                                    disabled={isLoading}
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isLoading}
                                    className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium text-sm transition-all duration-200 flex items-center gap-2"
                                >
                                    {isLoading ? (
                                        <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    ) : (
                                        <>
                                            Enviar
                                            <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                                                />
                                            </svg>
                                        </>
                                    )}
                                </button>
                            </div>
                            <p className="text-center text-xs text-[var(--muted)] mt-3">
                                Pressione Enter para enviar, Shift+Enter para nova linha
                            </p>
                        </form>
                    </footer>
                </div>
            )}

            {/* Persona Manager Modal */}
            {showPersonaManager && (
                <PersonaManager
                    selectedPersonaId={selectedPersona?.id || null}
                    onSelectPersona={handleSelectPersona}
                    onClose={() => setShowPersonaManager(false)}
                />
            )}

            {/* Meeting Setup Modal */}
            {showMeetingSetup && (
                <MeetingSetup
                    onStart={handleStartMeeting}
                    onClose={() => setShowMeetingSetup(false)}
                />
            )}

            {/* Settings Modal */}
            <SettingsModal
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
            />
        </div>
    );
}
