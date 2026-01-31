/**
 * 📝 Project Context Modal
 * 
 * Modal para edição do contexto detalhado do projeto.
 * Campos: context, goals, constraints, stakeholders.
 * 
 * @see design_system.md — Industrial Minimal / Strategic Severity
 * @see ui-ux-pro-max skill — Touch targets, form labels, accessibility
 */

"use client";

import { useState, useEffect } from "react";
import { Project } from "@/types/crm";

interface ProjectContextModalProps {
    isOpen: boolean;
    project: Project | null;
    onClose: () => void;
    onSave: (projectId: string, updates: Partial<Project>) => Promise<void>;
}

interface FormData {
    context: string;
    goals: string;
    constraints: string;
    stakeholders: string;
}

const PLACEHOLDERS = {
    context: `Ex: SaaS B2B para gestão de estoque em restaurantes. Estamos em fase de validação com 5 clientes piloto. O diferencial é a integração automática com fornecedores.`,
    goals: `Ex: 
• Alcançar 50 clientes pagantes em 6 meses
• Validar PMF antes de buscar investimento
• Reduzir churn para menos de 5%`,
    constraints: `Ex:
• Budget limitado a R$10k/mês
• Time de 2 pessoas (eu e um dev)
• Não podemos usar features que exijam hardware`,
    stakeholders: `Ex:
• Eu (CEO/Founder) — decisões estratégicas
• Dev (CTO) — arquitetura e priorização técnica
• Mentor — review mensal de métricas`,
};

export function ProjectContextModal({
    isOpen,
    project,
    onClose,
    onSave,
}: ProjectContextModalProps) {
    const [formData, setFormData] = useState<FormData>({
        context: "",
        goals: "",
        constraints: "",
        stakeholders: "",
    });
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<keyof FormData>("context");

    // Load project data when opening
    useEffect(() => {
        if (isOpen && project) {
            setFormData({
                context: project.context || "",
                goals: project.goals || "",
                constraints: project.constraints || "",
                stakeholders: project.stakeholders || "",
            });
            setActiveTab("context");
        }
    }, [isOpen, project]);

    const handleSave = async () => {
        if (!project) return;

        setIsSaving(true);
        try {
            await onSave(project.id, {
                context: formData.context.trim() || undefined,
                goals: formData.goals.trim() || undefined,
                constraints: formData.constraints.trim() || undefined,
                stakeholders: formData.stakeholders.trim() || undefined,
            });
            onClose();
        } catch (error) {
            console.error("[ProjectContext] Save error:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const hasChanges = project && (
        formData.context !== (project.context || "") ||
        formData.goals !== (project.goals || "") ||
        formData.constraints !== (project.constraints || "") ||
        formData.stakeholders !== (project.stakeholders || "")
    );

    const filledFieldsCount = [
        formData.context,
        formData.goals,
        formData.constraints,
        formData.stakeholders,
    ].filter(Boolean).length;

    if (!isOpen || !project) return null;

    const tabs: { key: keyof FormData; label: string; icon: string }[] = [
        { key: "context", label: "Contexto", icon: "📋" },
        { key: "goals", label: "Objetivos", icon: "🎯" },
        { key: "constraints", label: "Restrições", icon: "⚠️" },
        { key: "stakeholders", label: "Stakeholders", icon: "👥" },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scaleIn">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                            <span className="text-xl">📁</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">
                                {project.name}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Contexto do projeto • {filledFieldsCount}/4 campos preenchidos
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-background transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-border bg-background/50">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${activeTab === tab.key
                                    ? "text-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            <span className="flex items-center justify-center gap-2">
                                <span>{tab.icon}</span>
                                <span className="hidden sm:inline">{tab.label}</span>
                                {formData[tab.key] && (
                                    <span className="w-2 h-2 bg-primary rounded-full" />
                                )}
                            </span>
                            {activeTab === tab.key && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="space-y-4">
                        {/* Dynamic Tab Content */}
                        {tabs.map((tab) => (
                            <div
                                key={tab.key}
                                className={activeTab === tab.key ? "block" : "hidden"}
                            >
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    {tab.icon} {tab.label}
                                </label>
                                <textarea
                                    value={formData[tab.key]}
                                    onChange={(e) =>
                                        setFormData({ ...formData, [tab.key]: e.target.value })
                                    }
                                    placeholder={PLACEHOLDERS[tab.key]}
                                    rows={8}
                                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none text-sm leading-relaxed"
                                />
                                <p className="text-xs text-muted-foreground mt-2">
                                    {tab.key === "context" &&
                                        "Descreva o projeto, fase atual, modelo de negócio e diferenciais."}
                                    {tab.key === "goals" &&
                                        "Liste os objetivos principais e métricas de sucesso."}
                                    {tab.key === "constraints" &&
                                        "Indique limitações de budget, time, tecnologia ou tempo."}
                                    {tab.key === "stakeholders" &&
                                        "Quem são as pessoas envolvidas e seus papéis nas decisões."}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Info Box */}
                    <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                        <div className="flex items-start gap-3">
                            <span className="text-lg">💡</span>
                            <div>
                                <p className="text-sm font-medium text-foreground">
                                    Por que preencher o contexto?
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Estas informações são usadas para personalizar as sessões HOLD.
                                    Os advisors virtuais considerarão seu contexto específico ao
                                    desafiar suas ideias e sugerir alternativas.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-background">
                    <button
                        onClick={onClose}
                        className="px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!hasChanges || isSaving}
                        className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSaving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Salvando...
                            </>
                        ) : (
                            "Salvar Contexto"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
