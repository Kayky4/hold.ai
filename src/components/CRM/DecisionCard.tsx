/**
 * 📋 DecisionCard Component (Kanban)
 * 
 * Card de decisão para o Kanban.
 * Usando Tailwind CSS (padrão do projeto).
 */

"use client";

import { DecisionWithCRM, getColumnConfig } from "@/types/crm";

interface DecisionCardProps {
    decision: DecisionWithCRM;
    onClick?: () => void;
    compact?: boolean;
}

const OUTCOME_ICONS: Record<string, string> = {
    success: '✅',
    partial: '⚠️',
    failure: '❌',
    pending: '⏳',
    pivoted: '🔄'
};

export function DecisionCard({ decision, onClick, compact = false }: DecisionCardProps) {
    const columnConfig = getColumnConfig(decision.pipelineStatus);

    const formatDate = (date: Date | string | undefined) => {
        if (!date) return null;
        const d = new Date(date);
        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    };

    const isOverdue = decision.actionDeadline && new Date(decision.actionDeadline) < new Date();

    return (
        <article
            onClick={onClick}
            role="button"
            tabIndex={0}
            className={`
                relative bg-card border border-border rounded-xl cursor-pointer transition-all
                hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5
                focus:outline-none focus:ring-2 focus:ring-primary/50
                ${compact ? 'p-3' : 'p-4'}
            `}
            style={{ borderLeftColor: columnConfig.color, borderLeftWidth: '3px' }}
        >
            {/* Project Badge */}
            {decision.projectName && (
                <span className="inline-block text-[10px] font-semibold text-muted-foreground bg-background px-2 py-0.5 rounded uppercase tracking-wide mb-2">
                    {decision.projectName}
                </span>
            )}

            {/* Title */}
            <h4 className={`font-semibold text-foreground leading-tight mb-1 line-clamp-2 ${compact ? 'text-xs' : 'text-sm'}`}>
                {decision.title}
            </h4>

            {/* Decision Text (truncated) */}
            {!compact && (
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    {decision.decision.length > 100
                        ? decision.decision.substring(0, 100) + '...'
                        : decision.decision
                    }
                </p>
            )}

            {/* Meta info */}
            <div className="flex items-center gap-3 flex-wrap">
                {/* Deadline */}
                {decision.actionDeadline && (
                    <span className={`text-[11px] flex items-center gap-1 ${isOverdue ? 'text-red-500' : 'text-muted-foreground'}`}>
                        📅 {formatDate(decision.actionDeadline)}
                    </span>
                )}

                {/* Outcome */}
                {decision.outcome && (
                    <span className="text-sm">
                        {OUTCOME_ICONS[decision.outcome]}
                    </span>
                )}

                {/* Risks count */}
                {decision.acceptedRisks && decision.acceptedRisks.length > 0 && (
                    <span className="text-[11px] text-amber-500 flex items-center gap-1">
                        ⚠️ {decision.acceptedRisks.length}
                    </span>
                )}
            </div>
        </article>
    );
}
