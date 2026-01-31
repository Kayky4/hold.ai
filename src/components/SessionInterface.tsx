"use client";

import { useState, useRef, useEffect, useCallback, FormEvent } from "react";
import { Message, Persona, SessionMode, SessionPhase } from "@/types";
import { AIModel, DEFAULT_MODEL } from "@/types/models";
import { MODERATOR } from "@/lib/defaultPersonas";
import { updateConversationMessages } from "@/lib/conversations";
import { usePhaseH } from "@/hooks/usePhaseH";
import { usePhaseO } from "@/hooks/usePhaseO";
import { usePhaseOMesa } from "@/hooks/usePhaseOMesa";
import { usePhaseL } from "@/hooks/usePhaseL";
import { usePhaseD } from "@/hooks/usePhaseD";
import { PhaseHContext } from "@/lib/prompts/phaseH";
import { CapturedDecision } from "@/lib/prompts/phaseL";
import { PhaseDResult } from "@/lib/prompts/phaseD";
import ModelSelector from "./ModelSelector";

// ============================================
// 📐 TYPES
// ============================================

interface SessionInterfaceProps {
    /** Modo da sessão */
    mode: SessionMode;
    /** Conselheiros selecionados */
    counselors: Persona[];
    /** ID da sessão */
    sessionId: string;
    /** ID do usuário autenticado */
    userId?: string;
    /** Callback para encerrar sessão */
    onEndSession: () => void;
    /** Callback para pausar sessão */
    onPauseSession?: () => void;
    /** Mensagens iniciais (para retomar sessão) */
    initialMessages?: Message[];
}

// Estados das personas durante streaming
type PersonaState = "idle" | "thinking" | "streaming" | "done";

// ============================================
// 🎨 VISUAL CONFIG
// ============================================

const PHASE_CONFIG: Record<SessionPhase, {
    label: string;
    icon: string;
    color: string;
    description: string;
}> = {
    H: {
        label: "Clarificação",
        icon: "🔍",
        color: "text-blue-500",
        description: "Entendendo o contexto"
    },
    O: {
        label: "Debate",
        icon: "💬",
        color: "text-violet-500",
        description: "Múltiplas perspectivas"
    },
    L: {
        label: "Decisão",
        icon: "⚖️",
        color: "text-amber-500",
        description: "Sintetizando e decidindo"
    },
    D: {
        label: "Ação",
        icon: "✅",
        color: "text-emerald-500",
        description: "Definindo próximos passos"
    },
    completed: {
        label: "Concluída",
        icon: "🎯",
        color: "text-green-600",
        description: "Sessão finalizada"
    },
    paused: {
        label: "Pausada",
        icon: "⏸️",
        color: "text-slate-500",
        description: "Sessão pausada"
    }
};

const SPEAKER_COLORS: Record<string, {
    bg: string;
    border: string;
    text: string;
    avatar: string;
}> = {
    "system-moderator": {
        bg: "bg-slate-100 dark:bg-slate-800",
        border: "border-slate-300 dark:border-slate-600",
        text: "text-slate-700 dark:text-slate-300",
        avatar: "bg-slate-500"
    },
    "system-strategist": {
        bg: "bg-indigo-50 dark:bg-indigo-950/50",
        border: "border-indigo-200 dark:border-indigo-800",
        text: "text-indigo-700 dark:text-indigo-300",
        avatar: "bg-gradient-to-br from-indigo-500 to-blue-600"
    },
    "system-pragmatist": {
        bg: "bg-emerald-50 dark:bg-emerald-950/50",
        border: "border-emerald-200 dark:border-emerald-800",
        text: "text-emerald-700 dark:text-emerald-300",
        avatar: "bg-gradient-to-br from-emerald-500 to-green-600"
    },
    "system-risk-analyst": {
        bg: "bg-amber-50 dark:bg-amber-950/50",
        border: "border-amber-200 dark:border-amber-800",
        text: "text-amber-700 dark:text-amber-300",
        avatar: "bg-gradient-to-br from-amber-500 to-orange-600"
    },
    "system-mentor": {
        bg: "bg-violet-50 dark:bg-violet-950/50",
        border: "border-violet-200 dark:border-violet-800",
        text: "text-violet-700 dark:text-violet-300",
        avatar: "bg-gradient-to-br from-violet-500 to-purple-600"
    },
    "user": {
        bg: "bg-primary/5",
        border: "border-primary/20",
        text: "text-foreground",
        avatar: "bg-primary"
    }
};

