"use client";

import { useState, useEffect } from "react";
import { ProjectContext, DEFAULT_PROJECT_CONTEXT } from "@/types/project";
import { getProjects, createProject, deleteProject } from "@/lib/projects";
import ProjectContextEditor from "./ProjectContextEditor";
import { useAuth } from "@/contexts/AuthContext";

interface ProjectManagerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectProject: (project: ProjectContext | null) => void;
    currentProject: ProjectContext | null;
}

export default function ProjectManager({
    isOpen,
    onClose,
    onSelectProject,
    currentProject,
}: ProjectManagerProps) {
    const { user } = useAuth();
    const userId = user?.uid || "";
    const [projects, setProjects] = useState<ProjectContext[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
    const [showNewProjectForm, setShowNewProjectForm] = useState(false);
    const [newProjectName, setNewProjectName] = useState("");
    const [creatingProject, setCreatingProject] = useState(false);

    useEffect(() => {
        if (isOpen && userId) {
            loadProjects();
        }
    }, [isOpen, userId]);

    const loadProjects = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const data = await getProjects(userId);
            setProjects(data);
        } catch (error) {
            console.error("Error loading projects:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProject = async () => {
        if (!newProjectName.trim() || !userId) return;

        setCreatingProject(true);
        try {
            const input = {
                ...DEFAULT_PROJECT_CONTEXT,
                name: newProjectName.trim(),
            };
            await createProject(userId, input);
            setNewProjectName("");
            setShowNewProjectForm(false);
            await loadProjects();
        } catch (error) {
            console.error("Error creating project:", error);
        } finally {
            setCreatingProject(false);
        }
    };

    const handleDeleteProject = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este projeto? Isso não afetará suas reuniões ou decisões.")) {
            return;
        }

        try {
            await deleteProject(id);
            if (currentProject?.id === id) {
                onSelectProject(null);
            }
            await loadProjects();
        } catch (error) {
            console.error("Error deleting project:", error);
        }
    };

    const handleProjectUpdated = (project: ProjectContext) => {
        setEditingProjectId(null);
        // Update the current project if we edited the active one
        if (currentProject?.id === project.id) {
            onSelectProject(project);
        }
        loadProjects();
    };

    const getStageEmoji = (stage?: string) => {
        switch (stage) {
            case "idea": return "💡";
            case "validation": return "🔬";
            case "mvp": return "🚀";
            case "growth": return "📈";
            case "scale": return "🏢";
            default: return "📁";
        }
    };

    const getStageName = (stage?: string) => {
        switch (stage) {
            case "idea": return "Ideia";
            case "validation": return "Validação";
            case "mvp": return "MVP";
            case "growth": return "Crescimento";
            case "scale": return "Escala";
            default: return "Não definido";
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-[var(--card)] rounded-2xl shadow-2xl border border-[var(--border)] max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-[var(--foreground)]">
                                {editingProjectId ? "Editar Projeto" : "Gerenciar Projetos"}
                            </h2>
                            <p className="text-sm text-[var(--muted-foreground)]">
                                {editingProjectId
                                    ? "Configure o contexto do seu projeto"
                                    : `${projects.length} projeto${projects.length !== 1 ? "s" : ""} cadastrado${projects.length !== 1 ? "s" : ""}`
                                }
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={editingProjectId ? () => setEditingProjectId(null) : onClose}
                        className="p-2 hover:bg-[var(--border)] rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5 text-[var(--muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {editingProjectId ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {editingProjectId ? (
                        <>
                            <ProjectContextEditor
                                isOpen={true}
                                onClose={() => setEditingProjectId(null)}
                                onSave={handleProjectUpdated}
                                projectId={editingProjectId}
                            />
                        </>
                    ) : (
                        <div className="p-6 space-y-4">
                            {/* Create New Project */}
                            {showNewProjectForm ? (
                                <div className="p-4 bg-[var(--primary)]/10 border border-[var(--primary)]/30 rounded-xl">
                                    <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                                        Nome do novo projeto
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newProjectName}
                                            onChange={(e) => setNewProjectName(e.target.value)}
                                            placeholder="Ex: Meu App SaaS"
                                            className="flex-1 px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                                            autoFocus
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") handleCreateProject();
                                                if (e.key === "Escape") setShowNewProjectForm(false);
                                            }}
                                        />
                                        <button
                                            onClick={handleCreateProject}
                                            disabled={!newProjectName.trim() || creatingProject}
                                            className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
                                        >
                                            {creatingProject ? "Criando..." : "Criar"}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowNewProjectForm(false);
                                                setNewProjectName("");
                                            }}
                                            className="px-4 py-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowNewProjectForm(true)}
                                    className="w-full p-4 border-2 border-dashed border-[var(--border)] hover:border-[var(--primary)] rounded-xl flex items-center justify-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-all"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Criar novo projeto
                                </button>
                            )}

                            {/* Projects List */}
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="w-8 h-8 border-2 border-[var(--primary)]/30 border-t-[var(--primary)] rounded-full animate-spin" />
                                </div>
                            ) : projects.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 rounded-2xl bg-[var(--background)] flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                    </div>
                                    <p className="text-[var(--foreground)] font-medium">Nenhum projeto ainda</p>
                                    <p className="text-sm text-[var(--muted-foreground)] mt-1">
                                        Crie seu primeiro projeto para dar contexto às suas reuniões
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {projects.map((project) => (
                                        <div
                                            key={project.id}
                                            className={`p-4 rounded-xl border transition-all ${currentProject?.id === project.id
                                                ? "bg-[var(--primary)]/10 border-[var(--primary)]/30"
                                                : "bg-[var(--background)] border-[var(--border)] hover:border-[var(--primary)]/30"
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-xl">{getStageEmoji(project.currentStage)}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-medium text-[var(--foreground)]">
                                                            {project.name}
                                                        </h3>
                                                        {currentProject?.id === project.id && (
                                                            <span className="px-2 py-0.5 text-xs rounded-full bg-[var(--primary)] text-white">
                                                                Ativo
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-[var(--muted-foreground)] truncate mt-0.5">
                                                        {project.description || "Sem descrição"}
                                                    </p>
                                                    <div className="flex items-center gap-4 mt-2 text-xs text-[var(--muted)]">
                                                        <span>{getStageName(project.currentStage)}</span>
                                                        <span>•</span>
                                                        <span>Criado em {new Date(project.createdAt).toLocaleDateString("pt-BR")}</span>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-1">
                                                    {currentProject?.id !== project.id && (
                                                        <button
                                                            onClick={() => {
                                                                onSelectProject(project);
                                                            }}
                                                            className="p-2 text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-lg transition-colors"
                                                            title="Definir como ativo"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => setEditingProjectId(project.id)}
                                                        className="p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--border)] rounded-lg transition-colors"
                                                        title="Editar"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProject(project.id)}
                                                        className="p-2 text-[var(--muted)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                        title="Excluir"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {!editingProjectId && (
                    <div className="px-6 py-4 border-t border-[var(--border)] bg-[var(--background)]">
                        <p className="text-xs text-[var(--muted)] text-center">
                            💡 O contexto do projeto é injetado em todas as conversas e reuniões
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
