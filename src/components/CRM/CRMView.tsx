/**
 * 🗂️ CRMView Component
 * 
 * View principal do CRM de Decisões.
 * Integra North Star, Projetos e Kanban.
 * Usando Tailwind CSS (padrão do projeto).
 */

"use client";

import { useState, useEffect } from "react";
import { useCRM } from "@/hooks/useCRM";
import { useAuth } from "@/contexts/AuthContext";
import { NorthStarCard } from "./NorthStarCard";
import { ProjectList } from "./ProjectList";
import { DecisionKanban } from "./DecisionKanban";
import { DecisionWithCRM } from "@/types/crm";

interface CRMViewProps {
    onDecisionSelect?: (decision: DecisionWithCRM) => void;
}

export function CRMView({ onDecisionSelect }: CRMViewProps) {
    const { user } = useAuth();
    const [isMobile, setIsMobile] = useState(false);
    const [showProjectsSidebar, setShowProjectsSidebar] = useState(true);

    const {
        northStar,
        projects,
        decisionsByStatus,
        selectedProjectId,
        viewMode,
        isLoading,
        error,
        setNorthStar,
        updateNorthStar,
        createProject,
        updateProject,
        deleteProject,
        selectProject,
        setViewMode
    } = useCRM(user?.uid || null);

    // Detect mobile
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile) {
                setShowProjectsSidebar(false);
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Calculate total decisions
    const totalDecisions = Object.values(decisionsByStatus).reduce(
        (sum, arr) => sum + arr.length, 0
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full bg-background">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-5 border-b border-border bg-card">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold text-foreground">Decisões</h1>
                    <span className="text-sm font-semibold text-muted-foreground bg-background px-3 py-1 rounded-full">
                        {totalDecisions}
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    {/* View Mode Toggle (Desktop only) */}
                    {!isMobile && (
                        <div className="flex bg-background rounded-lg p-0.5">
                            <button
                                onClick={() => setViewMode('kanban')}
                                className={`px-3 py-1.5 text-base rounded-md transition-all ${viewMode === 'kanban'
                                    ? 'bg-card text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                title="Kanban"
                            >
                                ▦
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-3 py-1.5 text-base rounded-md transition-all ${viewMode === 'list'
                                    ? 'bg-card text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                title="Lista"
                            >
                                ≡
                            </button>
                        </div>
                    )}

                    {/* Mobile: Toggle projects sidebar */}
                    {isMobile && (
                        <button
                            onClick={() => setShowProjectsSidebar(!showProjectsSidebar)}
                            className="px-4 py-2 bg-background border border-border rounded-lg text-sm text-foreground"
                        >
                            📁 Projetos
                        </button>
                    )}
                </div>
            </header>

            {/* Error display */}
            {error && (
                <div className="px-6 py-3 bg-red-500/10 text-red-500 text-sm">
                    ⚠️ {error}
                </div>
            )}

            {/* North Star */}
            <div className="px-6 pt-5">
                <NorthStarCard
                    northStar={northStar}
                    onSave={setNorthStar}
                    onUpdate={updateNorthStar}
                />
            </div>

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Projects Sidebar */}
                {(showProjectsSidebar || !isMobile) && (
                    <aside className={`
                        w-64 px-4 py-4 border-r border-border bg-card overflow-y-auto
                        ${isMobile ? 'fixed left-0 top-0 bottom-0 z-50 shadow-xl' : ''}
                    `}>
                        {isMobile && (
                            <button
                                onClick={() => setShowProjectsSidebar(false)}
                                className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center bg-background rounded-lg text-sm"
                            >
                                ✕
                            </button>
                        )}
                        <ProjectList
                            projects={projects}
                            selectedProjectId={selectedProjectId}
                            onSelect={(id) => {
                                selectProject(id);
                                if (isMobile) setShowProjectsSidebar(false);
                            }}
                            onCreate={createProject}
                            onUpdate={updateProject}
                            onDelete={deleteProject}
                        />
                    </aside>
                )}

                {/* Mobile overlay */}
                {isMobile && showProjectsSidebar && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40"
                        onClick={() => setShowProjectsSidebar(false)}
                    />
                )}

                {/* Kanban / List */}
                <main className="flex-1 px-6 overflow-y-auto">
                    {selectedProjectId && (
                        <div className="flex items-center justify-between px-4 py-2 bg-primary/10 rounded-lg mt-4">
                            <span className="text-sm text-muted-foreground">
                                Filtrando por: <strong className="text-primary">{projects.find(p => p.id === selectedProjectId)?.name}</strong>
                            </span>
                            <button
                                onClick={() => selectProject(null)}
                                className="text-muted-foreground hover:text-foreground text-sm p-1"
                            >
                                ✕
                            </button>
                        </div>
                    )}

                    <DecisionKanban
                        decisionsByStatus={decisionsByStatus}
                        onDecisionClick={onDecisionSelect}
                        isMobile={isMobile}
                    />
                </main>
            </div>
        </div>
    );
}
