"use client";

import { useState, useEffect } from "react";
import {
    ProjectContext,
    ProjectContextInput,
    STAGE_LABELS,
    DEFAULT_PROJECT_CONTEXT,
} from "@/types/project";
import {
    getActiveProject,
    getProject,
    createProject,
    updateProject,
} from "@/lib/projects";
import { useAuth } from "@/contexts/AuthContext";

interface ProjectContextEditorProps {
    isOpen: boolean;
    onClose: () => void;
    onSave?: (project: ProjectContext) => void;
    projectId?: string; // Optional: edit specific project instead of active one
}

export default function ProjectContextEditor({
    isOpen,
    onClose,
    onSave,
    projectId: editProjectId,
}: ProjectContextEditorProps) {
    const { user } = useAuth();
    const userId = user?.uid || "";
    const [formData, setFormData] = useState<ProjectContextInput>(DEFAULT_PROJECT_CONTEXT);
    const [projectId, setProjectId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");

    // Load existing project on mount
    useEffect(() => {
        if (isOpen && userId) {
            loadProject();
        }
    }, [isOpen, userId]);

    const loadProject = async () => {
        if (!userId) return;
        setIsLoading(true);
        try {
            // If editing a specific project, load it. Otherwise load active project.
            const project = editProjectId
                ? await getProject(editProjectId)
                : await getActiveProject(userId);
            if (project) {
                setProjectId(project.id);
                setFormData({
                    name: project.name,
                    description: project.description,
                    problemSolved: project.problemSolved,
                    targetAudience: project.targetAudience,
                    differentials: project.differentials,
                    currentStage: project.currentStage,
                    keyMetrics: project.keyMetrics,
                    currentGoals: project.currentGoals,
                    additionalNotes: project.additionalNotes || "",
                });
            }
        } catch (error) {
            console.error("Error loading project:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (
        field: keyof ProjectContextInput,
        value: string
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setSaveStatus("idle");
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            alert("Por favor, dê um nome ao seu projeto");
            return;
        }

        if (!userId) return;

        setIsSaving(true);
        setSaveStatus("idle");

        try {
            let savedProject: ProjectContext;

            if (projectId) {
                await updateProject(projectId, formData);
                savedProject = {
                    id: projectId,
                    ...formData,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
            } else {
                const newId = await createProject(userId, formData);
                setProjectId(newId);
                savedProject = {
                    id: newId,
                    ...formData,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
            }

            setSaveStatus("saved");
            if (onSave) {
                onSave(savedProject);
            }

            setTimeout(() => setSaveStatus("idle"), 2000);
        } catch (error) {
            console.error("Error saving project:", error);
            setSaveStatus("error");
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-3xl max-h-[90vh] bg-card rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <div>
                        <h2 className="text-xl font-bold text-foreground">
                            Contexto do Projeto
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Defina o contexto que suas personas irão considerar
                        </p>
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

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <>
                            {/* Project Name */}
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Nome do Projeto *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleChange("name", e.target.value)}
                                    placeholder="Ex: Hold.ai, MeuSaaS, StartupX..."
                                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Descrição do Projeto
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => handleChange("description", e.target.value)}
                                    placeholder="Descreva seu projeto em 2-3 frases..."
                                    rows={3}
                                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                                />
                            </div>

                            {/* Problem Solved */}
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Problema que Resolve
                                </label>
                                <textarea
                                    value={formData.problemSolved}
                                    onChange={(e) => handleChange("problemSolved", e.target.value)}
                                    placeholder="Qual dor ou problema seu produto resolve?"
                                    rows={2}
                                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                                />
                            </div>

                            {/* Target Audience */}
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Público-Alvo
                                </label>
                                <textarea
                                    value={formData.targetAudience}
                                    onChange={(e) => handleChange("targetAudience", e.target.value)}
                                    placeholder="Quem são seus clientes ideais? Qual o perfil, cargo, empresa?"
                                    rows={2}
                                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                                />
                            </div>

                            {/* Differentials */}
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Diferenciais
                                </label>
                                <textarea
                                    value={formData.differentials}
                                    onChange={(e) => handleChange("differentials", e.target.value)}
                                    placeholder="O que te diferencia dos concorrentes? Qual é sua vantagem competitiva?"
                                    rows={2}
                                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                                />
                            </div>

                            {/* Current Stage */}
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Estágio Atual
                                </label>
                                <div className="grid grid-cols-5 gap-2">
                                    {(Object.keys(STAGE_LABELS) as ProjectContext["currentStage"][]).map(
                                        (stage) => (
                                            <button
                                                key={stage}
                                                onClick={() => handleChange("currentStage", stage)}
                                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${formData.currentStage === stage
                                                    ? "bg-primary text-white"
                                                    : "bg-background text-muted-foreground hover:bg-border"
                                                    }`}
                                            >
                                                {STAGE_LABELS[stage]}
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>

                            {/* Key Metrics */}
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Métricas-Chave
                                </label>
                                <textarea
                                    value={formData.keyMetrics}
                                    onChange={(e) => handleChange("keyMetrics", e.target.value)}
                                    placeholder="MRR, churn, CAC, LTV, usuários ativos, etc..."
                                    rows={2}
                                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                                />
                            </div>

                            {/* Current Goals */}
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Objetivos Atuais
                                </label>
                                <textarea
                                    value={formData.currentGoals}
                                    onChange={(e) => handleChange("currentGoals", e.target.value)}
                                    placeholder="O que você está tentando alcançar agora? Qual o foco das próximas semanas?"
                                    rows={2}
                                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                                />
                            </div>

                            {/* Additional Notes */}
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Notas Adicionais
                                </label>
                                <textarea
                                    value={formData.additionalNotes}
                                    onChange={(e) => handleChange("additionalNotes", e.target.value)}
                                    placeholder="Qualquer informação extra que as personas devem saber..."
                                    rows={3}
                                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-background">
                    <div className="text-sm">
                        {saveStatus === "saved" && (
                            <span className="text-green-500 flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Salvo!
                            </span>
                        )}
                        {saveStatus === "error" && (
                            <span className="text-red-500">Erro ao salvar</span>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-border transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-6 py-2 bg-primary hover:opacity-90 text-white rounded-lg font-medium transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSaving ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                    Salvando...
                                </>
                            ) : (
                                "Salvar Contexto"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
