/**
 * ⏸️ Session Resume Prompts
 * 
 * Prompts para recapitulação ao retomar sessões pausadas.
 * Segue fluxos_jornadas.md — Recapitulação ao Retomar Sessão.
 * 
 * @see fluxos_jornadas.md — Recapitulação ao Retomar Sessão
 * @see regras_decisoes.md — Política de Contexto
 */

import { Session, SessionPhase } from "@/types";

// ============================================
// 📐 TYPES
// ============================================

export type ResumeOption =
    | "continue"      // Continuar de onde parou
    | "recap"         // Recapitular antes de continuar
    | "restart";      // Reiniciar com novo contexto

export interface ResumeState {
    session: Session;
    option: ResumeOption | null;
    isRecapping: boolean;
}

// ============================================
// 📝 SYSTEM PROMPTS
// ============================================

/**
 * System prompt para Moderador em modo recapitulação
 */
export const RESUME_MODERATOR_SYSTEM = `Você é o Moderador do HoldAI recapitulando uma sessão pausada.

TOM DE VOZ:
- Acolhedor mas focado
- Conciso e direto
- Respeitoso com o tempo do usuário

REGRAS:
- ✅ Resumir em poucas frases (2-3 max)
- ✅ Destacar a fase atual e o último ponto
- ✅ Oferecer opções claras
- ❌ Não recapitular todo o histórico
- ❌ Não assumir contexto que não tem
- ❌ Não parecer robótico

FORMATO:
Usar markdown leve (bullets, bold) para organizar.`;

// ============================================
// 🎯 PROMPTS
// ============================================

/**
 * Gera mensagem de boas-vindas ao retomar sessão
 */
export function getResumeWelcomeMessage(session: Session): string {
    const phaseLabels: Record<SessionPhase, string> = {
        'H': 'Clarificação (H)',
        'O': 'Debate (O)',
        'L': 'Decisão (L)',
        'D': 'Ação (D)',
        'completed': 'Concluída',
        'paused': 'Pausada'
    };

    const currentPhase = phaseLabels[session.phase] || session.phase;

    // Calculate pause duration
    const pausedAt = session.pausedAt ? new Date(session.pausedAt) : null;
    const now = new Date();
    const daysPaused = pausedAt
        ? Math.floor((now.getTime() - pausedAt.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

    const durationText = daysPaused === 0
        ? "há algumas horas"
        : daysPaused === 1
            ? "ontem"
            : `há ${daysPaused} dias`;

    // Get last topic from context or messages
    const lastTopic = session.context?.problem || "o tema em discussão";

    return `Bem-vindo de volta. Você pausou esta sessão ${durationText}.

📋 **Decisão em discussão:** ${lastTopic}
🎯 **Fase atual:** ${currentPhase}

Você quer:
① **Continuar** de onde paramos
② **Recapitular** os pontos principais antes de continuar
③ **Reiniciar** a sessão com novo contexto`;
}

/**
 * Gera prompt para recapitulação completa
 */
export function getRecapPrompt(session: Session): string {
    const messagesPreview = session.messages.slice(-10).map(m => {
        const speaker = m.speakerName || m.speaker;
        return `[${speaker}]: ${m.content.substring(0, 200)}${m.content.length > 200 ? '...' : ''}`;
    }).join('\n');

    return `Recapitule esta sessão pausada para o usuário.

SESSÃO:
Título: ${session.title}
Fase Atual: ${session.phase}
Modo: ${session.mode}

CONTEXTO CAPTURADO:
${session.context?.summary || session.context?.problem || 'Não disponível'}

ÚLTIMAS MENSAGENS:
${messagesPreview}

---

TAREFA:
Faça uma recapitulação CONCISA (máximo 4-5 bullets) cobrindo:
1. O problema/decisão em discussão
2. Principais pontos levantados
3. Tensões ou divergências identificadas
4. Onde exatamente paramos

FORMATO:
Use bullets e bold para facilitar leitura rápida.
Termine com: "Pronto para continuar?"`;
}

/**
 * Prompt para quando usuário escolhe continuar diretamente
 */
export function getContinuePrompt(session: Session): string {
    const phaseContext: Record<SessionPhase, string> = {
        'H': `Estamos na Fase H (Clarificação). Continue fazendo perguntas para entender o contexto completo.`,
        'O': `Estamos na Fase O (Debate). Os conselheiros estavam debatendo. Retome o debate normalmente.`,
        'L': `Estamos na Fase L (Decisão). O usuário está escolhendo entre as alternativas.`,
        'D': `Estamos na Fase D (Ação). Estamos definindo a próxima ação concreta.`,
        'completed': `A sessão já foi concluída.`,
        'paused': `A sessão está pausada.`
    };

    return `O usuário escolheu continuar de onde parou.

${phaseContext[session.phase] || 'Continue a sessão normalmente.'}

Problema em discussão: "${session.context?.problem || 'Não especificado'}"

Retome naturalmente, sem repetir toda a recapitulação.
Uma frase de transição e depois continue o processo normal.`;
}

/**
 * Prompt para quando usuário quer reiniciar
 */
export function getRestartPrompt(session: Session): string {
    return `O usuário quer reiniciar a sessão com novo contexto.

Sessão anterior era sobre: "${session.context?.problem || 'Não especificado'}"

TAREFA:
1. Acknowledge que vamos recomeçar
2. Pergunte: "O que mudou? Ou você tem uma nova situação para discutir?"
3. Se o tema for o mesmo mas com novo contexto, capture as mudanças
4. Se for tema diferente, inicie Fase H normalmente

Mantenha tom acolhedor mas profissional.`;
}

// ============================================
// 🔧 UTILITY FUNCTIONS
// ============================================

/**
 * Calcula estatísticas de uma sessão pausada
 */
export function getSessionStats(session: Session) {
    const messageCount = session.messages.length;
    const userMessages = session.messages.filter(m => m.speaker === 'user').length;
    const counselorMessages = session.messages.filter(m =>
        m.speaker !== 'user' && m.speaker !== 'moderator'
    ).length;

    const createdAt = new Date(session.createdAt);
    const pausedAt = session.pausedAt ? new Date(session.pausedAt) : new Date(session.updatedAt);
    const durationMs = pausedAt.getTime() - createdAt.getTime();
    const durationMinutes = Math.floor(durationMs / (1000 * 60));

    return {
        messageCount,
        userMessages,
        counselorMessages,
        durationMinutes,
        phase: session.phase,
        mode: session.mode
    };
}

/**
 * Gera preview de uma sessão para a lista
 */
export function getSessionPreview(session: Session): string {
    const problem = session.context?.problem || session.title;

    // Truncate if too long
    if (problem.length > 80) {
        return problem.substring(0, 77) + '...';
    }

    return problem;
}

/**
 * Formata tempo relativo
 */
export function formatRelativeTime(date: Date | string): string {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) {
        return diffMinutes <= 1 ? 'agora mesmo' : `${diffMinutes} minutos atrás`;
    } else if (diffHours < 24) {
        return diffHours === 1 ? '1 hora atrás' : `${diffHours} horas atrás`;
    } else if (diffDays < 7) {
        return diffDays === 1 ? 'ontem' : `${diffDays} dias atrás`;
    } else {
        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    }
}
