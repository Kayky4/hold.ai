/**
 * 📊 useDecisions Hook
 * 
 * Hook para gerenciar decisões do usuário.
 * Segue patterns de react-patterns skill.
 * 
 * @see regras_decisoes.md — CRM de Decisões, Pipeline
 * @see react-patterns skill — State management, hooks
 */

import { useState, useCallback, useMemo } from "react";
import { Decision, PipelineStatus, DecisionOutcome, Project } from "@/types";

// ============================================
// 📐 TYPES
// ============================================

export interface DecisionFilters {
    pipelineStatus?: PipelineStatus | "all";
    outcome?: DecisionOutcome | "all";
    projectId?: string | "all";
    searchQuery?: string;
    dateRange?: {
        start: Date;
        end: Date;
    };
    isCrisis?: boolean;
}

export interface DecisionStats {
    total: number;
    byStatus: Record<PipelineStatus, number>;
    byOutcome: Record<DecisionOutcome | "pending", number>;
    successRate: number;
    upcomingReviews: number;
}

interface UseDecisionsReturn {
    /** Lista de decisões filtradas */
    decisions: Decision[];
    /** Todas as decisões */
    allDecisions: Decision[];
    /** Projetos do usuário */
    projects: Project[];
    /** Estatísticas */
    stats: DecisionStats;
    /** Filtros atuais */
    filters: DecisionFilters;
    /** Atualiza filtros */
    setFilters: (filters: Partial<DecisionFilters>) => void;
    /** Limpa filtros */
    clearFilters: () => void;
    /** Atualiza status de uma decisão */
    updateDecisionStatus: (id: string, status: PipelineStatus) => void;
    /** Marca outcome de uma decisão */
    setDecisionOutcome: (id: string, outcome: DecisionOutcome, learnings?: string) => void;
    /** Se está carregando */
    isLoading: boolean;
    /** Decisão selecionada */
    selectedDecision: Decision | null;
    /** Seleciona decisão */
    selectDecision: (id: string | null) => void;
}

// ============================================
// 🔧 MOCK DATA (para desenvolvimento)
// ============================================

