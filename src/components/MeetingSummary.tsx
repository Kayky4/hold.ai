"use client";

import { useState } from "react";
import { createDecisionsFromSummary } from "@/lib/decisions";
import { useAuth } from "@/contexts/AuthContext";

interface MeetingSummaryProps {
    summary?: string;
    decisions?: Array<{ decision: string; context: string; status: "pending" | "taken" }>;
    topic: string;
    personas: string[];
    meetingId: string;
    meetingTitle: string;
    projectId?: string;
    messageCount: number;
    isLoading?: boolean;
    onClose: () => void;
    onDecisionsSaved?: () => void;
}

export default function MeetingSummary({
    summary,
    decisions = [],
    topic,
    personas,
    meetingId,
    meetingTitle,
    projectId,
    messageCount,
    isLoading = false,
    onClose,
    onDecisionsSaved,
}: MeetingSummaryProps) {
    const { user } = useAuth();
    const userId = user?.uid || "";
    const [copied, setCopied] = useState(false);
    const [savingDecisions, setSavingDecisions] = useState(false);
    const [decisionsSaved, setDecisionsSaved] = useState(false);

    const handleCopy = async () => {
        if (!summary) return;
        try {
            await navigator.clipboard.writeText(summary);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const handleSaveDecisions = async () => {
        if (decisions.length === 0 || !userId) return;

        setSavingDecisions(true);
        try {
            await createDecisionsFromSummary(
                userId,
                decisions,
                meetingId,
                meetingTitle,
                personas,
                projectId
            );

            setDecisionsSaved(true);
            if (onDecisionsSaved) {
                onDecisionsSaved();
            }
        } catch (error) {
            console.error("Error saving decisions:", error);
        } finally {
            setSavingDecisions(false);
        }
    };

    const handleExportMarkdown = () => {
        if (!summary) return;
        const blob = new Blob([summary], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `reuniao-${topic.replace(/\s+/g, "-").toLowerCase()}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Loading state UI
    if (isLoading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="bg-card rounded-2xl shadow-2xl border border-border max-w-2xl w-full overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-gradient-to-r from-emerald-500/10 to-teal-500/10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center animate-pulse">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-foreground">Resumo Executivo</h2>
                                <p className="text-sm text-muted-foreground">
                                    {messageCount} mensagens • {personas.join(" vs ")}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Loading Content */}
                    <div className="p-8 flex flex-col items-center justify-center min-h-[300px]">
                        {/* Animated spinner */}
                        <div className="relative mb-6">
                            <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20"></div>
                            <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-emerald-500 animate-spin"></div>
                            <div className="absolute inset-2 w-12 h-12 rounded-full border-4 border-transparent border-t-teal-400 animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.8s" }}></div>
                        </div>

                        <h3 className="text-lg font-semibold text-foreground mb-2">
                            Gerando Resumo Executivo...
                        </h3>
                        <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
                            Analisando {messageCount} mensagens e estruturando com o framework HOLD
                        </p>

                        {/* Progress steps */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                Processando
                            </span>
                            <span className="text-border">→</span>
                            <span className="opacity-50">Estruturando</span>
                            <span className="text-border">→</span>
                            <span className="opacity-50">Extraindo decisões</span>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-border bg-background">
                        <p className="text-xs text-muted text-center">
                            💡 Isso pode levar alguns segundos dependendo da complexidade da reunião
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-card rounded-2xl shadow-2xl border border-border max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-gradient-to-r from-emerald-500/10 to-teal-500/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">Resumo Executivo</h2>
                            <p className="text-sm text-muted-foreground">
                                {messageCount} mensagens • {personas.join(" vs ")}
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

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Summary */}
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                        <div
                            className="text-foreground leading-relaxed"
                            dangerouslySetInnerHTML={{
                                __html: (summary || "")
                                    .replace(/^### /gm, '<h3 class="text-lg font-semibold mt-6 mb-2 text-foreground">')
                                    .replace(/^## /gm, '<h2 class="text-xl font-bold mt-6 mb-3 text-foreground">')
                                    .replace(/^# /gm, '<h1 class="text-2xl font-bold mt-6 mb-4 text-foreground">')
                                    .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold">$1</strong>')
                                    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
                                    .replace(/^- /gm, '<li class="ml-4 text-foreground">')
                                    .replace(/\n\n/g, '</p><p class="mt-3">')
                                    .replace(/\n/g, '<br/>')
                            }}
                        />
                    </div>

                    {/* Decisions Section */}
                    {decisions.length > 0 && (
                        <div className="mt-8 p-4 bg-background rounded-xl border border-border">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                    </svg>
                                    <h3 className="font-semibold text-foreground">
                                        {decisions.length} {decisions.length === 1 ? "Decisão Identificada" : "Decisões Identificadas"}
                                    </h3>
                                </div>
                                {!decisionsSaved && (
                                    <button
                                        onClick={handleSaveDecisions}
                                        disabled={savingDecisions}
                                        className="flex items-center gap-2 px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                    >
                                        {savingDecisions ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Salvando...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                                </svg>
                                                Salvar no Banco de Decisões
                                            </>
                                        )}
                                    </button>
                                )}
                                {decisionsSaved && (
                                    <span className="flex items-center gap-2 text-emerald-500 text-sm">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Decisões salvas!
                                    </span>
                                )}
                            </div>
                            <div className="space-y-2">
                                {decisions.map((d, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 bg-card rounded-lg border border-border">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${d.status === "taken"
                                            ? "bg-emerald-500/20 text-emerald-500"
                                            : "bg-amber-500/20 text-amber-500"
                                            }`}>
                                            {d.status === "taken" ? (
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            ) : (
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground">{d.decision}</p>
                                            {d.context && (
                                                <p className="text-xs text-muted-foreground mt-1">{d.context}</p>
                                            )}
                                        </div>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${d.status === "taken"
                                            ? "bg-emerald-500/20 text-emerald-500"
                                            : "bg-amber-500/20 text-amber-500"
                                            }`}>
                                            {d.status === "taken" ? "Decidido" : "Pendente"}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-background">
                    <p className="text-xs text-muted">
                        💡 Este resumo foi gerado usando o framework HOLD
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-2 px-4 py-2 bg-card hover:bg-border border border-border rounded-lg text-sm text-foreground transition-colors"
                        >
                            {copied ? (
                                <>
                                    <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Copiado!
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                    </svg>
                                    Copiar
                                </>
                            )}
                        </button>
                        <button
                            onClick={handleExportMarkdown}
                            className="flex items-center gap-2 px-4 py-2 bg-card hover:bg-border border border-border rounded-lg text-sm text-foreground transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Exportar .md
                        </button>
                        <button
                            onClick={onClose}
                            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
