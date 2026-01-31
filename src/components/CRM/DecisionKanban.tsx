/**
 * 📊 DecisionKanban Component
 * 
 * Kanban de decisões com 4 colunas fixas.
 * Desktop: Cards horizontais
 * Mobile: Acordeão por status
 * Usando Tailwind CSS (padrão do projeto).
 */

"use client";

import { useState } from "react";
import { DecisionWithCRM, KanbanStatus, KANBAN_COLUMNS } from "@/types/crm";
import { DecisionCard } from "./DecisionCard";

interface DecisionKanbanProps {
    decisionsByStatus: Record<KanbanStatus, DecisionWithCRM[]>;
    onDecisionClick?: (decision: DecisionWithCRM) => void;
    isMobile?: boolean;
}

export function DecisionKanban({
    decisionsByStatus,
    onDecisionClick,
    isMobile = false
}: DecisionKanbanProps) {
    const [expandedColumn, setExpandedColumn] = useState<KanbanStatus | null>('draft');

    // Mobile: Accordion view
    if (isMobile) {
        return (
            <div className="flex flex-col gap-2 py-4">
                {KANBAN_COLUMNS.map((column) => {
                    const decisions = decisionsByStatus[column.id] || [];
                    const isExpanded = expandedColumn === column.id;

                    return (
                        <div key={column.id} className="bg-card border border-border rounded-xl overflow-hidden">
                            <button
                                onClick={() => setExpandedColumn(isExpanded ? null : column.id)}
                                className="w-full flex items-center justify-between px-4 py-3 hover:bg-background transition-colors"
                                style={{ borderBottomColor: isExpanded ? column.color : 'transparent', borderBottomWidth: isExpanded ? '2px' : '0' }}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-base">{column.icon}</span>
                                    <span className="text-sm font-semibold text-foreground">{column.title}</span>
                                    <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded-full">
                                        {decisions.length}
                                    </span>
                                </div>
                                <span className={`text-xs text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                                    ▼
                                </span>
                            </button>

                            {isExpanded && (
                                <div className="p-3 bg-background flex flex-col gap-2">
                                    {decisions.length === 0 ? (
                                        <div className="py-4 text-center text-sm text-muted-foreground">
                                            Nenhuma decisão
                                        </div>
                                    ) : (
                                        decisions.map((decision) => (
                                            <DecisionCard
                                                key={decision.id}
                                                decision={decision}
                                                onClick={() => onDecisionClick?.(decision)}
                                                compact
                                            />
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    }

    // Desktop: Kanban view
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 py-5 overflow-x-auto min-h-[400px]">
            {KANBAN_COLUMNS.map((column) => {
                const decisions = decisionsByStatus[column.id] || [];

                return (
                    <div
                        key={column.id}
                        className="flex flex-col bg-background rounded-xl min-w-[280px] min-h-[300px]"
                    >
                        {/* Column Header */}
                        <header
                            className="flex items-center justify-between px-4 py-3"
                            style={{ borderBottom: `2px solid ${column.color}` }}
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-base">{column.icon}</span>
                                <h3 className="text-sm font-semibold text-foreground">{column.title}</h3>
                            </div>
                            <span className="text-xs font-semibold text-muted-foreground bg-card px-2 py-0.5 rounded-full">
                                {decisions.length}
                            </span>
                        </header>

                        {/* Column Content */}
                        <div className="flex-1 p-3 overflow-y-auto">
                            {decisions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                                    <span className="text-2xl opacity-30 mb-2">📭</span>
                                    <span className="text-xs text-muted-foreground leading-relaxed">
                                        {column.description}
                                    </span>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {decisions.map((decision) => (
                                        <DecisionCard
                                            key={decision.id}
                                            decision={decision}
                                            onClick={() => onDecisionClick?.(decision)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