const MOCK_DECISIONS: Decision[] = [
    {
        id: "dec-1",
        userId: "user-1",
        sessionId: "sess-1",
        projectId: "proj-1",
        title: "Escolher stack de autenticação",
        decision: "Usar Firebase Auth com Google Sign-In como provider principal",
        reasoning: "Firebase oferece integração nativa com Flutter, reduz tempo de desenvolvimento e tem tier grátis generoso. Google Sign-In é o mais usado no mercado mobile.",
        alternatives: ["Auth0 (mais flexível, mais caro)", "Supabase Auth (open source, menos maduro)", "Implementar do zero (muito tempo)"],
        acceptedRisks: ["Vendor lock-in com Google", "Limites do tier grátis podem ser atingidos"],
        actions: [
            { id: "act-1", description: "Configurar projeto Firebase", completed: true, completedAt: new Date("2026-01-15") },
            { id: "act-2", description: "Implementar flow de login", completed: true, completedAt: new Date("2026-01-18") }
        ],
        reviewDate: new Date("2026-02-15"),
        outcome: "success",
        learnings: "Firebase Auth funcionou perfeitamente. O setup foi rápido e a UX ficou ótima.",
        pipelineStatus: "audited",
        isCrisisDecision: false,
        version: 1,
        createdAt: new Date("2026-01-10"),
        updatedAt: new Date("2026-01-20"),
        tags: ["tech", "auth"]
    },
    {
        id: "dec-2",
        userId: "user-1",
        sessionId: "sess-2",
        projectId: "proj-1",
        title: "Definir modelo de precificação",
        decision: "Lançar com modelo freemium: Free (3 decisões/mês) + Plus (R$29) + Pro (R$79)",
        reasoning: "Freemium permite validação rápida sem barreira de entrada. Preços baseados em benchmarks de apps de produtividade no Brasil.",
        alternatives: ["Apenas pago (barreira alta)", "Pay-per-use (complexo)", "Apenas grátis com ads (desalinhado com produto)"],
        acceptedRisks: ["Taxa de conversão pode ser baixa", "Usuários grátis podem não perceber valor"],
        actions: [
            { id: "act-3", description: "Implementar sistema de limites", completed: false },
            { id: "act-4", description: "Integrar Stripe", completed: false }
        ],
        reviewDate: new Date("2026-03-01"),
        pipelineStatus: "pending",
        isCrisisDecision: false,
        version: 1,
        createdAt: new Date("2026-01-25"),
        updatedAt: new Date("2026-01-25"),
        tags: ["business", "pricing"]
    },
    {
        id: "dec-3",
        userId: "user-1",
        sessionId: "sess-3",
        title: "Responder ao feedback negativo de beta tester",
        decision: "Reconhecer o problema publicamente e priorizar fix para próxima semana",
        reasoning: "Transparência constrói confiança. O problema é real e precisa ser resolvido. Ignorar criaria mais atrito.",
        alternatives: ["Ignorar e esperar passar", "Oferecer reembolso", "Defender o produto"],
        acceptedRisks: ["Pode parecer fraqueza", "Outros usuários podem ver e questionar"],
        actions: [
            { id: "act-5", description: "Responder ao usuário pessoalmente", completed: true, completedAt: new Date("2026-01-28") }
        ],
        reviewDate: new Date("2026-02-05"),
        pipelineStatus: "watching",
        isCrisisDecision: true,
        version: 1,
        createdAt: new Date("2026-01-28"),
        updatedAt: new Date("2026-01-28"),
        tags: ["urgent", "customer"]
    },
    {
        id: "dec-4",
        userId: "user-1",
        sessionId: "sess-4",
        projectId: "proj-2",
        title: "Contratar primeiro desenvolvedor",
        decision: "Buscar dev Flutter júnior/pleno com potencial, não sênior caro",
        reasoning: "Budget limitado. Preciso de alguém que execute bem, não que questione arquitetura. Posso mentorar tecnicamente.",
        alternatives: ["Dev sênior (R$15k+)", "Agência externa (perda de controle)", "Continuar solo (burnout)"],
        acceptedRisks: ["Curva de aprendizado maior", "Pode precisar trocar se não der certo"],
        actions: [
            { id: "act-6", description: "Publicar vaga no LinkedIn", completed: false }
        ],
        reviewDate: new Date("2026-02-28"),
        pipelineStatus: "pending",
        isCrisisDecision: false,
        version: 1,
        createdAt: new Date("2026-01-30"),
        updatedAt: new Date("2026-01-30"),
        tags: ["hiring", "team"]
    }
];

const MOCK_PROJECTS: Project[] = [
    {
        id: "proj-1",
        userId: "user-1",
        name: "HoldAI MVP",
        description: "Lançamento da versão inicial do produto",
        status: "active",
        color: "#8B5CF6",
        createdAt: new Date("2026-01-01"),
        updatedAt: new Date("2026-01-30")
    },
    {
        id: "proj-2",
        userId: "user-1",
        name: "Operações",
        description: "Decisões sobre equipe, processos e infra",
        status: "active",
        color: "#059669",
        createdAt: new Date("2026-01-15"),
        updatedAt: new Date("2026-01-30")
    }
];

// ============================================
// 🪝 HOOK
// ============================================

const DEFAULT_FILTERS: DecisionFilters = {
    pipelineStatus: "all",
    outcome: "all",
    projectId: "all",
    searchQuery: "",
    isCrisis: undefined
};

