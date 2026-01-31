/**
 * 📝 Types — HoldAI
 * 
 * Tipos e interfaces do sistema.
 * @see regras_decisoes.md para schemas completos
 * @see fluxos_jornadas.md para fluxos
 */

// ============================================
// 📧 MENSAGENS
// ============================================

export interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
    /** ID da persona que enviou a mensagem (para mensagens de assistente) */
    personaId?: string;
}

// ============================================
// 👥 PERSONAS
// ============================================

export interface Persona {
    id: string;
    name: string;
    description: string;
    style: string;
    tone: string;
    principles: string[];
    biases: string[];
    riskTolerance: number;
    objectives: string[];
    instructions: string[];
    /** Se true, é uma persona do sistema (não pode ser deletada) */
    isSystem?: boolean;
    /** Se true, pode ser editada pelo usuário (Plus/Pro) */
    isEditable?: boolean;
    /** Tipo da persona: moderator ou counselor */
    type?: 'moderator' | 'counselor';
    /** Intensidade de confronto (1-5) */
    intensity?: number;
}

// ============================================
// 💬 CONVERSAS (legado)
// ============================================

export interface Conversation {
    id: string;
    title: string;
    messages: Message[];
    createdAt: Date;
    updatedAt: Date;
    /** Modo da sessão: solo ou mesa */
    mode?: 'solo' | 'mesa' | 'revisao';
    /** Fase atual da sessão */
    phase?: 'H' | 'O' | 'L' | 'D';
    /** Quantidade de conselheiros (para modo mesa) */
    counselorCount?: number;
    /** IDs dos conselheiros selecionados */
    counselorIds?: string[];
}

// ============================================
// 🎯 SESSÕES HOLD
// ============================================

/** Fases do método HOLD */
export type SessionPhase = 'H' | 'O' | 'L' | 'D' | 'completed' | 'paused';

/** 
 * Modos de interação
 * 
 * - solo: Consulta individual com 1 conselheiro
 * - mesa: Debate com 2 conselheiros
 * - mesa_completa: (Futuro) Debate com múltiplos conselheiros
 * - revision: Revisão de decisão passada
 * - crisis: (Futuro) Modo de crise para decisões urgentes
 */
export type SessionMode = 'solo' | 'mesa' | 'mesa_completa' | 'revision' | 'crisis';

/** Quem está falando na sessão */
export type SessionSpeaker = 'user' | 'moderator' | string; // string = counselor ID

/** Mensagem dentro de uma sessão HOLD */
export interface SessionMessage {
    id: string;
    speaker: SessionSpeaker;
    speakerName?: string; // Nome para display
    content: string;
    phase: SessionPhase;
    timestamp: Date;
    /** Marca visual de Context Shift (se houver) */
    isContextShift?: boolean;
}

/** Contexto capturado na Fase H */
export interface SessionContext {
    /** Problema/decisão em discussão */
    problem: string;
    /** Detalhes estruturados capturados */
    details: Record<string, string>;
    /** Resumo do contexto para conselheiros */
    summary?: string;
    /** Alternativas já identificadas pelo usuário */
    alternatives?: string[];
    /** Stakes: o que está em jogo */
    stakes?: string[];
}

/** Configurações da sessão */
export interface SessionConfig {
    /** Se deve usar memória de sessões anteriores */
    useMemory: boolean;
    /** Se deve usar contexto do projeto */
    useProjectContext: boolean;
    /** Se é modo crise (debate relâmpago) */
    isCrisisMode: boolean;
}

/** Sessão HOLD completa */
export interface Session {
    id: string;
    userId: string;
    /** Título da sessão (gerado ou customizado) */
    title: string;
    /** Modo de interação */
    mode: SessionMode;
    /** IDs dos conselheiros selecionados */
    counselorIds: string[];
    /** Fase atual */
    phase: SessionPhase;
    /** Histórico de mensagens */
    messages: SessionMessage[];
    /** Contexto capturado */
    context: SessionContext;
    /** Configurações da sessão */
    config: SessionConfig;
    /** ID da decisão resultante (após Fase D) */
    decisionId?: string;
    /** ID do projeto vinculado (opcional) */
    projectId?: string;
    /** Timestamps */
    createdAt: Date;
    updatedAt: Date;
    pausedAt?: Date;
    completedAt?: Date;
    /** Tags para organização */
    tags?: string[];
}

