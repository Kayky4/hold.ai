"use client";

import { useState, useEffect } from "react";
import { getDecisions, Decision } from "@/lib/decisions";
import { getMeetings, Meeting } from "@/lib/meetings";
import { useAuth } from "@/contexts/AuthContext";

interface MetricsDashboardProps {
    isOpen: boolean;
    onClose: () => void;
    projectId?: string;
}

interface MetricsData {
    totalMeetings: number;
    totalDecisions: number;
    decidedCount: number;
    pendingCount: number;
    completionRate: number;
    streak: number;
    weeklyMeetings: number[];
    recentActivity: Array<{
        type: "meeting" | "decision";
        title: string;
        date: Date;
    }>;
}

export default function MetricsDashboard({ isOpen, onClose, projectId }: MetricsDashboardProps) {
    const { user } = useAuth();
    const userId = user?.uid || "";
    const [metrics, setMetrics] = useState<MetricsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activePeriod, setActivePeriod] = useState<"week" | "month" | "all">("month");

    useEffect(() => {
        if (isOpen && userId) {
            loadMetrics();
        }
    }, [isOpen, projectId, activePeriod, userId]);

    const loadMetrics = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const [decisions, meetings] = await Promise.all([
                getDecisions(userId, projectId),
                getMeetings(userId),
            ]);

            // Filter by period
            const now = new Date();
            const filterByPeriod = (date: Date) => {
                if (activePeriod === "all") return true;
                const days = activePeriod === "week" ? 7 : 30;
                const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
                return date >= cutoff;
            };

            const filteredDecisions = decisions.filter((d) =>
                filterByPeriod(new Date(d.createdAt))
            );
            const filteredMeetings = meetings.filter((m) =>
                filterByPeriod(new Date(m.createdAt))
            );

            // Calculate streak (consecutive days with activity)
            const streak = calculateStreak(meetings, decisions);

            // Calculate weekly meetings distribution
            const weeklyMeetings = calculateWeeklyDistribution(meetings);

            // Calculate completion rate
            const decidedCount = filteredDecisions.filter((d) => d.status === "taken").length;
            const pendingCount = filteredDecisions.filter((d) => d.status === "pending").length;
            const completionRate = filteredDecisions.length > 0
                ? Math.round((decidedCount / filteredDecisions.length) * 100)
                : 0;

            // Get recent activity
            const recentActivity = [
                ...filteredMeetings.slice(0, 3).map((m) => ({
                    type: "meeting" as const,
                    title: m.topic,
                    date: new Date(m.createdAt),
                })),
                ...filteredDecisions.slice(0, 3).map((d) => ({
                    type: "decision" as const,
                    title: d.decision,
                    date: new Date(d.createdAt),
                })),
            ]
                .sort((a, b) => b.date.getTime() - a.date.getTime())
                .slice(0, 5);

            setMetrics({
                totalMeetings: filteredMeetings.length,
                totalDecisions: filteredDecisions.length,
                decidedCount,
                pendingCount,
                completionRate,
                streak,
                weeklyMeetings,
                recentActivity,
            });
        } catch (error) {
            console.error("Error loading metrics:", error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStreak = (meetings: Meeting[], decisions: Decision[]): number => {
        // Combine all activity dates
        const activityDates = new Set<string>();

        meetings.forEach((m) => {
            const date = new Date(m.createdAt);
            activityDates.add(date.toDateString());
        });

        decisions.forEach((d) => {
            const date = new Date(d.createdAt);
            activityDates.add(date.toDateString());
        });

        if (activityDates.size === 0) return 0;

        // Count consecutive days from today backwards
        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < 365; i++) {
            const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
            if (activityDates.has(checkDate.toDateString())) {
                streak++;
            } else if (i > 0) {
                // Allow skipping today if no activity yet, but break on other gaps
                break;
            }
        }

        return streak;
    };

    const calculateWeeklyDistribution = (meetings: Meeting[]): number[] => {
        const last7Days = [0, 0, 0, 0, 0, 0, 0];
        const now = new Date();

        meetings.forEach((m) => {
            const meetingDate = new Date(m.createdAt);
            const daysDiff = Math.floor((now.getTime() - meetingDate.getTime()) / (24 * 60 * 60 * 1000));
            if (daysDiff >= 0 && daysDiff < 7) {
                last7Days[6 - daysDiff]++;
            }
        });

        return last7Days;
    };

    const getDayLabel = (index: number): string => {
        const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
        const today = new Date().getDay();
        return days[(today - 6 + index + 7) % 7];
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-[var(--card)] rounded-2xl shadow-2xl border border-[var(--border)] w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-[var(--foreground)]">
                                Suas Métricas
                            </h2>
                            <p className="text-sm text-[var(--muted-foreground)]">
                                Acompanhe seu progresso e consistência
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Period Selector */}
                        <div className="flex bg-[var(--background)] rounded-lg p-1">
                            {(["week", "month", "all"] as const).map((period) => (
                                <button
                                    key={period}
                                    onClick={() => setActivePeriod(period)}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activePeriod === period
                                        ? "bg-[var(--primary)] text-white"
                                        : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                                        }`}
                                >
                                    {period === "week" ? "7 dias" : period === "month" ? "30 dias" : "Tudo"}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-[var(--border)] rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5 text-[var(--muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="w-10 h-10 border-2 border-[var(--primary)]/30 border-t-[var(--primary)] rounded-full animate-spin" />
                        </div>
                    ) : metrics ? (
                        <div className="space-y-6">
                            {/* Main Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {/* Meetings */}
                                <div className="bg-[var(--background)] rounded-xl p-4 border border-[var(--border)]">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                                            <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        </div>
                                        <span className="text-xs text-[var(--muted-foreground)]">Reuniões</span>
                                    </div>
                                    <p className="text-3xl font-bold text-[var(--foreground)]">
                                        {metrics.totalMeetings}
                                    </p>
                                </div>

                                {/* Decisions */}
                                <div className="bg-[var(--background)] rounded-xl p-4 border border-[var(--border)]">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <span className="text-xs text-[var(--muted-foreground)]">Decisões</span>
                                    </div>
                                    <p className="text-3xl font-bold text-[var(--foreground)]">
                                        {metrics.totalDecisions}
                                    </p>
                                </div>

                                {/* Completion Rate */}
                                <div className="bg-[var(--background)] rounded-xl p-4 border border-[var(--border)]">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                                            <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                                            </svg>
                                        </div>
                                        <span className="text-xs text-[var(--muted-foreground)]">Concluídas</span>
                                    </div>
                                    <p className="text-3xl font-bold text-[var(--foreground)]">
                                        {metrics.completionRate}%
                                    </p>
                                </div>

                                {/* Streak */}
                                <div className="bg-[var(--background)] rounded-xl p-4 border border-[var(--border)]">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                                            <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                                            </svg>
                                        </div>
                                        <span className="text-xs text-[var(--muted-foreground)]">Streak</span>
                                    </div>
                                    <p className="text-3xl font-bold text-[var(--foreground)]">
                                        {metrics.streak}
                                        <span className="text-base font-normal text-[var(--muted-foreground)]"> dias</span>
                                    </p>
                                </div>
                            </div>

                            {/* Weekly Activity Chart */}
                            <div className="bg-[var(--background)] rounded-xl p-5 border border-[var(--border)]">
                                <h3 className="text-sm font-medium text-[var(--foreground)] mb-4">
                                    Atividade dos Últimos 7 Dias
                                </h3>
                                <div className="flex items-end justify-between gap-2 h-32">
                                    {metrics.weeklyMeetings.map((count, index) => {
                                        const maxCount = Math.max(...metrics.weeklyMeetings, 1);
                                        const height = (count / maxCount) * 100;
                                        return (
                                            <div key={index} className="flex-1 flex flex-col items-center gap-2">
                                                <div className="w-full flex-1 flex items-end">
                                                    <div
                                                        className={`w-full rounded-t-md transition-all ${count > 0
                                                            ? "bg-gradient-to-t from-violet-600 to-violet-400"
                                                            : "bg-[var(--border)]"
                                                            }`}
                                                        style={{ height: `${Math.max(height, 8)}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-[var(--muted-foreground)]">
                                                    {getDayLabel(index)}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Decision Status */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Decided vs Pending */}
                                <div className="bg-[var(--background)] rounded-xl p-5 border border-[var(--border)]">
                                    <h3 className="text-sm font-medium text-[var(--foreground)] mb-4">
                                        Status das Decisões
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                                <span className="text-sm text-[var(--muted-foreground)]">Decididas</span>
                                            </div>
                                            <span className="font-medium text-[var(--foreground)]">{metrics.decidedCount}</span>
                                        </div>
                                        <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-emerald-500 rounded-full transition-all"
                                                style={{ width: `${metrics.totalDecisions > 0 ? (metrics.decidedCount / metrics.totalDecisions) * 100 : 0}%` }}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-amber-500" />
                                                <span className="text-sm text-[var(--muted-foreground)]">Pendentes</span>
                                            </div>
                                            <span className="font-medium text-[var(--foreground)]">{metrics.pendingCount}</span>
                                        </div>
                                        <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-amber-500 rounded-full transition-all"
                                                style={{ width: `${metrics.totalDecisions > 0 ? (metrics.pendingCount / metrics.totalDecisions) * 100 : 0}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Activity */}
                                <div className="bg-[var(--background)] rounded-xl p-5 border border-[var(--border)]">
                                    <h3 className="text-sm font-medium text-[var(--foreground)] mb-4">
                                        Atividade Recente
                                    </h3>
                                    {metrics.recentActivity.length > 0 ? (
                                        <div className="space-y-3">
                                            {metrics.recentActivity.map((activity, index) => (
                                                <div key={index} className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activity.type === "meeting"
                                                        ? "bg-violet-500/20"
                                                        : "bg-emerald-500/20"
                                                        }`}>
                                                        {activity.type === "meeting" ? (
                                                            <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            </svg>
                                                        ) : (
                                                            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm text-[var(--foreground)] truncate">
                                                            {activity.title}
                                                        </p>
                                                        <p className="text-xs text-[var(--muted)]">
                                                            {activity.date.toLocaleDateString("pt-BR", { day: "numeric", month: "short" })}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-[var(--muted-foreground)] text-center py-4">
                                            Nenhuma atividade recente
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Motivational Message */}
                            {metrics.streak > 0 && (
                                <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 rounded-xl p-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">🔥</span>
                                        <div>
                                            <p className="font-medium text-[var(--foreground)]">
                                                {metrics.streak >= 7
                                                    ? `Incrível! ${metrics.streak} dias de streak!`
                                                    : metrics.streak >= 3
                                                        ? `Continue assim! ${metrics.streak} dias seguidos!`
                                                        : `Bom começo! ${metrics.streak} dia${metrics.streak > 1 ? "s" : ""} de streak!`}
                                            </p>
                                            <p className="text-sm text-[var(--muted-foreground)]">
                                                Decisões consistentes criam resultados extraordinários.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <p className="text-[var(--muted-foreground)]">Erro ao carregar métricas</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-[var(--border)] bg-[var(--background)]">
                    <p className="text-xs text-[var(--muted)] text-center">
                        📊 Continue usando o Hold.ai para melhorar suas estatísticas!
                    </p>
                </div>
            </div>
        </div>
    );
}