export function useDecisions(): UseDecisionsReturn {
    // State
    const [allDecisions, setAllDecisions] = useState<Decision[]>(MOCK_DECISIONS);
    const [projects] = useState<Project[]>(MOCK_PROJECTS);
    const [filters, setFiltersState] = useState<DecisionFilters>(DEFAULT_FILTERS);
    const [isLoading] = useState(false);
    const [selectedDecisionId, setSelectedDecisionId] = useState<string | null>(null);

    // ============================================
    // 📊 FILTERED DECISIONS
    // ============================================

    const decisions = useMemo(() => {
        return allDecisions.filter(decision => {
            // Status filter
            if (filters.pipelineStatus && filters.pipelineStatus !== "all") {
                if (decision.pipelineStatus !== filters.pipelineStatus) return false;
            }

            // Outcome filter
            if (filters.outcome && filters.outcome !== "all") {
                if (decision.outcome !== filters.outcome) return false;
            }

            // Project filter
            if (filters.projectId && filters.projectId !== "all") {
                if (decision.projectId !== filters.projectId) return false;
            }

            // Search query
            if (filters.searchQuery && filters.searchQuery.trim()) {
                const query = filters.searchQuery.toLowerCase();
                const matchesTitle = decision.title.toLowerCase().includes(query);
                const matchesDecision = decision.decision.toLowerCase().includes(query);
                const matchesTags = decision.tags?.some(t => t.toLowerCase().includes(query));
                if (!matchesTitle && !matchesDecision && !matchesTags) return false;
            }

            // Crisis filter
            if (filters.isCrisis !== undefined) {
                if (decision.isCrisisDecision !== filters.isCrisis) return false;
            }

            // Date range
            if (filters.dateRange) {
                const createdAt = new Date(decision.createdAt);
                if (createdAt < filters.dateRange.start || createdAt > filters.dateRange.end) {
                    return false;
                }
            }

            return true;
        });
    }, [allDecisions, filters]);

    // ============================================
    // 📈 STATS
    // ============================================

    const stats = useMemo((): DecisionStats => {
        const total = allDecisions.length;

        const byStatus: Record<PipelineStatus, number> = {
            draft: 0,
            pending: 0,
            watching: 0,
            audited: 0
        };

        const byOutcome: Record<DecisionOutcome | "pending", number> = {
            success: 0,
            partial: 0,
            failure: 0,
            pending: 0,
            pivoted: 0
        };

        let successCount = 0;
        let completedCount = 0;
        const now = new Date();
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        let upcomingReviews = 0;

        for (const decision of allDecisions) {
            byStatus[decision.pipelineStatus]++;

            if (decision.outcome) {
                byOutcome[decision.outcome]++;
                completedCount++;
                if (decision.outcome === "success") successCount++;
            } else {
                byOutcome["pending"]++;
            }

            // Check upcoming reviews
            const reviewDate = new Date(decision.reviewDate);
            if (reviewDate >= now && reviewDate <= nextWeek) {
                upcomingReviews++;
            }
        }

        const successRate = completedCount > 0 ? (successCount / completedCount) * 100 : 0;

        return {
            total,
            byStatus,
            byOutcome,
            successRate,
            upcomingReviews
        };
    }, [allDecisions]);

    // ============================================
    // 🎯 SELECTED DECISION
    // ============================================

    const selectedDecision = useMemo(() => {
        if (!selectedDecisionId) return null;
        return allDecisions.find(d => d.id === selectedDecisionId) || null;
    }, [allDecisions, selectedDecisionId]);

    // ============================================
    // 🔧 ACTIONS
    // ============================================

    const setFilters = useCallback((newFilters: Partial<DecisionFilters>) => {
        setFiltersState(prev => ({ ...prev, ...newFilters }));
    }, []);

    const clearFilters = useCallback(() => {
        setFiltersState(DEFAULT_FILTERS);
    }, []);

    const selectDecision = useCallback((id: string | null) => {
        setSelectedDecisionId(id);
    }, []);

    const updateDecisionStatus = useCallback((id: string, status: PipelineStatus) => {
        setAllDecisions(prev => prev.map(d =>
            d.id === id
                ? { ...d, pipelineStatus: status, updatedAt: new Date() }
                : d
        ));
    }, []);

    const setDecisionOutcome = useCallback((id: string, outcome: DecisionOutcome, learnings?: string) => {
        setAllDecisions(prev => prev.map(d =>
            d.id === id
                ? {
                    ...d,
                    outcome,
                    learnings: learnings || d.learnings,
                    pipelineStatus: "audited" as PipelineStatus,
                    updatedAt: new Date()
                }
                : d
        ));
    }, []);

    // ============================================
    // 📦 RETURN
    // ============================================

    return {
        decisions,
        allDecisions,
        projects,
        stats,
        filters,
        setFilters,
        clearFilters,
        updateDecisionStatus,
        setDecisionOutcome,
        isLoading,
        selectedDecision,
        selectDecision
    };
}
