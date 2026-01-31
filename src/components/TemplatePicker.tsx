"use client";

import { useState } from "react";
import { MEETING_TEMPLATES, MeetingTemplate } from "@/types/templates";

interface TemplatePickerProps {
    onSelectTemplate: (template: MeetingTemplate, customizedPrompt: string) => void;
    onClose: () => void;
}

export default function TemplatePicker({ onSelectTemplate, onClose }: TemplatePickerProps) {
    const [selectedTemplate, setSelectedTemplate] = useState<MeetingTemplate | null>(null);
    const [customizedPrompt, setCustomizedPrompt] = useState("");
    const [activeCategory, setActiveCategory] = useState<string>("all");

    const categories = [
        { id: "all", label: "Todos", icon: "📋" },
        { id: "validation", label: "Validação", icon: "💡" },
        { id: "strategy", label: "Estratégia", icon: "🎯" },
        { id: "growth", label: "Crescimento", icon: "🚀" },
        { id: "operations", label: "Operações", icon: "⚙️" },
    ];

    const filteredTemplates = activeCategory === "all"
        ? MEETING_TEMPLATES
        : MEETING_TEMPLATES.filter(t => t.category === activeCategory);

    const handleSelectTemplate = (template: MeetingTemplate) => {
        setSelectedTemplate(template);
        setCustomizedPrompt(template.promptTemplate);
    };

    const handleConfirm = () => {
        if (selectedTemplate) {
            onSelectTemplate(selectedTemplate, customizedPrompt);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-card rounded-2xl shadow-2xl border border-border max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                            <span className="text-xl">📋</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">
                                Templates de Reunião
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Escolha um modelo para iniciar sua discussão
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-border rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Category Tabs */}
                <div className="px-6 py-3 border-b border-border flex gap-2 overflow-x-auto">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeCategory === cat.id
                                    ? "bg-primary text-white"
                                    : "bg-background text-muted-foreground hover:bg-border"
                                }`}
                        >
                            {cat.icon} {cat.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {!selectedTemplate ? (
                        /* Template Grid */
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredTemplates.map(template => (
                                <button
                                    key={template.id}
                                    onClick={() => handleSelectTemplate(template)}
                                    className="p-4 rounded-xl border border-border hover:border-primary hover:bg-primary/5 text-left transition-all group"
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl">{template.icon}</span>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-foreground group-hover:text-primary">
                                                {template.name}
                                            </h3>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {template.description}
                                            </p>
                                            <div className="flex items-center gap-3 mt-3 text-xs text-muted">
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    {template.estimatedDuration}
                                                </span>
                                            </div>
                                        </div>
                                        <svg className="w-5 h-5 text-muted group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        /* Template Customization */
                        <div className="space-y-6">
                            {/* Selected Template Header */}
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/10 border border-primary/30">
                                <span className="text-3xl">{selectedTemplate.icon}</span>
                                <div>
                                    <h3 className="font-semibold text-foreground">
                                        {selectedTemplate.name}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedTemplate.description}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedTemplate(null)}
                                    className="ml-auto text-sm text-primary hover:underline"
                                >
                                    Trocar
                                </button>
                            </div>

                            {/* Prompt Editor */}
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Personalize seu tema
                                </label>
                                <textarea
                                    value={customizedPrompt}
                                    onChange={(e) => setCustomizedPrompt(e.target.value)}
                                    className="w-full h-32 px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                    placeholder="Descreva o contexto específico da sua discussão..."
                                />
                                <p className="text-xs text-muted mt-2">
                                    💡 Substitua os textos entre [COLCHETES] com suas informações
                                </p>
                            </div>

                            {/* Follow-up Questions */}
                            <div>
                                <h4 className="text-sm font-medium text-foreground mb-3">
                                    Perguntas para considerar
                                </h4>
                                <div className="space-y-2">
                                    {selectedTemplate.followUpQuestions.map((question, i) => (
                                        <div
                                            key={i}
                                            className="flex items-start gap-2 text-sm text-muted-foreground"
                                        >
                                            <span className="text-primary">•</span>
                                            {question}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-background">
                    <p className="text-xs text-muted">
                        {selectedTemplate
                            ? `⏱️ Duração estimada: ${selectedTemplate.estimatedDuration}`
                            : `${filteredTemplates.length} templates disponíveis`
                        }
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Cancelar
                        </button>
                        {selectedTemplate && (
                            <button
                                onClick={handleConfirm}
                                disabled={!customizedPrompt.trim()}
                                className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Usar Template
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
