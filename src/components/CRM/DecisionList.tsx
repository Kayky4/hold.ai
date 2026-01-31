/**
 * 📋 DecisionList Component
 * 
 * Visualização em lista das decisões.
 * Alternativa ao Kanban para visualização mais compacta.
 * 
 * @see regras_decisoes.md — CRM de Decisões
 */

"use client";

import { DecisionWithCRM, KANBAN_COLUMNS, KanbanStatus } from "@/types/crm";

interface DecisionListProps {
    decisionsByStatus: Record<KanbanStatus, DecisionWithCRM[]>;
    onDecisionClick: (decision: DecisionWithCRM) => void;
}

const STATUS_STYLES: Record<KanbanStatus, { bg: string; text: string; icon: string }> = {
    draft: { bg: 'bg-amber-500/10', text: 'text-amber-500', icon: '💭' },
    pending: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', icon: '✓' },
    watching: { bg: 'bg-violet-500/10', text: 'text-violet-500', icon: '👀' },
    audited: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', icon: '✅' }
};

export function DecisionList({ decisionsByStatus, onDecisionClick }: DecisionListProps) {
    // Flatten all decisions and sort by date
    const allDecisions = Object.values(decisionsByStatus)
        .flat()
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const formatDate = (date: Date) => {
        const d = new Date(date);
        return d.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
        });
    };

    if (allDecisions.length === 0) {
        return null;
    }

    return (
        <div className="mt-4">
            {/* Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b border-border">
                <div className="col-span-5">Decisão</div>
                <div className="col-span-2">Projeto</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Data</div>
                <div className="col-span-1">Riscos</div>
            </div>

            {/* List Items */}
            <div className="divide-y divide-border">
                {allDecisions.map((decision) => {
                    const style = STATUS_STYLES[decision.pipelineStatus];
                    const column = KANBAN_COLUMNS.find(c => c.id === decision.pipelineStatus);

                    return (
                        <button
                            key={decision.id}
                            onClick={() => onDecisionClick(decision)}
                            className="w-full grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-4 py-3 hover:bg-background/50 transition-colors text-left group"
                        >
                            {/* Title + Decision */}
                            <div className="md:col-span-5">
                                <h3 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                    {decision.title}
                                </h3>
                                <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                                    {decision.decision}
                                </p>
                            </div>

                            {/* Project */}
                            <div className="md:col-span-2 flex items-center">
                                {decision.projectName ? (
                                    <span className="text-sm text-muted-foreground">
                                        📁 {decision.projectName}
                                    </span>
                                ) : (
                                    <span className="text-sm text-muted">—</span>
                                )}
                            </div>

                            {/* Status */}
                            <div className="md:col-span-2 flex items-center">
                                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
                                    <span>{style.icon}</span>
                                    <span>{column?.title}</span>
                                </span>
                            </div>

                            {/* Date */}
                            <div className="md:col-span-2 flex items-center">
                                <span className="text-sm text-muted-foreground">
                                    {formatDate(decision.createdAt)}
                                </span>
                            </div>

                            {/* Risks */}
                            <div className="md:col-span-1 flex items-center">
                                {decision.acceptedRisks && decision.acceptedRisks.length > 0 ? (
                                    <span className="text-sm text-amber-500">
                                        ⚠️ {decision.acceptedRisks.length}
                                    </span>
                                ) : (
                                    <span className="text-sm text-muted">—</span>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
