"use client";

import { ProjectContext, STAGE_LABELS } from "@/types/project";

interface ProjectContextCardProps {
    project: ProjectContext | null;
    onEdit: () => void;
    compact?: boolean;
}

export default function ProjectContextCard({
    project,
    onEdit,
    compact = false,
}: ProjectContextCardProps) {
    if (!project) {
        return (
            <div
                onClick={onEdit}
                className="p-4 border border-dashed border-[var(--border)] rounded-xl bg-[var(--background)] hover:border-[var(--primary)] hover:bg-[var(--card)] cursor-pointer transition-all group"
            >
                <div className="flex flex-col items-center justify-center text-center gap-2 py-4">
                    <div className="w-12 h-12 rounded-xl bg-[var(--border)] flex items-center justify-center group-hover:bg-[var(--primary)]/20 transition-colors">
                        <svg className="w-6 h-6 text-[var(--muted)] group-hover:text-[var(--primary)] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-[var(--foreground)]">
                            Definir Contexto
                        </p>
                        <p className="text-xs text-[var(--muted-foreground)]">
                            Suas personas precisam de contexto
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (compact) {
        return (
            <div
                onClick={onEdit}
                className="p-3 border border-[var(--border)] rounded-lg bg-[var(--card)] hover:border-[var(--primary)] cursor-pointer transition-all group"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-xs">
                                {project.name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-[var(--foreground)] truncate">
                                {project.name}
                            </p>
                            <p className="text-xs text-[var(--muted-foreground)]">
                                {STAGE_LABELS[project.currentStage]}
                            </p>
                        </div>
                    </div>
                    <svg className="w-4 h-4 text-[var(--muted)] group-hover:text-[var(--primary)] transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                </div>
            </div>
        );
    }

    return (
        <div className="border border-[var(--border)] rounded-xl bg-[var(--card)] overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--background)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                            {project.name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-[var(--foreground)]">
                            {project.name}
                        </p>
                        <p className="text-xs text-[var(--muted-foreground)]">
                            {STAGE_LABELS[project.currentStage]}
                        </p>
                    </div>
                </div>
                <button
                    onClick={onEdit}
                    className="p-2 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border)] transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3 text-sm">
                {project.description && (
                    <div>
                        <p className="text-xs text-[var(--muted)] uppercase tracking-wide mb-1">Descrição</p>
                        <p className="text-[var(--foreground)] line-clamp-2">{project.description}</p>
                    </div>
                )}

                {project.problemSolved && (
                    <div>
                        <p className="text-xs text-[var(--muted)] uppercase tracking-wide mb-1">Problema</p>
                        <p className="text-[var(--foreground)] line-clamp-2">{project.problemSolved}</p>
                    </div>
                )}

                {project.targetAudience && (
                    <div>
                        <p className="text-xs text-[var(--muted)] uppercase tracking-wide mb-1">Público-Alvo</p>
                        <p className="text-[var(--foreground)] line-clamp-2">{project.targetAudience}</p>
                    </div>
                )}

                {project.currentGoals && (
                    <div>
                        <p className="text-xs text-[var(--muted)] uppercase tracking-wide mb-1">Objetivos</p>
                        <p className="text-[var(--foreground)] line-clamp-2">{project.currentGoals}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
