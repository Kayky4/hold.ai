/**
 * 📁 ProjectList Component
 * 
 * Lista de projetos com CRUD + Context Modal.
 * Usando Tailwind CSS (padrão do projeto).
 * 
 * @see ui-ux-pro-max skill — Visual indicators, cursor-pointer
 */

"use client";

import { useState } from "react";
import { Project, ProjectStatus, hasProjectContext } from "@/types/crm";
import { ProjectContextModal } from "./ProjectContextModal";

interface ProjectListProps {
    projects: Project[];
    selectedProjectId: string | null;
    onSelect: (projectId: string | null) => void;
    onCreate: (name: string, description?: string) => Promise<Project>;
    onUpdate: (projectId: string, updates: Partial<Project>) => Promise<void>;
    onDelete: (projectId: string) => Promise<void>;
}

export function ProjectList({
    projects,
    selectedProjectId,
    onSelect,
    onCreate,
    onUpdate,
    onDelete
}: ProjectListProps) {
    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState("");
    const [showArchived, setShowArchived] = useState(false);
    const [contextProject, setContextProject] = useState<Project | null>(null);

    const activeProjects = projects.filter(p => p.status === "active");
    const archivedProjects = projects.filter(p => p.status === "archived");

    const handleCreate = async () => {
        if (!newName.trim()) return;
        await onCreate(newName.trim());
        setNewName("");
        setIsCreating(false);
    };

    return (
        <>
            <div className="py-2">
                {/* Header */}
                <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            Projetos
                        </span>
                        <span className="text-xs text-muted bg-background px-2 py-0.5 rounded-full">
                            {activeProjects.length}
                        </span>
                    </div>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="text-lg hover:bg-background p-1 rounded transition-colors cursor-pointer"
                        title="Novo Projeto"
                    >
                        +
                    </button>
                </div>

                {/* Create Form */}
                {isCreating && (
                    <div className="mb-3 p-3 bg-background rounded-lg border border-border">
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Nome do projeto..."
                            autoFocus
                            className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 mb-2"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleCreate();
                                if (e.key === "Escape") setIsCreating(false);
                            }}
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={handleCreate}
                                disabled={!newName.trim()}
                                className="flex-1 px-3 py-1.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                            >
                                Criar
                            </button>
                            <button
                                onClick={() => setIsCreating(false)}
                                className="px-3 py-1.5 border border-border rounded-lg text-xs text-muted-foreground hover:bg-card transition-colors cursor-pointer"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}

                {/* All Projects Option */}
                <button
                    onClick={() => onSelect(null)}
                    className={`
                        w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors mb-1 cursor-pointer
                        ${selectedProjectId === null
                            ? "bg-primary/10 text-primary font-medium"
                            : "hover:bg-background text-foreground"
                        }
                    `}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span>Todos os Projetos</span>
                </button>

                {/* Project List */}
                <div className="space-y-0.5">
                    {activeProjects.map((project) => (
                        <ProjectItem
                            key={project.id}
                            project={project}
                            isSelected={selectedProjectId === project.id}
                            onSelect={() => onSelect(project.id)}
                            onUpdate={onUpdate}
                            onDelete={onDelete}
                            onEditContext={() => setContextProject(project)}
                        />
                    ))}
                </div>

                {/* Empty State */}
                {activeProjects.length === 0 && !isCreating && (
                    <div className="text-center py-6 text-sm text-muted-foreground">
                        <p>Nenhum projeto ainda</p>
                        <button
                            onClick={() => setIsCreating(true)}
                            className="text-primary hover:underline text-xs mt-1 cursor-pointer"
                        >
                            Criar primeiro projeto
                        </button>
                    </div>
                )}

                {/* Archived Projects */}
                {archivedProjects.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border">
                        <button
                            onClick={() => setShowArchived(!showArchived)}
                            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full cursor-pointer"
                        >
                            <span className={`transition-transform ${showArchived ? "rotate-90" : ""}`}>▶</span>
                            <span>Arquivados ({archivedProjects.length})</span>
                        </button>

                        {showArchived && (
                            <div className="mt-2 space-y-0.5 opacity-60">
                                {archivedProjects.map((project) => (
                                    <ProjectItem
                                        key={project.id}
                                        project={project}
                                        isSelected={selectedProjectId === project.id}
                                        onSelect={() => onSelect(project.id)}
                                        onUpdate={onUpdate}
                                        onDelete={onDelete}
                                        onEditContext={() => setContextProject(project)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Context Modal */}
            <ProjectContextModal
                isOpen={!!contextProject}
                project={contextProject}
                onClose={() => setContextProject(null)}
                onSave={onUpdate}
            />
        </>
    );
}

// ============================================
// PROJECT ITEM
// ============================================

interface ProjectItemProps {
    project: Project;
    isSelected: boolean;
    onSelect: () => void;
    onUpdate: (projectId: string, updates: Partial<Project>) => Promise<void>;
    onDelete: (projectId: string) => Promise<void>;
    onEditContext: () => void;
}

function ProjectItem({ project, isSelected, onSelect, onUpdate, onDelete, onEditContext }: ProjectItemProps) {
    const [showMenu, setShowMenu] = useState(false);
    const hasContext = hasProjectContext(project);

    const handleArchive = async () => {
        await onUpdate(project.id, {
            status: project.status === "active" ? "archived" : "active"
        });
        setShowMenu(false);
    };

    const handleDelete = async () => {
        if (confirm(`Excluir projeto "${project.name}"?`)) {
            await onDelete(project.id);
        }
        setShowMenu(false);
    };

    return (
        <div className="relative group">
            <button
                onClick={onSelect}
                className={`
                    w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer
                    ${isSelected
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-background text-foreground"
                    }
                `}
            >
                <div className="flex items-center gap-2 min-w-0">
                    <svg className="w-4 h-4 text-amber-500/70 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    <span className="truncate">{project.name}</span>
                    {/* Context Indicator */}
                    {hasContext && (
                        <span
                            className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0"
                            title="Contexto configurado"
                        />
                    )}
                </div>
                <div className="flex items-center gap-1">
                    {(project.decisionCount ?? 0) > 0 && (
                        <span className="text-xs text-muted bg-background px-1.5 py-0.5 rounded">
                            {project.decisionCount}
                        </span>
                    )}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(!showMenu);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-card rounded transition-all cursor-pointer"
                    >
                        <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                    </button>
                </div>
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-20 min-w-[140px]">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowMenu(false);
                                onEditContext();
                            }}
                            className="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-background transition-colors flex items-center gap-2 cursor-pointer"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Editar Contexto
                            {!hasContext && (
                                <span className="ml-auto text-xs text-amber-500">!</span>
                            )}
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleArchive();
                            }}
                            className="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-background transition-colors flex items-center gap-2 cursor-pointer"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                            </svg>
                            {project.status === "active" ? "Arquivar" : "Desarquivar"}
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete();
                            }}
                            className="w-full px-3 py-2 text-left text-sm text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-2 cursor-pointer"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Excluir
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
