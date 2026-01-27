"use client";

import { useState, useEffect } from "react";
import { Persona } from "@/types";
import { getPersonas } from "@/lib/personas";
import { MEETING_TEMPLATES, MeetingTemplate } from "@/types/templates";
import TemplatePicker from "./TemplatePicker";
import { useAuth } from "@/contexts/AuthContext";

interface MeetingSetupProps {
    onStart: (persona1: Persona, persona2: Persona, topic: string) => void;
    onClose: () => void;
}

export default function MeetingSetup({ onStart, onClose }: MeetingSetupProps) {
    const { user } = useAuth();
    const userId = user?.uid || "";
    const [personas, setPersonas] = useState<Persona[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPersona1, setSelectedPersona1] = useState<Persona | null>(null);
    const [selectedPersona2, setSelectedPersona2] = useState<Persona | null>(null);
    const [topic, setTopic] = useState("");
    const [showTemplatePicker, setShowTemplatePicker] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<MeetingTemplate | null>(null);

    useEffect(() => {
        if (userId) {
            loadPersonas();
        }
    }, [userId]);

    const loadPersonas = async () => {
        if (!userId) return;
        setIsLoading(true);
        try {
            const data = await getPersonas(userId);
            setPersonas(data);
            // Auto-select first two if available
            if (data.length >= 2) {
                setSelectedPersona1(data[0]);
                setSelectedPersona2(data[1]);
            } else if (data.length === 1) {
                setSelectedPersona1(data[0]);
            }
        } catch (error) {
            console.error("Error loading personas:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStart = () => {
        if (selectedPersona1 && selectedPersona2 && topic.trim()) {
            onStart(selectedPersona1, selectedPersona2, topic.trim());
        }
    };

    const handleSelectTemplate = (template: MeetingTemplate, customizedPrompt: string) => {
        setSelectedTemplate(template);
        setTopic(customizedPrompt);
        setShowTemplatePicker(false);
    };

    const topicSuggestions = [
        "Devo focar em crescimento ou rentabilidade nesta fase?",
        "Vale a pena pivotar o produto ou persistir no modelo atual?",
        "Devo buscar investimento ou crescer organicamente?",
        "Qual feature priorizar: a que os usuários pedem ou a que gera receita?",
    ];

    const getSpeakerColor = (index: number) => {
        return index === 1
            ? "from-[var(--primary)] to-[var(--secondary)]"
            : "from-[#f97316] to-[#ef4444]";
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className="relative bg-[var(--card)] border border-[var(--border)] rounded-2xl w-full max-w-2xl max-h-[90vh] mx-4 shadow-2xl animate-fade-in overflow-hidden flex flex-col"
                style={{ animationDuration: "0.2s" }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
                    <div>
                        <h2 className="text-xl font-semibold text-[var(--foreground)]">
                            Nova Reunião Estratégica
                        </h2>
                        <p className="text-sm text-[var(--muted-foreground)] mt-1">
                            Selecione duas personas para debater seu desafio
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)] transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 border-2 border-[var(--muted)] border-t-[var(--primary)] rounded-full animate-spin"></div>
                        </div>
                    ) : personas.length < 2 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 rounded-2xl bg-[var(--background)] flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <p className="text-[var(--foreground)] font-medium">Você precisa de pelo menos 2 personas</p>
                            <p className="text-sm text-[var(--muted-foreground)] mt-1">
                                Crie mais personas antes de iniciar uma reunião
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Persona Selection */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* Persona 1 */}
                                <div>
                                    <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                                        Primeira Persona
                                    </label>
                                    <div className="space-y-2">
                                        {personas.map((persona) => (
                                            <button
                                                key={persona.id}
                                                onClick={() => {
                                                    if (selectedPersona2?.id !== persona.id) {
                                                        setSelectedPersona1(persona);
                                                    }
                                                }}
                                                disabled={selectedPersona2?.id === persona.id}
                                                className={`w-full p-3 rounded-xl border transition-all duration-200 text-left ${selectedPersona1?.id === persona.id
                                                    ? "bg-[var(--primary)]/10 border-[var(--primary)]/30"
                                                    : selectedPersona2?.id === persona.id
                                                        ? "opacity-50 cursor-not-allowed border-[var(--border)]"
                                                        : "bg-[var(--background)] border-[var(--border)] hover:border-[var(--primary)]/30"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getSpeakerColor(1)} flex items-center justify-center`}>
                                                        <span className="text-white font-bold text-sm">
                                                            {persona.name.charAt(0)}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-[var(--foreground)]">{persona.name}</p>
                                                        <p className="text-xs text-[var(--muted-foreground)]">{persona.style}</p>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Persona 2 */}
                                <div>
                                    <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                                        Segunda Persona
                                    </label>
                                    <div className="space-y-2">
                                        {personas.map((persona) => (
                                            <button
                                                key={persona.id}
                                                onClick={() => {
                                                    if (selectedPersona1?.id !== persona.id) {
                                                        setSelectedPersona2(persona);
                                                    }
                                                }}
                                                disabled={selectedPersona1?.id === persona.id}
                                                className={`w-full p-3 rounded-xl border transition-all duration-200 text-left ${selectedPersona2?.id === persona.id
                                                    ? "bg-[#f97316]/10 border-[#f97316]/30"
                                                    : selectedPersona1?.id === persona.id
                                                        ? "opacity-50 cursor-not-allowed border-[var(--border)]"
                                                        : "bg-[var(--background)] border-[var(--border)] hover:border-[#f97316]/30"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getSpeakerColor(2)} flex items-center justify-center`}>
                                                        <span className="text-white font-bold text-sm">
                                                            {persona.name.charAt(0)}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-[var(--foreground)]">{persona.name}</p>
                                                        <p className="text-xs text-[var(--muted-foreground)]">{persona.style}</p>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            {/* Templates Section */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="block text-sm font-medium text-[var(--foreground)]">
                                        Templates Rápidos
                                    </label>
                                    <button
                                        onClick={() => setShowTemplatePicker(true)}
                                        className="text-xs text-[var(--primary)] hover:underline"
                                    >
                                        Ver todos →
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {MEETING_TEMPLATES.slice(0, 4).map(template => (
                                        <button
                                            key={template.id}
                                            onClick={() => {
                                                setSelectedTemplate(template);
                                                setTopic(template.promptTemplate);
                                            }}
                                            className={`p-3 rounded-xl border text-left transition-all ${selectedTemplate?.id === template.id
                                                ? "border-[var(--primary)] bg-[var(--primary)]/10"
                                                : "border-[var(--border)] hover:border-[var(--primary)]/30"
                                                }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">{template.icon}</span>
                                                <div>
                                                    <p className="text-sm font-medium text-[var(--foreground)]">
                                                        {template.name}
                                                    </p>
                                                    <p className="text-xs text-[var(--muted)]">
                                                        {template.estimatedDuration}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Topic Input */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-[var(--foreground)]">
                                        Tema do Debate
                                    </label>
                                    {selectedTemplate && (
                                        <span className="text-xs text-[var(--primary)] flex items-center gap-1">
                                            {selectedTemplate.icon} {selectedTemplate.name}
                                            <button
                                                onClick={() => setSelectedTemplate(null)}
                                                className="ml-1 text-[var(--muted)] hover:text-[var(--foreground)]"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    )}
                                </div>
                                <textarea
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="Descreva o desafio ou decisão que você quer debater..."
                                    rows={3}
                                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder-[var(--muted)] focus:border-[var(--primary)] focus:outline-none transition-colors resize-none"
                                />
                                {!selectedTemplate && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {topicSuggestions.map((suggestion, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setTopic(suggestion)}
                                                className="text-xs px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/30 hover:text-[var(--foreground)] transition-colors"
                                            >
                                                {suggestion}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {selectedTemplate && (
                                    <p className="text-xs text-[var(--muted)] mt-2">
                                        💡 Edite o texto acima para personalizar o template
                                    </p>
                                )}
                            </div>

                            {/* Preview */}
                            {selectedPersona1 && selectedPersona2 && (
                                <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl p-4">
                                    <p className="text-xs text-[var(--muted-foreground)] mb-3">Preview do confronto:</p>
                                    <div className="flex items-center justify-center gap-4">
                                        <div className="text-center">
                                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getSpeakerColor(1)} flex items-center justify-center mx-auto mb-2`}>
                                                <span className="text-white font-bold">{selectedPersona1.name.charAt(0)}</span>
                                            </div>
                                            <p className="text-sm font-medium text-[var(--foreground)]">{selectedPersona1.name}</p>
                                            <p className="text-xs text-[var(--muted-foreground)]">{selectedPersona1.style}</p>
                                        </div>
                                        <div className="text-2xl">⚔️</div>
                                        <div className="text-center">
                                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getSpeakerColor(2)} flex items-center justify-center mx-auto mb-2`}>
                                                <span className="text-white font-bold">{selectedPersona2.name.charAt(0)}</span>
                                            </div>
                                            <p className="text-sm font-medium text-[var(--foreground)]">{selectedPersona2.name}</p>
                                            <p className="text-xs text-[var(--muted-foreground)]">{selectedPersona2.style}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                {!isLoading && personas.length >= 2 && (
                    <div className="p-6 border-t border-[var(--border)]">
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-2.5 text-sm font-medium text-[var(--foreground)] bg-[var(--background)] hover:bg-[var(--border)] border border-[var(--border)] rounded-xl transition-colors duration-200"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleStart}
                                disabled={!selectedPersona1 || !selectedPersona2 || !topic.trim()}
                                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-50 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Iniciar Reunião
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Template Picker Modal */}
            {showTemplatePicker && (
                <TemplatePicker
                    onSelectTemplate={handleSelectTemplate}
                    onClose={() => setShowTemplatePicker(false)}
                />
            )}
        </div>
    );
}
