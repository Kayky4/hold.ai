"use client";

import { useState, useEffect } from "react";
import { Decision, getDecisions, getDecisionCount, updateDecisionOutcome, deleteDecision } from "@/lib/decisions";
import { useAuth } from "@/contexts/AuthContext";

interface DecisionsDashboardProps {
    projectId?: string;
    onClose: () => void;
}

export default function DecisionsDashboard({ projectId, onClose }: DecisionsDashboardProps) {
    const { user } = useAuth();
    const userId = user?.uid || "";
    const [decisions, setDecisions] = useState<Decision[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "pending" | "taken" | "revisited">("all");

    useEffect(() => {
        if (userId) {
            loadDecisions();
        }
    }, [projectId, userId]);

    const loadDecisions = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const [decisionsData, count] = await Promise.all([
                getDecisions(userId, projectId),
                getDecisionCount(userId),
            ]);
            setDecisions(decisionsData);
            setTotalCount(count);
        } catch (error) {
            console.error("Error loading decisions:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOutcome = async (id: string, outcome: "success" | "failure") => {
        try {
            await updateDecisionOutcome(id, outcome);
            await loadDecisions();
        } catch (error) {
            console.error("Error updating outcome:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir esta decisão?")) return;
        try {
            await deleteDecision(id);
            await loadDecisions();
        } catch (error) {
            console.error("Error deleting decision:", error);
        }
    };

    const filteredDecisions = filter === "all"
        ? decisions
        : decisions.filter(d => d.status === filter);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "taken": return "bg-emerald-500/20 text-emerald-500";
            case "pending": return "bg-amber-500/20 text-amber-500";
            case "revisited": return "bg-violet-500/20 text-violet-500";
            default: return "bg-gray-500/20 text-gray-500";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "taken": return "Decidido";
            case "pending": return "Pendente";
            case "revisited": return "Revisitado";
            default: return status;
        }
    };

    const getOutcomeIcon = (outcome: string | null) => {
        switch (outcome) {
            case "success":
                return (
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center" title="Acertei">
                        <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                );
            case "failure":
                return (
                    <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center" title="Errei">
                        <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-card rounded-2xl shadow-2xl border border-border max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-violet-500/10 to-purple-500/10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-foreground">Banco de Decisões</h2>
                                <p className="text-sm text-muted-foreground">
                                    Este é seu ativo mais valioso
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-background transition-colors"
                        >
                            <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="mt-4 flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="text-3xl font-bold bg-gradient-to-r from-violet-500 to-purple-500 text-transparent bg-clip-text">
                                {totalCount}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                decisões<br />tomadas no Hold
                            </div>
                        </div>
                        <div className="h-10 w-px bg-border" />
                        <div className="flex gap-2">
                            <span className="px-2 py-1 text-xs rounded-full bg-emerald-500/20 text-emerald-500">
                                {decisions.filter(d => d.status === "taken").length} decididas
                            </span>
                            <span className="px-2 py-1 text-xs rounded-full bg-amber-500/20 text-amber-500">
                                {decisions.filter(d => d.status === "pending").length} pendentes
                            </span>
                            <span className="px-2 py-1 text-xs rounded-full bg-violet-500/20 text-violet-500">
                                {decisions.filter(d => d.status === "revisited").length} revisitadas
                            </span>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="px-6 py-3 border-b border-border flex items-center gap-2">
                    {(["all", "pending", "taken", "revisited"] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${filter === f
                                ? "bg-primary text-white"
                                : "bg-background text-foreground hover:bg-border"
                                }`}
                        >
                            {f === "all" ? "Todas" : getStatusLabel(f)}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex items-center justify-center h-32">
                            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                        </div>
                    ) : filteredDecisions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-32 text-center">
                            <svg className="w-12 h-12 text-muted mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <p className="text-muted-foreground">
                                {filter === "all"
                                    ? "Nenhuma decisão registrada ainda"
                                    : `Nenhuma decisão ${getStatusLabel(filter).toLowerCase()}`
                                }
                            </p>
                            <p className="text-sm text-muted mt-1">
                                As decisões são extraídas automaticamente ao encerrar reuniões
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredDecisions.map((decision) => (
                                <div
                                    key={decision.id}
                                    className="p-4 bg-background rounded-xl border border-border hover:border-primary/30 transition-colors group"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(decision.status)}`}>
                                                    {getStatusLabel(decision.status)}
                                                </span>
                                                {getOutcomeIcon(decision.outcome ?? null)}
                                            </div>
                                            <p className="font-medium text-foreground">{decision.decision}</p>
                                            {decision.context && (
                                                <p className="text-sm text-muted-foreground mt-1">{decision.context}</p>
                                            )}
                                            <div className="flex items-center gap-4 mt-2 text-xs text-muted">
                                                <span>📅 {new Date(decision.createdAt).toLocaleDateString("pt-BR")}</span>
                                                <span>📍 {decision.meetingTitle}</span>
                                                <span>👥 {decision.personas.join(", ")}</span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {decision.status === "taken" && !decision.outcome && (
                                                <>
                                                    <button
                                                        onClick={() => handleOutcome(decision.id, "success")}
                                                        className="p-1.5 rounded-lg hover:bg-emerald-500/20 text-emerald-500 transition-colors"
                                                        title="Marcar como acerto"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleOutcome(decision.id, "failure")}
                                                        className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-500 transition-colors"
                                                        title="Marcar como erro"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => handleDelete(decision.id)}
                                                className="p-1.5 rounded-lg hover:bg-red-500/20 text-muted hover:text-red-500 transition-colors"
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

                {/* Footer */}
                <div className="px-6 py-4 border-t border-border bg-background flex items-center justify-between">
                    <p className="text-xs text-muted">
                        💡 Não perca seu histórico de raciocínio
                    </p>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}
