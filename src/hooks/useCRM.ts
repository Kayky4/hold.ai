/**
 * 🗂️ useCRM Hook
 * 
 * Hook para gerenciar estado do CRM de Decisões.
 * Agora usa Firestore para persistência e isolamento por usuário.
 * 
 * @see regras_decisoes.md — CRM de Decisões
 * @see react-patterns skill — Custom hooks
 * @see architecture skill — Simplicity principle
 */

import { useState, useCallback, useEffect, useMemo } from "react";
import {
    NorthStar,
    Project,
    DecisionWithCRM,
    CRMFilters,
    CRMViewMode,
    KanbanStatus,
    isValidTransition
} from "@/types/crm";

// Firestore services
import {
    subscribeToNorthStar,
    setNorthStar as setNorthStarFirestore,
    updateNorthStar as updateNorthStarFirestore,
} from "@/lib/northstar";
import {
    subscribeToCRMProjects,
    createCRMProject,
    updateCRMProject,
    deleteCRMProject,
} from "@/lib/crmProjects";
import {
    subscribeToCRMDecisions,
    updateCRMDecisionStatus,
    assignCRMDecisionToProject,
} from "@/lib/crmDecisions";

// ============================================
// 📐 TYPES
// ============================================

interface UseCRMReturn {
    // Data
    northStar: NorthStar | null;
    projects: Project[];
    decisions: DecisionWithCRM[];

    // Computed
    decisionsByStatus: Record<KanbanStatus, DecisionWithCRM[]>;
    filteredDecisions: DecisionWithCRM[];

    // UI State
    viewMode: CRMViewMode;
    filters: CRMFilters;
    selectedProjectId: string | null;
    isLoading: boolean;
    error: string | null;

    // North Star Actions
    setNorthStar: (northStar: NorthStar) => Promise<void>;
    updateNorthStar: (updates: Partial<NorthStar>) => Promise<void>;

    // Project Actions
    createProject: (name: string, description?: string) => Promise<Project>;
    updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
    deleteProject: (id: string) => Promise<void>;
    selectProject: (id: string | null) => void;

    // Decision Actions
    updateDecisionStatus: (decisionId: string, newStatus: KanbanStatus) => Promise<void>;
    assignDecisionToProject: (decisionId: string, projectId: string | null) => Promise<void>;

    // UI Actions
    setViewMode: (mode: CRMViewMode) => void;
    setFilters: (filters: CRMFilters) => void;
    clearFilters: () => void;
}

// ============================================
// 🔑 LOCAL STORAGE KEY (only for UI preferences)
// ============================================

const VIEW_MODE_KEY = 'holdai_crm_view_mode';

// ============================================
// 🪝 HOOK
// ============================================

