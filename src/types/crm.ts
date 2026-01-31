/**
 * 🗂️ CRM Types
 * 
 * Types para o CRM de Decisões.
 * Segue hierarquia definida em regras_decisoes.md:
 * North Star → Projetos → Decisões → Ações
 * 
 * @see regras_decisoes.md — CRM de Decisões (Hierarquia)
 */

// ============================================
// 🌟 NORTH STAR
// ============================================

/**
 * North Star — Objetivo macro do usuário
 * Limite: 1 por usuário
 */
export interface NorthStar {
    id: string;
    userId: string;
    /** ex: "R$ 100k MRR em 2026" */
    title: string;
    /** Contexto adicional */
    description?: string;
    createdAt: Date;
    updatedAt?: Date;
}

// ============================================
// 📁 PROJETOS
// ============================================

/** Status de um projeto */
export type ProjectStatus = 'active' | 'completed' | 'archived';

/**
 * Projeto — Agrupa decisões relacionadas
 */
export interface Project {
    id: string;
    userId: string;
    /** ex: "Marketing Q1" */
    name: string;
    /** Descrição/contexto básico */
    description?: string;
    /** Vinculado ao North Star */
    northStarId?: string;
    /** Status do projeto */
    status: ProjectStatus;
    createdAt: Date;
    updatedAt?: Date;
    /** Count de decisões (computed) */
    decisionCount?: number;

    // ============================================
    // 📝 CAMPOS DE CONTEXTO (Fase 21)
    // ============================================

    /** Contexto detalhado do projeto */
    context?: string;
    /** Objetivos principais */
    goals?: string;
    /** Restrições conhecidas */
    constraints?: string;
    /** Stakeholders envolvidos */
    stakeholders?: string;
}

/**
 * Verifica se um projeto tem contexto configurado
 */
export function hasProjectContext(project: Project): boolean {
    return !!(
        project.context ||
        project.goals ||
        project.constraints ||
        project.stakeholders
    );
}

// ============================================
// 📋 KANBAN PIPELINE
// ============================================

/** Status no pipeline Kanban (colunas fixas) */
export type KanbanStatus =
    | 'draft'     // Em Debate (Fase H/O/L)
    | 'pending'   // Decidido (Fase D concluída)
    | 'watching'  // Em Maturação (ação executada)
    | 'audited';  // Auditado (outcome marcado)

/** Config de uma coluna do Kanban */
export interface KanbanColumn {
    id: KanbanStatus;
    title: string;
    icon: string;
    color: string;
    description: string;
}

/** Colunas fixas do Kanban */
export const KANBAN_COLUMNS: KanbanColumn[] = [
    {
        id: 'draft',
        title: 'Em Debate',
        icon: '💭',
        color: '#3B82F6', // Blue
        description: 'Sessão em andamento (Fase H/O/L)'
    },
    {
        id: 'pending',
        title: 'Decidido',
        icon: '✓',
        color: '#7C3AED', // Violet
        description: 'Fase D concluída, ação pendente'
    },
    {
        id: 'watching',
        title: 'Em Maturação',
        icon: '👀',
        color: '#D97706', // Amber
        description: 'Ação executada, aguardando resultado'
    },
    {
        id: 'audited',
        title: 'Auditado',
        icon: '✅',
        color: '#059669', // Green
        description: 'Outcome marcado'
    }
];

// ============================================
// 📊 DECISION (CRM Extensions)
// ============================================

/** Extensões para Decision no contexto do CRM */
export interface DecisionCRM {
    /** ID do projeto (opcional) */
    projectId?: string;
    /** Nome do projeto (denormalizado para display) */
    projectName?: string;
    /** Status no pipeline Kanban */
    pipelineStatus: KanbanStatus;
}

// ============================================
// 🔧 UTILITIES
// ============================================

/**
 * Retorna a próxima status no pipeline
 */
export function getNextStatus(current: KanbanStatus): KanbanStatus | null {
    const order: KanbanStatus[] = ['draft', 'pending', 'watching', 'audited'];
    const currentIndex = order.indexOf(current);

    if (currentIndex === -1 || currentIndex === order.length - 1) {
        return null;
    }

    return order[currentIndex + 1];
}

/**
 * Verifica se uma transição de status é válida
 */
export function isValidTransition(from: KanbanStatus, to: KanbanStatus): boolean {
    const validTransitions: Record<KanbanStatus, KanbanStatus[]> = {
        'draft': ['pending'], // Após Fase D
        'pending': ['watching'], // Ação executada
        'watching': ['audited'], // Outcome marcado
        'audited': [] // Terminal
    };

    return validTransitions[from]?.includes(to) ?? false;
}

/**
 * Retorna a config de uma coluna pelo status
 */
export function getColumnConfig(status: KanbanStatus): KanbanColumn {
    return KANBAN_COLUMNS.find(c => c.id === status) || KANBAN_COLUMNS[0];
}

// ============================================
// 📐 VIEW TYPES
// ============================================

/** Modo de visualização do CRM */
export type CRMViewMode = 'kanban' | 'list';

/** Filtros do CRM */
export interface CRMFilters {
    projectId?: string;
    status?: KanbanStatus;
    search?: string;
}

/** Estado do CRM */
export interface CRMState {
    northStar: NorthStar | null;
    projects: Project[];
    decisions: DecisionWithCRM[];
    filters: CRMFilters;
    viewMode: CRMViewMode;
    isLoading: boolean;
    error: string | null;
}

/** Decision com extensões CRM (tipo composto) */
export interface DecisionWithCRM {
    id: string;
    userId: string;
    sessionId: string;
    projectId?: string;
    projectName?: string;
    title: string;
    decision: string;
    reasoning: string;
    alternatives: string[];
    acceptedRisks: string[];
    nextAction?: string;
    actionDeadline?: Date;
    reviewDate?: Date;
    outcome?: 'success' | 'partial' | 'failure' | 'pending' | 'pivoted';
    learning?: string;
    pipelineStatus: KanbanStatus;
    createdAt: Date;
    updatedAt?: Date;
    reviewedAt?: Date;
}
