"use client";

import { useState, useRef, useEffect, FormEvent, useCallback } from "react";
import { Persona } from "@/types";
import { ProjectContext } from "@/types/project";
import { AIModel, DEFAULT_MODEL } from "@/types/models";
import { generateSystemPrompt } from "@/lib/personas";
import { getActiveProject, generateContextPrompt } from "@/lib/projects";
import { createMeeting, updateMeetingMessages, MeetingMessage as FirestoreMeetingMessage } from "@/lib/meetings";
import ModelSelector from "./ModelSelector";
import MeetingSummary from "./MeetingSummary";
import { useAuth } from "@/contexts/AuthContext";

interface MeetingMessage {
    id: string;
    speaker: string;
    speakerIndex: number; // 0 = user, 1 = persona1, 2 = persona2
    content: string;
    timestamp: Date;
}

interface MeetingRoomProps {
    persona1: Persona;
    persona2: Persona;
    initialTopic: string;
    onClose: () => void;
    onMeetingSaved?: () => void;
}

function generateId(): string {
    return Math.random().toString(36).substring(2, 15);
}

type MeetingStatus = "idle" | "running" | "paused" | "ended";

export default function MeetingRoom({
    persona1,
    persona2,
    initialTopic,
    onClose,
    onMeetingSaved,
}: MeetingRoomProps) {
    const { user } = useAuth();
    const userId = user?.uid || "";
    const [messages, setMessages] = useState<MeetingMessage[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [currentTurn, setCurrentTurn] = useState(1); // 1 or 2 for which persona speaks next
    const [debateRounds, setDebateRounds] = useState(0);
    const [meetingStatus, setMeetingStatus] = useState<MeetingStatus>("idle");
    const [meetingId, setMeetingId] = useState<string | null>(null);
    const [projectContext, setProjectContext] = useState<ProjectContext | null>(null);
    const [thinkingPersona, setThinkingPersona] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showEndConfirm, setShowEndConfirm] = useState(false);
    const [selectedModel, setSelectedModel] = useState<AIModel>(DEFAULT_MODEL);
    const [showSummary, setShowSummary] = useState(false);
    const [summaryData, setSummaryData] = useState<{
        summary: string;
        decisions: Array<{ decision: string; context: string; status: "pending" | "taken" }>;
    } | null>(null);
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Derived states for compatibility
    const isPaused = meetingStatus === "paused";
    const meetingStarted = meetingStatus !== "idle";

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
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [input]);

    // Load project context on mount
    useEffect(() => {
        const loadContext = async () => {
            if (!userId) return;
            try {
                const project = await getActiveProject(userId);
                setProjectContext(project);
            } catch (error) {
                console.error("Error loading project context:", error);
            }
        };
        loadContext();
    }, [userId]);

    // Generate context string for prompts
    const getContextString = () => {
        if (!projectContext) return "";
        return generateContextPrompt(projectContext);
    };

    // Save meeting to Firestore
    const saveMeeting = useCallback(async (msgs: MeetingMessage[], rounds: number, id?: string) => {
        try {
            if (id) {
                await updateMeetingMessages(id, msgs, rounds);
                if (onMeetingSaved) {
                    onMeetingSaved();
                }
            }
        } catch (error) {
            console.error("Error saving meeting:", error);
        }
    }, [onMeetingSaved]);

    // Generate meeting summary
    const generateMeetingSummary = useCallback(async () => {
        if (messages.length === 0) return;

        setIsGeneratingSummary(true);
        try {
            const response = await fetch("/api/summary", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: messages.map(m => ({
                        speaker: m.speaker,
                        speakerIndex: m.speakerIndex,
                        content: m.content,
                        timestamp: m.timestamp,
                    })),
                    topic: initialTopic,
                    persona1Name: persona1.name,
                    persona2Name: persona2.name,
                    projectContext: getContextString(),
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("API Error:", response.status, errorText);
                throw new Error(`Failed to generate summary: ${response.status}`);
            }

            const data = await response.json();
            setSummaryData({
                summary: data.summary,
                decisions: data.decisions || [],
            });
            setShowSummary(true);
        } catch (error) {
            console.error("Error generating summary:", error);
            // Show a basic fallback summary
            const fallbackSummary = `# Resumo da Reunião

## Tema: ${initialTopic}

### Participantes
- ${persona1.name}
- ${persona2.name}

### Conversa
A reunião teve ${messages.length} mensagens trocadas.

---

*⚠️ Não foi possível gerar o resumo automático via IA. Tente novamente ou verifique sua conexão.*`;

            setSummaryData({
                summary: fallbackSummary,
                decisions: [],
            });
            setShowSummary(true);
        } finally {
            setIsGeneratingSummary(false);
        }
    }, [messages, initialTopic, persona1.name, persona2.name, getContextString]);

    // Handle end meeting with summary generation
    const handleEndMeeting = useCallback(async () => {
        setShowEndConfirm(false);
        setMeetingStatus("ended");
        // Show the summary modal immediately with loading state
        setShowSummary(true);
        await generateMeetingSummary();
    }, [generateMeetingSummary]);


    const getPersonaResponse = async (
        speakerIndex: number,
        userIntervention?: string
    ): Promise<string> => {
        const response = await fetch("/api/meeting", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                conversationHistory: messages.map((m) => ({
                    speaker: m.speaker,
                    content: m.content,
                    role: m.speakerIndex === 0 ? "user" : "assistant",
                })),
                persona1SystemPrompt: generateSystemPrompt(persona1),
                persona2SystemPrompt: generateSystemPrompt(persona2),
                persona1Name: persona1.name,
                persona2Name: persona2.name,
                currentSpeaker: speakerIndex,
                userIntervention,
                projectContext: getContextString(),
                model: selectedModel,
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to get response");
        }

        const data = await response.json();
        return data.content;
    };

    const startMeeting = async () => {
        if (!userId) return;
        setMeetingStatus("running");
        setIsLoading(true);
        setError(null);

        // Create meeting in Firestore
        let newMeetingId: string | null = null;
        try {
            newMeetingId = await createMeeting(userId, {
                title: `${persona1.name} vs ${persona2.name}: ${initialTopic.substring(0, 50)}`,
                persona1Name: persona1.name,
                persona2Name: persona2.name,
                topic: initialTopic,
                messages: [],
                rounds: 0,
            });
            setMeetingId(newMeetingId);
        } catch (error) {
            console.error("Error creating meeting:", error);
        }

        // Add initial topic as user message
        const topicMessage: MeetingMessage = {
            id: generateId(),
            speaker: "Você",
            speakerIndex: 0,
            content: initialTopic,
            timestamp: new Date(),
        };
        setMessages([topicMessage]);

        try {
            // Get persona1's response
            setThinkingPersona(persona1.name);
            const response1 = await getPersonaResponse(1);
            const message1: MeetingMessage = {
                id: generateId(),
                speaker: persona1.name,
                speakerIndex: 1,
                content: response1,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, message1]);
            setCurrentTurn(2);
            setDebateRounds(1);

            // Short delay before persona2 responds
            await new Promise((resolve) => setTimeout(resolve, 1500));

            // Get persona2's response
            setThinkingPersona(persona2.name);
            const updatedMessages = [...[topicMessage], message1];
            const response2 = await fetch("/api/meeting", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    conversationHistory: updatedMessages.map((m) => ({
                        speaker: m.speaker,
                        content: m.content,
                        role: m.speakerIndex === 0 ? "user" : "assistant",
                    })),
                    persona1SystemPrompt: generateSystemPrompt(persona1),
                    persona2SystemPrompt: generateSystemPrompt(persona2),
                    persona1Name: persona1.name,
                    persona2Name: persona2.name,
                    currentSpeaker: 2,
                    projectContext: getContextString(),
                    model: selectedModel,
                }),
            });

            if (!response2.ok) {
                throw new Error("Falha ao obter resposta da persona");
            }

            const data2 = await response2.json();
            const message2: MeetingMessage = {
                id: generateId(),
                speaker: persona2.name,
                speakerIndex: 2,
                content: data2.content,
                timestamp: new Date(),
            };
            const allMessages = [...updatedMessages, message2];
            setMessages(allMessages);
            setCurrentTurn(1);

            // Save to Firestore
            if (newMeetingId) {
                await saveMeeting(allMessages, 1, newMeetingId);
            }
        } catch (error) {
            console.error("Error starting meeting:", error);
            setError(error instanceof Error ? error.message : "Erro ao iniciar reunião");
        } finally {
            setIsLoading(false);
            setThinkingPersona(null);
        }
    };

    const continueDebate = async () => {
        if (isPaused || isLoading) return;
        setIsLoading(true);
        setError(null);

        try {
            // Get current messages directly for the API call
            let currentMessages = [...messages];

            // First persona responds
            const firstPersona = currentTurn === 1 ? persona1 : persona2;
            setThinkingPersona(firstPersona.name);

            const response1 = await fetch("/api/meeting", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    conversationHistory: currentMessages.map((m) => ({
                        speaker: m.speaker,
                        content: m.content,
                        role: m.speakerIndex === 0 ? "user" : "assistant",
                    })),
                    persona1SystemPrompt: generateSystemPrompt(persona1),
                    persona2SystemPrompt: generateSystemPrompt(persona2),
                    persona1Name: persona1.name,
                    persona2Name: persona2.name,
                    currentSpeaker: currentTurn,
                    projectContext: getContextString(),
                    model: selectedModel,
                }),
            });

            if (!response1.ok) {
                const errorData = await response1.json();
                throw new Error(errorData.details || "Failed to get response");
            }

            const data1 = await response1.json();
            const message1: MeetingMessage = {
                id: generateId(),
                speaker: currentTurn === 1 ? persona1.name : persona2.name,
                speakerIndex: currentTurn,
                content: data1.content,
                timestamp: new Date(),
            };

            // Add first message and update UI
            currentMessages = [...currentMessages, message1];
            setMessages(currentMessages);
            setCurrentTurn(currentTurn === 1 ? 2 : 1);

            // Short delay before second persona responds
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Second persona responds
            const nextTurn = currentTurn === 1 ? 2 : 1;
            const secondPersona = nextTurn === 1 ? persona1 : persona2;
            setThinkingPersona(secondPersona.name);

            const response2 = await fetch("/api/meeting", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    conversationHistory: currentMessages.map((m) => ({
                        speaker: m.speaker,
                        content: m.content,
                        role: m.speakerIndex === 0 ? "user" : "assistant",
                    })),
                    persona1SystemPrompt: generateSystemPrompt(persona1),
                    persona2SystemPrompt: generateSystemPrompt(persona2),
                    persona1Name: persona1.name,
                    persona2Name: persona2.name,
                    currentSpeaker: nextTurn,
                    projectContext: getContextString(),
                    model: selectedModel,
                }),
            });

            if (!response2.ok) {
                const errorData = await response2.json();
                throw new Error(errorData.details || "Failed to get response");
            }

            const data2 = await response2.json();
            const message2: MeetingMessage = {
                id: generateId(),
                speaker: nextTurn === 1 ? persona1.name : persona2.name,
                speakerIndex: nextTurn,
                content: data2.content,
                timestamp: new Date(),
            };

            const allMessages = [...currentMessages, message2];
            setMessages(allMessages);
            setCurrentTurn(currentTurn); // Reset to original turn for next round
            const newRounds = debateRounds + 1;
            setDebateRounds(newRounds);

            // Save to Firestore
            if (meetingId) {
                await saveMeeting(allMessages, newRounds, meetingId);
            }
        } catch (error) {
            console.error("Error continuing debate:", error);
            setError(error instanceof Error ? error.message : "Erro ao continuar debate");
        } finally {
            setIsLoading(false);
            setThinkingPersona(null);
        }
    };

    const handleIntervention = async (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        setIsLoading(true);

        // Add user intervention
        const userMessage: MeetingMessage = {
            id: generateId(),
            speaker: "Você",
            speakerIndex: 0,
            content: input.trim(),
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");

        try {
            // Get response from current turn persona considering the intervention
            const response = await fetch("/api/meeting", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    conversationHistory: [...messages, userMessage].map((m) => ({
                        speaker: m.speaker,
                        content: m.content,
                        role: m.speakerIndex === 0 ? "user" : "assistant",
                    })),
                    persona1SystemPrompt: generateSystemPrompt(persona1),
                    persona2SystemPrompt: generateSystemPrompt(persona2),
                    persona1Name: persona1.name,
                    persona2Name: persona2.name,
                    currentSpeaker: currentTurn,
                    userIntervention: input.trim(),
                }),
            });

            const data = await response.json();
            const message: MeetingMessage = {
                id: generateId(),
                speaker: currentTurn === 1 ? persona1.name : persona2.name,
                speakerIndex: currentTurn,
                content: data.content,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, message]);
            setCurrentTurn(currentTurn === 1 ? 2 : 1);
        } catch (error) {
            console.error("Error with intervention:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleIntervention(e);
        }
    };

    const getSpeakerColor = (speakerIndex: number) => {
        switch (speakerIndex) {
            case 0:
                return "from-[#6366f1] to-[#8b5cf6]"; // User - purple
            case 1:
                return "from-primary to-secondary"; // Persona 1 - default
            case 2:
                return "from-[#f97316] to-[#ef4444]"; // Persona 2 - orange/red
            default:
                return "from-muted to-muted";
        }
    };

    const getSpeakerBorder = (speakerIndex: number) => {
        switch (speakerIndex) {
            case 0:
                return "border-[#6366f1]/30";
            case 1:
                return "border-primary/30";
            case 2:
                return "border-[#f97316]/30";
            default:
                return "border-border";
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-background flex flex-col">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-background transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-lg font-semibold text-foreground">Sala de Reunião</h1>
                        <p className="text-xs text-muted-foreground">
                            {debateRounds} {debateRounds === 1 ? "turno" : "turnos"} de debate
                        </p>
                    </div>
                </div>

                {/* Personas indicators */}
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getSpeakerColor(1)} flex items-center justify-center`}>
                            <span className="text-white font-bold text-sm">{persona1.name.charAt(0)}</span>
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-medium text-foreground">{persona1.name}</p>
                            <p className="text-xs text-muted-foreground">
                                {currentTurn === 1 && isLoading && meetingStarted ? "Falando..." : (currentTurn === 1 && !isPaused && meetingStarted ? "Próximo" : "")}
                            </p>
                        </div>
                    </div>

                    <div className="text-muted text-sm">vs</div>

                    <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getSpeakerColor(2)} flex items-center justify-center`}>
                            <span className="text-white font-bold text-sm">{persona2.name.charAt(0)}</span>
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-medium text-foreground">{persona2.name}</p>
                            <p className="text-xs text-muted-foreground">
                                {currentTurn === 2 && isLoading && meetingStarted ? "Falando..." : (currentTurn === 2 && !isPaused && meetingStarted ? "Próximo" : "")}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2">
                    <ModelSelector
                        selectedModel={selectedModel}
                        onModelChange={setSelectedModel}
                        compact
                    />
                    {meetingStarted && meetingStatus !== "ended" && (
                        <>
                            <button
                                onClick={() => setMeetingStatus(isPaused ? "running" : "paused")}
                                className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${isPaused
                                    ? "bg-accent text-white"
                                    : "bg-background text-foreground border border-border"
                                    }`}
                            >
                                {isPaused ? "Retomar" : "Pausar"}
                            </button>
                            <button
                                onClick={continueDebate}
                                disabled={isLoading || isPaused}
                                className="px-4 py-2 text-sm font-medium bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-xl transition-colors flex items-center gap-2"
                            >
                                {isLoading ? (
                                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                        </svg>
                                        Próximo Turno
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => setShowEndConfirm(true)}
                                className="px-4 py-2 text-sm font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-xl transition-colors"
                            >
                                Encerrar
                            </button>
                        </>
                    )}
                </div>
            </header>

            {/* Messages Area */}
            <main className="flex-1 overflow-y-auto px-6 py-6">
                {!meetingStarted ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="flex items-center gap-4 mb-8">
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getSpeakerColor(1)} flex items-center justify-center`}>
                                <span className="text-white font-bold text-2xl">{persona1.name.charAt(0)}</span>
                            </div>
                            <div className="text-3xl text-muted">⚔️</div>
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getSpeakerColor(2)} flex items-center justify-center`}>
                                <span className="text-white font-bold text-2xl">{persona2.name.charAt(0)}</span>
                            </div>
                        </div>
                        <h2 className="text-2xl font-semibold text-foreground mb-2">
                            {persona1.name} vs {persona2.name}
                        </h2>
                        <p className="text-muted-foreground max-w-md mb-4">
                            Duas perspectivas diferentes vão debater sobre seu desafio.
                            Você pode intervir a qualquer momento.
                        </p>
                        <div className="bg-card border border-border rounded-xl p-4 max-w-lg mb-4">
                            <p className="text-sm text-muted-foreground mb-1">Tema inicial:</p>
                            <p className="text-foreground">{initialTopic}</p>
                        </div>

                        <button
                            onClick={startMeeting}
                            disabled={isLoading}
                            className="px-6 py-3 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    Iniciando...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Iniciar Reunião
                                </>
                            )}
                        </button>
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto space-y-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`animate-fade-in ${message.speakerIndex === 0 ? "flex justify-center" : ""
                                    }`}
                            >
                                <div
                                    className={`rounded-2xl px-5 py-4 border ${message.speakerIndex === 0
                                        ? "bg-primary/10 border-primary/20 max-w-2xl"
                                        : `bg-card ${getSpeakerBorder(message.speakerIndex)}`
                                        }`}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${getSpeakerColor(message.speakerIndex)} flex items-center justify-center`}>
                                            <span className="text-white font-bold text-xs">
                                                {message.speaker.charAt(0)}
                                            </span>
                                        </div>
                                        <span className="text-sm font-medium text-foreground">
                                            {message.speaker}
                                        </span>
                                        {message.speakerIndex === 0 && (
                                            <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full">
                                                Fundador
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                                        {message.content}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {thinkingPersona && (
                            <div className="animate-fade-in">
                                <div className={`rounded-2xl px-5 py-4 border bg-card ${thinkingPersona === persona1.name ? getSpeakerBorder(1) : getSpeakerBorder(2)
                                    }`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${thinkingPersona === persona1.name ? getSpeakerColor(1) : getSpeakerColor(2)
                                            } flex items-center justify-center`}>
                                            <span className="text-white font-bold text-xs">
                                                {thinkingPersona.charAt(0)}
                                            </span>
                                        </div>
                                        <span className="text-sm font-medium text-foreground">
                                            {thinkingPersona}
                                        </span>
                                        <span className="text-xs text-muted">está pensando...</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-muted animate-bounce" style={{ animationDelay: "0ms" }}></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-muted animate-bounce" style={{ animationDelay: "150ms" }}></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-muted animate-bounce" style={{ animationDelay: "300ms" }}></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Error Banner */}
                        {error && (
                            <div className="animate-fade-in bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-red-400">Erro na reunião</p>
                                    <p className="text-xs text-red-400/70">{error}</p>
                                </div>
                                <button
                                    onClick={() => setError(null)}
                                    className="text-red-400 hover:text-red-300"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </main>

            {/* Intervention Input */}
            {meetingStarted && (
                <footer className="px-6 py-4 border-t border-border bg-card">
                    <form onSubmit={handleIntervention} className="max-w-4xl mx-auto">
                        <div className="flex items-end gap-3 bg-background rounded-2xl border border-border p-3 focus-within:border-primary transition-colors duration-200">
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getSpeakerColor(0)} flex items-center justify-center flex-shrink-0`}>
                                <span className="text-white font-bold text-sm">V</span>
                            </div>
                            <textarea
                                ref={textareaRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Intervenha no debate... (ex: 'E se considerarmos também...' ou 'Discordo desse ponto porque...')"
                                rows={1}
                                className="flex-1 bg-transparent text-foreground placeholder-muted resize-none outline-none text-sm leading-relaxed max-h-[120px]"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="px-4 py-2 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium text-sm transition-all duration-200"
                            >
                                Intervir
                            </button>
                        </div>
                        <p className="text-center text-xs text-muted mt-2">
                            Sua intervenção será considerada pela próxima persona a falar
                        </p>
                    </form>
                </footer>
            )}

            {/* Meeting Ended State */}
            {meetingStatus === "ended" && (
                <footer className="px-6 py-4 border-t border-border bg-card">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-3">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-medium text-emerald-400">Reunião Encerrada</span>
                            </div>
                            <p className="text-sm text-emerald-400/70">
                                {debateRounds} {debateRounds === 1 ? "turno" : "turnos"} • {messages.length} mensagens
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl font-medium text-sm transition-colors"
                        >
                            Fechar Reunião
                        </button>
                    </div>
                </footer>
            )}

            {/* End Confirmation Modal */}
            {showEndConfirm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-card rounded-2xl border border-border max-w-md w-full p-6 shadow-2xl">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-foreground mb-2">
                                Encerrar Reunião?
                            </h3>
                            <p className="text-muted-foreground text-sm">
                                A reunião será finalizada e você não poderá mais interagir com as personas nesta sessão.
                            </p>
                        </div>

                        {/* Meeting Summary */}
                        <div className="bg-background rounded-xl p-4 mb-6">
                            <p className="text-xs text-muted mb-2">Resumo da reunião</p>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Turnos</p>
                                    <p className="font-medium text-foreground">{debateRounds}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Mensagens</p>
                                    <p className="font-medium text-foreground">{messages.length}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Personas</p>
                                    <p className="font-medium text-foreground">{persona1.name}, {persona2.name}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Duração</p>
                                    <p className="font-medium text-foreground">
                                        {messages.length > 0
                                            ? `${Math.round((new Date().getTime() - new Date(messages[0].timestamp).getTime()) / 60000)} min`
                                            : "0 min"
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowEndConfirm(false)}
                                disabled={isGeneratingSummary}
                                className="flex-1 px-4 py-2.5 bg-background hover:bg-border text-foreground border border-border rounded-xl font-medium text-sm transition-colors disabled:opacity-50"
                            >
                                Continuar Reunião
                            </button>
                            <button
                                onClick={handleEndMeeting}
                                disabled={isGeneratingSummary}
                                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isGeneratingSummary ? (
                                    <>
                                        <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                        Gerando Resumo...
                                    </>
                                ) : (
                                    "Encerrar e Gerar Resumo"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Meeting Summary Modal */}
            {showSummary && (
                <MeetingSummary
                    summary={summaryData?.summary}
                    decisions={summaryData?.decisions}
                    topic={initialTopic}
                    personas={[persona1.name, persona2.name]}
                    meetingId={meetingId || `temp-${Date.now()}`}
                    meetingTitle={initialTopic}
                    projectId={projectContext?.id}
                    messageCount={messages.length}
                    isLoading={isGeneratingSummary}
                    onClose={() => {
                        setShowSummary(false);
                        onClose();
                    }}
                    onDecisionsSaved={onMeetingSaved}
                />
            )}
        </div>
    );
}
