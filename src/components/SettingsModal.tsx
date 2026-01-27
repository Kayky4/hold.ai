"use client";

import { useState, useEffect } from "react";
import { ProjectContext } from "@/types/project";
import { getActiveProject } from "@/lib/projects";
import ProjectContextEditor from "./ProjectContextEditor";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const [activeTab, setActiveTab] = useState<"context" | "preferences">("context");
    const [projectContext, setProjectContext] = useState<ProjectContext | null>(null);
    const [showContextEditor, setShowContextEditor] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadProjectContext();
        }
    }, [isOpen]);

    const loadProjectContext = async () => {
        try {
            const project = await getActiveProject();
            setProjectContext(project);
        } catch (error) {
            console.error("Error loading project context:", error);
        }
    };

    const handleContextSaved = (project: ProjectContext) => {
        setProjectContext(project);
        setShowContextEditor(false);
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Modal */}
                <div className="relative bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
                        <div>
                            <h2 className="text-lg font-semibold text-[var(--foreground)]">
                                Configurações
                            </h2>
                            <p className="text-sm text-[var(--muted-foreground)]">
                                Gerencie seu projeto e preferências
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

                    {/* Tabs */}
                    <div className="flex border-b border-[var(--border)]">
                        <button
                            onClick={() => setActiveTab("context")}
                            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${activeTab === "context"
                                    ? "text-[var(--primary)]"
                                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                                }`}
                        >
                            Contexto do Projeto
                            {activeTab === "context" && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--primary)]" />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab("preferences")}
                            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${activeTab === "preferences"
                                    ? "text-[var(--primary)]"
                                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                                }`}
                        >
                            Preferências
                            {activeTab === "preferences" && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--primary)]" />
                            )}
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {activeTab === "context" && (
                            <div className="space-y-6">
                                {/* Context Overview */}
                                <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl p-5">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                                                {projectContext ? (
                                                    <span className="text-white font-bold text-lg">
                                                        {projectContext.name.charAt(0).toUpperCase()}
                                                    </span>
                                                ) : (
                                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-base font-semibold text-[var(--foreground)]">
                                                    {projectContext?.name || "Nenhum projeto definido"}
                                                </h3>
                                                <p className="text-sm text-[var(--muted-foreground)]">
                                                    {projectContext ? "Suas personas usarão este contexto" : "Configure para respostas personalizadas"}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setShowContextEditor(true)}
                                            className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-medium rounded-lg transition-colors"
                                        >
                                            {projectContext ? "Editar" : "Configurar"}
                                        </button>
                                    </div>

                                    {projectContext ? (
                                        <div className="space-y-3">
                                            {projectContext.description && (
                                                <div>
                                                    <p className="text-xs text-[var(--muted)] uppercase tracking-wide mb-1">Descrição</p>
                                                    <p className="text-sm text-[var(--foreground)] line-clamp-2">{projectContext.description}</p>
                                                </div>
                                            )}
                                            {projectContext.problemSolved && (
                                                <div>
                                                    <p className="text-xs text-[var(--muted)] uppercase tracking-wide mb-1">Problema</p>
                                                    <p className="text-sm text-[var(--foreground)] line-clamp-2">{projectContext.problemSolved}</p>
                                                </div>
                                            )}
                                            {projectContext.targetAudience && (
                                                <div>
                                                    <p className="text-xs text-[var(--muted)] uppercase tracking-wide mb-1">Público-Alvo</p>
                                                    <p className="text-sm text-[var(--foreground)] line-clamp-2">{projectContext.targetAudience}</p>
                                                </div>
                                            )}
                                            {projectContext.currentGoals && (
                                                <div>
                                                    <p className="text-xs text-[var(--muted)] uppercase tracking-wide mb-1">Objetivos</p>
                                                    <p className="text-sm text-[var(--foreground)] line-clamp-2">{projectContext.currentGoals}</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-4">
                                            <p className="text-sm text-[var(--muted-foreground)]">
                                                Defina o contexto do seu projeto para que as personas possam dar conselhos mais relevantes e personalizados.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Info box */}
                                <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4">
                                    <div className="flex gap-3">
                                        <svg className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div>
                                            <p className="text-sm font-medium text-violet-300">Como funciona?</p>
                                            <p className="text-sm text-violet-300/80 mt-1">
                                                O contexto do projeto é injetado em todas as conversas e reuniões. As personas usam essas informações para dar conselhos mais específicos e relevantes para sua situação.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "preferences" && (
                            <div className="space-y-6">
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 rounded-xl bg-[var(--background)] flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                                        Em breve
                                    </h3>
                                    <p className="text-sm text-[var(--muted-foreground)] max-w-sm mx-auto">
                                        Configurações de preferências como tema, idioma e notificações estarão disponíveis em versões futuras.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Context Editor Modal */}
            <ProjectContextEditor
                isOpen={showContextEditor}
                onClose={() => setShowContextEditor(false)}
                onSave={handleContextSaved}
            />
        </>
    );
}