// ============================================
// 🧱 MESSAGE COMPONENT
// ============================================

interface SessionMessageProps {
    message: Message;
    speaker: Persona | "user" | "moderator";
    /** Edit: injects user message into input for re-editing (only for user messages) */
    onEditMessage?: (content: string) => void;
    /** Retry: re-execute AI reasoning for same user question (only for AI messages) */
    onRetry?: (aiMessageId: string) => void;
}

function SessionMessage({ message, speaker, onEditMessage, onRetry }: SessionMessageProps) {
    const [showCopied, setShowCopied] = useState(false);

    const isUser = speaker === "user";
    const speakerId = typeof speaker === "string" ? speaker : speaker.id;
    const speakerName = typeof speaker === "string"
        ? (speaker === "user" ? "Você" : "Moderador")
        : speaker.name;
    const colors = SPEAKER_COLORS[speakerId] || SPEAKER_COLORS["system-moderator"];

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(message.content);
            setShowCopied(true);
            setTimeout(() => setShowCopied(false), 2000);
        } catch (error) {
            console.error("[SessionMessage] Copy failed:", error);
        }
    };

    /**
     * Edit: Inject user's own message into input field for editing
     * Allows user to refine and re-send their message
     */
    const handleEdit = () => {
        onEditMessage?.(message.content);
    };

    /**
     * Retry: Re-execute AI reasoning for the same user question
     * Maintains all conversation history and context
     * Implicitly signals to AI: "previous response didn't satisfy"
     */
    const handleRetry = () => {
        onRetry?.(message.id);
    };

    return (
        <div className={`${isUser ? "ml-8" : "mr-8"}`}>
            {/* Message Card */}
            <div
                className={`
                    flex gap-3 p-4 rounded-xl border transition-all duration-200
                    ${colors.bg} ${colors.border}
                `}
            >
                {/* Avatar */}
                <div
                    className={`
                        w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center
                        ${colors.avatar} text-white text-sm font-semibold
                    `}
                >
                    {speakerName.charAt(0).toUpperCase()}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`font-semibold text-sm ${colors.text}`}>
                            {speakerName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {new Date(message.timestamp).toLocaleTimeString("pt-BR", {
                                hour: "2-digit",
                                minute: "2-digit"
                            })}
                        </span>
                    </div>
                    <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                    </p>
                </div>
            </div>

            {/* Action Buttons - Always visible, below message */}
            <div className="flex justify-end mt-1.5">
                <div className="flex items-center gap-0.5">
                    {/* Copy Button - Available for all messages */}
                    <button
                        onClick={handleCopy}
                        className="p-1.5 rounded-md hover:bg-muted/50 transition-colors cursor-pointer"
                        title="Copiar"
                    >
                        {showCopied ? (
                            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4 text-muted-foreground hover:text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        )}
                    </button>

                    {/* Edit Button - Only for USER messages */}
                    {isUser && onEditMessage && (
                        <button
                            onClick={handleEdit}
                            className="p-1.5 rounded-md hover:bg-muted/50 transition-colors cursor-pointer"
                            title="Editar"
                        >
                            <svg className="w-4 h-4 text-muted-foreground hover:text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                        </button>
                    )}

                    {/* Retry Button - Only for AI/System messages */}
                    {!isUser && onRetry && (
                        <button
                            onClick={handleRetry}
                            className="p-1.5 rounded-md hover:bg-muted/50 transition-colors cursor-pointer"
                            title="Tentar novamente"
                        >
                            <svg className="w-4 h-4 text-muted-foreground hover:text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ============================================
// 🕐 TYPING INDICATOR
// ============================================

function TypingIndicator({ persona }: { persona: Persona }) {
    const colors = SPEAKER_COLORS[persona.id] || SPEAKER_COLORS["system-moderator"];

    return (
        <div
            className={`
                flex items-center gap-3 p-4 rounded-xl border mr-8
                ${colors.bg} ${colors.border} animate-pulse
            `}
        >
            {/* Avatar */}
            <div
                className={`
                    w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center
                    ${colors.avatar} text-white text-sm font-semibold
                `}
            >
                {persona.name.charAt(0).toUpperCase()}
            </div>

            {/* Typing dots */}
            <div className="flex items-center gap-1">
                <span className={`font-medium text-sm ${colors.text}`}>
                    {persona.name}
                </span>
                <span className="text-muted-foreground text-sm">está digitando</span>
                <span className="flex gap-1 ml-1">
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </span>
            </div>
        </div>
    );
}

// ============================================
// 📋 SESSION HEADER
// ============================================

function SessionHeader({
    phase,
    counselors,
    mode,
    selectedModel,
    onModelChange,
    onPause,
    onEnd
}: {
    phase: SessionPhase;
    counselors: Persona[];
    mode: SessionMode;
    selectedModel: AIModel;
    onModelChange: (model: AIModel) => void;
    onPause?: () => void;
    onEnd: () => void;
}) {
    const [showEndConfirm, setShowEndConfirm] = useState(false);
    const phaseConfig = PHASE_CONFIG[phase];

    return (
        <header className="bg-card border-b border-border px-4 py-3">
            <div className="flex items-center justify-between">
                {/* Left: Phase indicator */}
                <div className="flex items-center gap-4">
                    {/* Phase Badge */}
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-background border border-border`}>
                        <span className="text-lg">{phaseConfig.icon}</span>
                        <div>
                            <span className={`text-xs font-bold ${phaseConfig.color}`}>
                                FASE {phase}
                            </span>
                            <span className="text-xs text-muted-foreground ml-1.5">
                                {phaseConfig.label}
                            </span>
                        </div>
                    </div>

                    {/* Mode indicator */}
                    <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-full bg-background border border-border">
                        <span className="text-sm">{mode === 'solo' ? '👤' : mode === 'mesa' ? '👥' : '🔄'}</span>
                        <span className="text-xs text-muted-foreground">
                            {mode === 'solo' ? 'Solo' : mode === 'mesa' ? 'Mesa' : 'Revisão'}
                        </span>
                    </div>

                    {/* Active counselors */}
                    <div className="hidden md:flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Conselheiros:</span>
                        <div className="flex -space-x-2">
                            {counselors.map((c) => {
                                const colors = SPEAKER_COLORS[c.id];
                                return (
                                    <div
                                        key={c.id}
                                        className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-card ${colors?.avatar || "bg-slate-500"}`}
                                        title={c.name}
                                    >
                                        {c.name.charAt(0)}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2">
                    {/* Model Selector */}
                    <ModelSelector
                        selectedModel={selectedModel}
                        onModelChange={onModelChange}
                        compact
                    />

                    {onPause && (
                        <button
                            onClick={onPause}
                            className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="hidden sm:inline">Pausar</span>
                        </button>
                    )}

                    {showEndConfirm ? (
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Encerrar?</span>
                            <button
                                onClick={onEnd}
                                className="px-3 py-1.5 text-sm bg-destructive text-white rounded-lg hover:bg-destructive/90 transition-colors"
                            >
                                Sim
                            </button>
                            <button
                                onClick={() => setShowEndConfirm(false)}
                                className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Não
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowEndConfirm(true)}
                            className="px-3 py-1.5 text-sm text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1.5"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span className="hidden sm:inline">Encerrar</span>
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}

// ============================================
// 💬 SESSION INTERFACE
// ============================================

export default function SessionInterface({
    mode,
    counselors,
    sessionId,
    userId,
    onEndSession,
    onPauseSession,
    initialMessages = []
}: SessionInterfaceProps) {
    // Local UI state
    const [input, setInput] = useState("");
    const [currentPhase, setCurrentPhase] = useState<SessionPhase>("H");
    const [phaseHContext, setPhaseHContext] = useState<PhaseHContext | null>(null);
    const [debateHistory, setDebateHistory] = useState<string>("");
    const [capturedDecision, setCapturedDecision] = useState<CapturedDecision | null>(null);
    const [selectedModel, setSelectedModel] = useState<AIModel>(DEFAULT_MODEL);

    // Check if resuming a session (has existing messages)
    const isResuming = initialMessages.length > 0;

    // Callback to persist messages to database
    const handleMessagesChange = useCallback(async (msgs: Message[]) => {
        if (sessionId && msgs.length > 0) {
            try {
                console.log('[SessionInterface] Persisting messages to DB:', msgs.length);
                await updateConversationMessages(sessionId, msgs);
            } catch (error) {
                console.error('[SessionInterface] Error persisting messages:', error);
            }
        }
    }, [sessionId]);

    // Phase H hook integration
    const phaseH = usePhaseH({
        mode: mode as "solo" | "mesa",
        counselors,
        sessionId,
        model: selectedModel,
        initialMessages: isResuming ? initialMessages : undefined,
        onMessagesChange: handleMessagesChange,
        onPhaseComplete: (context: PhaseHContext) => {
            console.log("Phase H complete with context:", context);
            setPhaseHContext(context);
            setCurrentPhase("O");
        }
    });

    // Default context for Phase O hooks
    const defaultContext: PhaseHContext = {
        problem: "",
        businessContext: "",
        timing: "",
        stakeholders: [],
        alternatives: [],
        risks: [],
        gains: [],
        completeness: {
            problemClear: false,
            contextMapped: false,
            alternativesIdentified: false,
            stakesCleared: false
        }
    };

    // Phase O hook integration (Solo mode = 1 counselor)
    const phaseO = usePhaseO({
        counselor: counselors[0],
        context: phaseHContext || defaultContext,
        sessionId,
        model: selectedModel,
        onPhaseComplete: () => {
            console.log("Phase O complete, transitioning to Phase L");
            // Capture debate history for Phase L
            const history = phaseO.messages.map(m =>
                `${m.personaId || "user"}: ${m.content}`
            ).join("\n\n");
            setDebateHistory(history);
            setCurrentPhase("L");
        }
    });

    // Phase O Mesa hook integration (Mesa mode = 2 counselors)
    const phaseOMesa = usePhaseOMesa({
        counselor1: counselors[0],
        counselor2: counselors[1] || counselors[0], // Fallback if only 1 counselor
        context: phaseHContext || defaultContext,
        sessionId,
        model: selectedModel,
        onPhaseComplete: () => {
            console.log("Phase O Mesa complete, transitioning to Phase L");
            // Capture debate history for Phase L
            const history = phaseOMesa.messages.map(m =>
                `${m.personaId || "user"}: ${m.content}`
            ).join("\n\n");
            setDebateHistory(history);
            setCurrentPhase("L");
        }
    });

    // Phase L hook integration (Decisão)
    const phaseL = usePhaseL({
        counselors,
        context: phaseHContext || defaultContext,
        debateHistory: debateHistory || "",
        sessionId,
        model: selectedModel,
        onPhaseComplete: (decision: CapturedDecision) => {
            console.log("Phase L complete, decision captured:", decision);
            setCapturedDecision(decision);
            setCurrentPhase("D");
        }
    });

    // Phase D hook integration (Ação)
    const defaultDecision: CapturedDecision = {
        decision: "",
        reasoning: "",
        alternatives: [],
        acceptedRisks: []
    };

    const phaseD = usePhaseD({
        decision: capturedDecision || defaultDecision,
        sessionId,
        userId: userId || "anonymous",
        counselors,
        mode: mode as "solo" | "mesa",
        model: selectedModel,
        onSessionComplete: (result: PhaseDResult) => {
            console.log("Session complete:", result);
            setCurrentPhase("completed");
        }
    });

    // Determine if we're in Mesa mode (2+ counselors)
    const isMesaMode = mode === "mesa" && counselors.length >= 2;

    // Select active phase hook based on current phase and mode
    const isPhaseH = currentPhase === "H";
    const isPhaseO = currentPhase === "O";
    const isPhaseL = currentPhase === "L";
    const isPhaseD = currentPhase === "D";

    // Get active state based on phase and mode
    const getActivePhaseState = () => {
        if (isPhaseH) return phaseH;
        if (isPhaseO) return isMesaMode ? phaseOMesa : phaseO;
        if (isPhaseL) return phaseL;
        if (isPhaseD) return phaseD;
        return phaseH; // Default fallback
    };

    const activePhase = getActivePhaseState();
    const { messages, isLoading, typingPersona, sendMessage } = activePhase;

    // Start Phase O debate when context is ready
    useEffect(() => {
        if (currentPhase === "O" && phaseHContext) {
            if (isMesaMode && phaseOMesa.status === "presenting") {
                phaseOMesa.startDebate();
            } else if (!isMesaMode && phaseO.status === "presenting") {
                phaseO.startDebate();
            }
        }
    }, [currentPhase, phaseHContext, isMesaMode, phaseOMesa, phaseO]);

    // Start Phase L synthesis when debate is complete
    useEffect(() => {
        if (currentPhase === "L" && debateHistory && phaseHContext) {
            if (phaseL.status === "synthesizing" && phaseL.messages.length === 0) {
                console.log("[SessionInterface] Starting Phase L synthesis...");
                phaseL.startSynthesis();
            }
        }
    }, [currentPhase, debateHistory, phaseHContext, phaseL]);

    // Start Phase D when decision is captured
    useEffect(() => {
        if (currentPhase === "D" && capturedDecision) {
            if (phaseD.status === "asking_action" && phaseD.messages.length === 0) {
                console.log("[SessionInterface] Starting Phase D...");
                phaseD.startPhaseD();
            }
        }
    }, [currentPhase, capturedDecision, phaseD]);

    // Refs
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-scroll to bottom
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, typingPersona, scrollToBottom]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
        }
    }, [input]);

    // Handle send message
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const messageContent = input.trim();
        setInput("");

        console.log("[SessionInterface] Sending message:", messageContent.substring(0, 50));
        console.log("[SessionInterface] Current phase:", currentPhase);
        console.log("[SessionInterface] Is loading:", isLoading);

        try {
            // Use the active phase's sendMessage
            await sendMessage(messageContent);
            console.log("[SessionInterface] Message sent successfully");
        } catch (err) {
            console.error("[SessionInterface] Error sending message:", err);
        }
    };

    /**
     * Edit Message: Inject user's own message into input for editing
     * Allows user to refine and re-send their message
     */
    const handleEditMessage = useCallback((content: string) => {
        // Inject the user's message directly into input for editing
        setInput(content);

        // Focus the textarea
        setTimeout(() => {
            textareaRef.current?.focus();
            // Move cursor to the end
            if (textareaRef.current) {
                textareaRef.current.selectionStart = textareaRef.current.value.length;
                textareaRef.current.selectionEnd = textareaRef.current.value.length;
            }
        }, 50);
    }, []);

    /**
     * Retry: Re-execute AI reasoning for the same user question
     * 1. Find the previous user message before this AI response
     * 2. Re-send that message to get a new AI response
     * 3. Maintains all conversation history and context
     */
    const handleRetry = useCallback(async (aiMessageId: string) => {
        // Find the AI message index
        const aiMessageIndex = messages.findIndex(m => m.id === aiMessageId);
        if (aiMessageIndex === -1) {
            console.error("[SessionInterface] AI message not found for retry");
            return;
        }

        // Find the previous user message
        let userMessageIndex = -1;
        for (let i = aiMessageIndex - 1; i >= 0; i--) {
            if (messages[i].role === "user") {
                userMessageIndex = i;
                break;
            }
        }

        if (userMessageIndex === -1) {
            console.error("[SessionInterface] No previous user message found for retry");
            return;
        }

        const userMessage = messages[userMessageIndex];
        console.log("[SessionInterface] Retrying with user message:", userMessage.content.substring(0, 50));

        try {
            // Re-send the same user message to get a new AI response
            await sendMessage(userMessage.content);
            console.log("[SessionInterface] Retry sent successfully");
        } catch (err) {
            console.error("[SessionInterface] Error in retry:", err);
        }
    }, [messages, sendMessage]);

    // Get speaker for message
    const getSpeaker = (message: Message): Persona | "user" | "moderator" => {
        if (message.role === "user") return "user";
        if (message.personaId === MODERATOR.id) return MODERATOR;
        return counselors.find(c => c.id === message.personaId) || MODERATOR;
    };

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Header */}
            <SessionHeader
                phase={currentPhase}
                counselors={counselors}
                mode={mode}
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
                onPause={onPauseSession}
                onEnd={onEndSession}
            />

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
                    {messages.map((message) => (
                        <SessionMessage
                            key={message.id}
                            message={message}
                            speaker={getSpeaker(message)}
                            onEditMessage={handleEditMessage}
                            onRetry={handleRetry}
                        />
                    ))}

                    {/* Typing indicator */}
                    {typingPersona && (
                        <TypingIndicator persona={typingPersona} />
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="border-t border-border bg-card px-4 py-4">
                <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
                    <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <textarea
                                ref={textareaRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSubmit(e);
                                    }
                                }}
                                placeholder="Digite sua resposta..."
                                disabled={isLoading}
                                rows={1}
                                className="w-full px-4 py-3 bg-background border border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className={`
                                px-4 py-3 rounded-xl font-medium transition-all duration-200
                                flex items-center justify-center
                                ${input.trim() && !isLoading
                                    ? "bg-primary hover:bg-primary-hover text-white"
                                    : "bg-muted text-muted-foreground cursor-not-allowed"
                                }
                            `}
                        >
                            {isLoading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            )}
                        </button>
                    </div>

                    {/* Helper text */}
                    <p className="text-xs text-muted mt-2 text-center">
                        <kbd className="px-1.5 py-0.5 bg-muted rounded text-muted-foreground">Enter</kbd> para enviar ·
                        <kbd className="px-1.5 py-0.5 bg-muted rounded text-muted-foreground ml-1">Shift+Enter</kbd> para nova linha
                    </p>
                </form>
            </div>
        </div>
    );
}