export function useCRM(userId: string | null): UseCRMReturn {
    // ============================================
    // STATE
    // ============================================

    const [northStar, setNorthStarState] = useState<NorthStar | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [decisions, setDecisions] = useState<DecisionWithCRM[]>([]);
    const [viewMode, setViewModeState] = useState<CRMViewMode>('kanban');
    const [filters, setFiltersState] = useState<CRMFilters>({});
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ============================================
    // FIRESTORE SUBSCRIPTIONS
    // ============================================

    useEffect(() => {
        // If no userId, reset state and return
        if (!userId) {
            setNorthStarState(null);
            setProjects([]);
            setDecisions([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        // Track subscription count for loading state
        let loadedCount = 0;
        const totalSubscriptions = 3;

        const checkLoaded = () => {
            loadedCount++;
            if (loadedCount >= totalSubscriptions) {
                setIsLoading(false);
            }
        };

        // Subscribe to North Star
        const unsubNorthStar = subscribeToNorthStar(
            userId,
            (ns) => {
                setNorthStarState(ns);
                checkLoaded();
            },
            (err) => {
                console.error('[useCRM] North Star error:', err);
                setError('Erro ao carregar North Star');
                checkLoaded();
            }
        );

        // Subscribe to Projects
        const unsubProjects = subscribeToCRMProjects(
            userId,
            (projs) => {
                setProjects(projs);
                checkLoaded();
            },
            (err) => {
                console.error('[useCRM] Projects error:', err);
                setError('Erro ao carregar projetos');
                checkLoaded();
            }
        );

        // Subscribe to Decisions
        const unsubDecisions = subscribeToCRMDecisions(
            userId,
            (decs) => {
                setDecisions(decs);
                checkLoaded();
            },
            (err) => {
                console.error('[useCRM] Decisions error:', err);
                setError('Erro ao carregar decisões');
                checkLoaded();
            }
        );

        // Load view mode from localStorage (UI preference only)
        try {
            const savedViewMode = localStorage.getItem(VIEW_MODE_KEY);
            if (savedViewMode) {
                setViewModeState(JSON.parse(savedViewMode));
            }
        } catch (err) {
            console.error('[useCRM] View mode load error:', err);
        }

        // Cleanup subscriptions
        return () => {
            unsubNorthStar();
            unsubProjects();
            unsubDecisions();
        };
    }, [userId]);

    // ============================================
    // COMPUTED VALUES
    // ============================================

    /**
     * Decisions grouped by Kanban status
     */
    const decisionsByStatus = useMemo(() => {
        const grouped: Record<KanbanStatus, DecisionWithCRM[]> = {
            draft: [],
            pending: [],
            watching: [],
            audited: []
        };

        const toFilter = selectedProjectId
            ? decisions.filter(d => d.projectId === selectedProjectId)
            : decisions;

        toFilter.forEach(decision => {
            if (grouped[decision.pipelineStatus]) {
                grouped[decision.pipelineStatus].push(decision);
            }
        });

        // Sort by most recent first within each column
        Object.keys(grouped).forEach(status => {
            grouped[status as KanbanStatus].sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
        });

        return grouped;
    }, [decisions, selectedProjectId]);

    /**
     * Filtered decisions based on current filters
     */
    const filteredDecisions = useMemo(() => {
        let result = [...decisions];

        if (filters.projectId) {
            result = result.filter(d => d.projectId === filters.projectId);
        }

        if (filters.status) {
            result = result.filter(d => d.pipelineStatus === filters.status);
        }

        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            result = result.filter(d =>
                d.title.toLowerCase().includes(searchLower) ||
                d.decision.toLowerCase().includes(searchLower)
            );
        }

        return result;
    }, [decisions, filters]);

    // ============================================
    // NORTH STAR ACTIONS
    // ============================================

    const setNorthStar = useCallback(async (ns: NorthStar) => {
        if (!userId) return;

        try {
            await setNorthStarFirestore(userId, {
                title: ns.title,
                description: ns.description,
            });
        } catch (err) {
            console.error('[useCRM] Set North Star error:', err);
            setError('Erro ao salvar North Star');
        }
    }, [userId]);

    const updateNorthStar = useCallback(async (updates: Partial<NorthStar>) => {
        if (!userId || !northStar) return;

        try {
            await updateNorthStarFirestore(userId, {
                title: updates.title,
                description: updates.description,
            });
        } catch (err) {
            console.error('[useCRM] Update North Star error:', err);
            setError('Erro ao atualizar North Star');
        }
    }, [userId, northStar]);

    // ============================================
    // PROJECT ACTIONS
    // ============================================

    const createProject = useCallback(async (name: string, description?: string): Promise<Project> => {
        if (!userId) {
            throw new Error('Usuário não autenticado');
        }

        try {
            const newProject = await createCRMProject(userId, {
                name,
                description,
                northStarId: northStar?.id,
            });
            return newProject;
        } catch (err: any) {
            console.error('[useCRM] Create project error:', err);
            setError(err.message || 'Erro ao criar projeto');
            throw err;
        }
    }, [userId, northStar]);

    const updateProject = useCallback(async (id: string, updates: Partial<Project>) => {
        if (!userId) return;

        try {
            await updateCRMProject(userId, id, {
                name: updates.name,
                description: updates.description,
                status: updates.status,
                northStarId: updates.northStarId,
            });
        } catch (err) {
            console.error('[useCRM] Update project error:', err);
            setError('Erro ao atualizar projeto');
        }
    }, [userId]);

    const deleteProject = useCallback(async (id: string) => {
        if (!userId) return;

        try {
            await deleteCRMProject(userId, id);

            // Clear selection if deleted project was selected
            if (selectedProjectId === id) {
                setSelectedProjectId(null);
            }
        } catch (err) {
            console.error('[useCRM] Delete project error:', err);
            setError('Erro ao excluir projeto');
        }
    }, [userId, selectedProjectId]);

    const selectProject = useCallback((id: string | null) => {
        setSelectedProjectId(id);
    }, []);

    // ============================================
    // DECISION ACTIONS
    // ============================================

    const updateDecisionStatus = useCallback(async (decisionId: string, newStatus: KanbanStatus) => {
        if (!userId) return;

        const decision = decisions.find(d => d.id === decisionId);
        if (!decision) {
            setError('Decisão não encontrada');
            return;
        }

        // Validate transition
        if (!isValidTransition(decision.pipelineStatus, newStatus)) {
            setError(`Transição inválida: ${decision.pipelineStatus} → ${newStatus}`);
            return;
        }

        try {
            await updateCRMDecisionStatus(userId, decisionId, newStatus);
        } catch (err) {
            console.error('[useCRM] Update decision status error:', err);
            setError('Erro ao atualizar status da decisão');
        }
    }, [userId, decisions]);

    const assignDecisionToProject = useCallback(async (decisionId: string, projectId: string | null) => {
        if (!userId) return;

        const project = projectId ? projects.find(p => p.id === projectId) : null;

        try {
            await assignCRMDecisionToProject(userId, decisionId, projectId, project?.name);
        } catch (err) {
            console.error('[useCRM] Assign decision error:', err);
            setError('Erro ao atribuir decisão ao projeto');
        }
    }, [userId, projects]);

    // ============================================
    // UI ACTIONS
    // ============================================

    const setViewMode = useCallback((mode: CRMViewMode) => {
        setViewModeState(mode);
        try {
            localStorage.setItem(VIEW_MODE_KEY, JSON.stringify(mode));
        } catch (err) {
            console.error('[useCRM] Save view mode error:', err);
        }
    }, []);

    const setFilters = useCallback((newFilters: CRMFilters) => {
        setFiltersState(newFilters);
    }, []);

    const clearFilters = useCallback(() => {
        setFiltersState({});
        setSelectedProjectId(null);
    }, []);

    // ============================================
    // RETURN
    // ============================================

    return {
        // Data
        northStar,
        projects,
        decisions,

        // Computed
        decisionsByStatus,
        filteredDecisions,

        // UI State
        viewMode,
        filters,
        selectedProjectId,
        isLoading,
        error,

        // North Star Actions
        setNorthStar,
        updateNorthStar,

        // Project Actions
        createProject,
        updateProject,
        deleteProject,
        selectProject,

        // Decision Actions
        updateDecisionStatus,
        assignDecisionToProject,

        // UI Actions
        setViewMode,
        setFilters,
        clearFilters
    };
}