// ============================================
// 📋 DECISÕES
// ============================================

/** Outcome de uma decisão após revisão */
export type DecisionOutcome =
    | 'success'   // ✅ Sucesso
    | 'partial'   // ⚠️ Parcial
    | 'failure'   // ❌ Falha
    | 'pending'   // ⏳ Em andamento
    | 'pivoted';  // 🔄 Pivotei

/** Status no pipeline Kanban */
export type PipelineStatus =
    | 'draft'     // Em Debate (Fase H/O/L)
    | 'pending'   // Decidido (Fase D concluída)
    | 'watching'  // Em Maturação (ação executada)
    | 'audited';  // Auditado (outcome marcado)

/** Ação definida na Fase D */
export interface DecisionAction {
    id: string;
    description: string;
    /** Se a ação foi executada */
    completed: boolean;
    /** Data de conclusão */
    completedAt?: Date;
    /** Prazo original */
    dueDate?: Date;
}

/** Decisão completa */
export interface Decision {
    id: string;
    userId: string;
    /** ID da sessão que gerou a decisão */
    sessionId: string;
    /** ID do projeto vinculado */
    projectId?: string;
    /** Título da decisão */
    title: string;
    /** Texto da decisão */
    decision: string;
    /** Raciocínio: por que escolheu isso */
    reasoning: string;
    /** Alternativas consideradas e descartadas */
    alternatives: string[];
    /** 
     * ⚠️ CRÍTICO: Riscos aceitos pelo usuário
     * @see regras_decisoes.md — DEVE ser array, não texto
     */
    acceptedRisks: string[];
    /** Ações definidas na Fase D */
    actions: DecisionAction[];
    /** Data de revisão agendada */
    reviewDate: Date;
    /** Outcome após revisão */
    outcome?: DecisionOutcome;
    /** Aprendizados após revisão */
    learnings?: string;
    /** Status no Kanban */
    pipelineStatus: PipelineStatus;
    /** Se é uma decisão de crise */
    isCrisisDecision: boolean;
    /** Versão (para histórico de edições) */
    version: number;
    /** Timestamps */
    createdAt: Date;
    updatedAt: Date;
    /** Tags para organização */
    tags?: string[];
}

// ============================================
// 📁 PROJETOS
// ============================================

/** Status de um projeto */
export type ProjectStatus = 'active' | 'completed' | 'archived';

/** Projeto agrupa decisões relacionadas */
export interface Project {
    id: string;
    userId: string;
    /** Nome do projeto */
    name: string;
    /** Descrição/contexto */
    description?: string;
    /** ID do North Star vinculado */
    northStarId?: string;
    /** Status do projeto */
    status: ProjectStatus;
    /** Cor para display */
    color?: string;
    /** Timestamps */
    createdAt: Date;
    updatedAt: Date;
}

// ============================================
// ⭐ NORTH STAR
// ============================================

/** North Star: objetivo macro do usuário */
export interface NorthStar {
    id: string;
    userId: string;
    /** Título do objetivo */
    title: string;
    /** Descrição adicional */
    description?: string;
    /** Timestamps */
    createdAt: Date;
    updatedAt: Date;
}

// ============================================
// 👤 USUÁRIO
// ============================================

/** Plano de assinatura */
export type SubscriptionPlan = 'free' | 'plus' | 'pro';

/** Preferências do usuário */
export interface UserPreferences {
    /** Tema visual */
    theme: 'light' | 'dark' | 'system';
    /** Notificações push habilitadas */
    pushNotifications: boolean;
    /** Prazo padrão de revisão (dias) */
    defaultReviewDays: number;
    /** Completou onboarding */
    completedOnboarding: boolean;
}

/** Limites mensais (Free) */
export interface UserLimits {
    decisionsUsed: number;
    decisionsLimit: number;
    sessionsUsed: number;
    sessionsLimit: number;
    /** Data do último reset */
    resetAt: Date;
}

/** Perfil do usuário */
export interface UserProfile {
    id: string;
    email: string;
    displayName?: string;
    photoUrl?: string;
    /** Plano atual */
    plan: SubscriptionPlan;
    /** Preferências */
    preferences: UserPreferences;
    /** Limites (apenas Free) */
    limits?: UserLimits;
    /** Timestamps */
    createdAt: Date;
    updatedAt: Date;
}
