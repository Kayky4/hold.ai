"use client";

import { useState, useEffect, useRef } from "react";
import { ProjectContext } from "@/types/project";
import { getProjects } from "@/lib/projects";
import { useAuth } from "@/contexts/AuthContext";

interface ProjectSwitcherProps {
    currentProject: ProjectContext | null;
    onSelectProject: (project: ProjectContext | null) => void;
    onManageProjects: () => void;
}

export default function ProjectSwitcher({
    currentProject,
    onSelectProject,
    onManageProjects,
}: ProjectSwitcherProps) {
    const { user } = useAuth();
    const userId = user?.uid || "";
    const [isOpen, setIsOpen] = useState(false);
    const [projects, setProjects] = useState<ProjectContext[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (userId) {
            loadProjects();
        }
    }, [userId]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const loadProjects = async () => {
        if (!userId) return;
        setIsLoading(true);
        try {
            const data = await getProjects(userId);
            setProjects(data);
        } catch (error) {
            console.error("Error loading projects:", error);
        } finally {
            setIsLoading(false);
        }
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

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-card border border-border hover:border-primary/30 transition-all"
            >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                    <span className="text-sm">
                        {currentProject ? getStageEmoji(currentProject.currentStage) : "📁"}
                    </span>
                </div>
                <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                        {currentProject?.name || "Selecionar Projeto"}
                    </p>
                    <p className="text-xs text-muted truncate">
                        {currentProject?.description || "Nenhum projeto ativo"}
                    </p>
                </div>
                <svg
                    className={`w-4 h-4 text-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card rounded-xl border border-border shadow-xl z-50 overflow-hidden">
                    {/* Header */}
                    <div className="px-3 py-2 border-b border-border">
                        <p className="text-xs font-medium text-muted-foreground">
                            Seus Projetos
                        </p>
                    </div>

                    {/* Projects List */}
                    <div className="max-h-64 overflow-y-auto">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-6">
                                <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                            </div>
                        ) : projects.length === 0 ? (
                            <div className="py-6 text-center">
                                <p className="text-sm text-muted-foreground">
                                    Nenhum projeto encontrado
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Option to deselect */}
                                <button
                                    onClick={() => {
                                        onSelectProject(null);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-background transition-colors text-left ${!currentProject ? "bg-primary/10" : ""
                                        }`}
                                >
                                    <div className="w-7 h-7 rounded-lg bg-background border border-border flex items-center justify-center">
                                        <span className="text-xs">🌐</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground">
                                            Sem projeto
                                        </p>
                                        <p className="text-xs text-muted">
                                            Conversas gerais
                                        </p>
                                    </div>
                                    {!currentProject && (
                                        <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </button>

                                {/* Projects */}
                                {projects.map((project) => (
                                    <button
                                        key={project.id}
                                        onClick={() => {
                                            onSelectProject(project);
                                            setIsOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-background transition-colors text-left ${currentProject?.id === project.id ? "bg-primary/10" : ""
                                            }`}
                                    >
                                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
                                            <span className="text-sm">{getStageEmoji(project.currentStage)}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground truncate">
                                                {project.name}
                                            </p>
                                            <p className="text-xs text-muted truncate">
                                                {project.description || "Sem descrição"}
                                            </p>
                                        </div>
                                        {currentProject?.id === project.id && (
                                            <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </button>
                                ))}
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-3 py-2 border-t border-border">
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                onManageProjects();
                            }}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Gerenciar Projetos
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
