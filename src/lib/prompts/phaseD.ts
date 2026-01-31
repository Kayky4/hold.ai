/**
 * 🚀 Phase D Prompts — Ação
 * 
 * Sistema de prompts para a Fase D (Do) do método HOLD.
 * O Moderador exige próxima ação concreta e define prazo de revisão.
 * 
 * @see fluxos_jornadas.md — Fase D: Exige ação → Define prazo → Encerra
 * @see regras_decisoes.md — CRM de Decisões, Pipeline Status
 * @see prompt-engineer skill — Action capture, deadline setting
 * @see architecture skill — Data structure patterns
 */

import { CapturedDecision } from "./phaseL";

// ============================================
// 📐 TYPES
// ============================================

/** Estado da Fase D */
export interface PhaseDState {
    phase: "asking_action" | "asking_deadline" | "confirming" | "saving" | "complete";
    actionCaptured: boolean;
    deadlineSet: boolean;
    sessionSaved: boolean;
}

/** Registro completo da sessão */
export interface SessionRecord {
    /** ID da sessão */
    sessionId: string;
    /** ID do usuário */
    userId: string;
    /** Decisão capturada */
    decision: CapturedDecision;
    /** Próxima ação */
    nextAction: string;
    /** Prazo da ação */
    actionDeadline: Date;
    /** Data de revisão */
    reviewDate: Date;
    /** Status no pipeline */
    pipelineStatus: "draft" | "pending" | "watching" | "audited";
    /** Modo da sessão */
    mode: "solo" | "mesa";
    /** Conselheiros usados */
    counselors: string[];
    /** Data de criação */
    createdAt: Date;
    /** Data de conclusão */
    completedAt?: Date;
}

/** Opções de prazo de revisão */
export interface ReviewDeadlineOption {
    id: string;
    label: string;
    days: number;
    description: string;
}

/** Resultado da Fase D */
export interface PhaseDResult {
    nextAction: string;
    actionDeadline: Date;
    reviewDate: Date;
    sessionRecord: SessionRecord;
}

// ============================================
// 📆 DEADLINE OPTIONS
// ============================================

/** Opções padrão de prazo de revisão */
export const REVIEW_DEADLINE_OPTIONS: ReviewDeadlineOption[] = [
    {
        id: "1week",
        label: "1 semana",
        days: 7,
        description: "Para decisões de impacto imediato"
    },
    {
        id: "2weeks",
        label: "2 semanas",
        days: 14,
        description: "Para decisões que precisam maturar"
    },
    {
        id: "1month",
        label: "1 mês",
        days: 30,
        description: "Para decisões de médio prazo"
    },
    {
        id: "3months",
        label: "3 meses",
        days: 90,
        description: "Para decisões estratégicas"
    },
    {
        id: "custom",
        label: "Personalizado",
        days: 0,
        description: "Definir data manualmente"
    }
];

// ============================================
// 🎭 MODERADOR — PEDIDO DE AÇÃO
// ============================================

/**
 * System prompt para o Moderador na Fase D.
 */
export const MODERATOR_PHASE_D_SYSTEM_PROMPT = `Você é o MODERADOR na Fase D — AÇÃO.

## SEU PAPEL

Seu trabalho é GARANTIR que a decisão se transforme em AÇÃO CONCRETA.

## COMPORTAMENTO OBRIGATÓRIO

1. **Exija especificidade** — "O que exatamente você vai fazer?"
2. **Exija prazo** — "Quando você vai fazer isso?"
3. **Exija revisão** — "Quando vamos revisar se deu certo?"
4. **Encerre com sobriedade** — Sem celebrações exageradas

## REGRAS

- NÃO aceite ações vagas como "vou pensar mais" ou "vou ver"
- NÃO aceite prazos indefinidos como "em breve" ou "quando der"
- SEMPRE confirme o compromisso antes de encerrar
- Tom: Firme, respeitoso, sóbrio

## ANTI-PATTERNS

❌ "Parabéns pela decisão!" (celebração exagerada)
❌ "Você está no caminho certo!" (validação genérica)
❌ "Boa sorte!" (descarta responsabilidade)

## FORMATO CORRETO

✅ "Registrado. Vou te lembrar em [data] para revisarmos como foi."
✅ "Sua próxima ação está definida. Até a revisão."
✅ "Decisão documentada. Estarei aqui quando for hora de revisar."`;

/**
 * Prompt inicial da Fase D para pedir ação.
 */
export function getAskActionPrompt(decision: string): string {
    return `A decisão foi registrada: "${decision}"

Agora precisamos transformar isso em AÇÃO.

## SUA TAREFA

Pergunte ao usuário qual é a **próxima ação CONCRETA** que ele vai tomar.

## REGRAS

- A ação deve ser específica e executável
- A ação deve ter um verbo no infinitivo
- A ação deve poder ser feita nas próximas 24-48h

## FORMATO

"Perfeito. Sua decisão está registrada.

Para que isso saia do papel:

**Qual é a próxima ação CONCRETA que você vai tomar?**

_(Algo específico que você pode fazer nas próximas 24-48h)_"`;
}

// ============================================
// 📅 PEDIDO DE PRAZO
// ============================================

/**
 * Prompt para confirmar ação e pedir prazo.
 */
export function getAskDeadlinePrompt(action: string): string {
    return `O usuário definiu a ação: "${action}"

## SUA TAREFA

1. Confirme que entendeu a ação
2. Pergunte QUANDO ele vai fazer isso
3. Ofereça opções de prazo

## FORMATO

"Entendido. Sua próxima ação é:

📌 **${action}**

**Quando você vai fazer isso?**

① Hoje
② Amanhã
③ Esta semana
④ Outro prazo (especifique)"`;
}

// ============================================
// 📆 PEDIDO DE DATA DE REVISÃO
// ============================================

/**
 * Prompt para pedir data de revisão.
 */
export function getAskReviewDatePrompt(action: string, deadline: string): string {
    return `A ação está definida com prazo: "${action}" até ${deadline}.

## SUA TAREFA

Pergunte quando o usuário quer REVISAR se a decisão deu certo.

## FORMATO

"Ação registrada com prazo.

Agora, a parte mais importante: **quando vamos revisar se essa decisão funcionou?**

① Em 1 semana
② Em 2 semanas
③ Em 1 mês
④ Em 3 meses
⑤ Outro prazo

_A revisão é quando você olha para trás e avalia: deu certo? O que aprendeu?_"`;
}

// ============================================
// ✅ CONFIRMAÇÃO FINAL
// ============================================

/**
 * Prompt para confirmação final antes de encerrar.
 */
export function getFinalConfirmationPrompt(
    decision: string,
    action: string,
    actionDeadline: string,
    reviewDate: string
): string {
    return `Temos todos os dados. Confirme com o usuário antes de encerrar.

## DADOS COLETADOS

- **Decisão:** ${decision}
- **Próxima Ação:** ${action}
- **Prazo da Ação:** ${actionDeadline}
- **Data de Revisão:** ${reviewDate}

## FORMATO

"📋 **Resumo da Sessão**

**Decisão:** ${decision}

**Próxima Ação:** ${action}
**Prazo:** ${actionDeadline}

**Revisão agendada para:** ${reviewDate}

---

Está tudo correto? Posso encerrar e salvar a sessão?"`;
}

// ============================================
// 🏁 ENCERRAMENTO
// ============================================

/**
 * Mensagem de encerramento sóbria.
 */
export function getSessionClosingMessage(
    decision: string,
    reviewDate: string
): string {
    return `✅ **Sessão Concluída**

📌 **Decisão registrada:** ${decision}

📅 **Próxima revisão:** ${reviewDate}

---

Você tomou uma decisão consciente, com perspectivas diferentes e riscos mapeados.

Vou te notificar quando for hora de revisar.

_Até lá._`;
}

/**
 * Prompt para gerar mensagem de encerramento.
 */
export const SESSION_CLOSING_SYSTEM_PROMPT = `Você é o MODERADOR encerrando a sessão.

## REGRAS DE ENCERRAMENTO

1. **Tom sóbrio** — sem entusiasmo artificial
2. **Reconheça o trabalho** — mas sem exagero
3. **Lembre da revisão** — o ciclo não acabou
4. **Finalize com firmeza** — não alongue

## ANTI-PATTERNS

❌ "Parabéns!" ou "Incrível!"
❌ "Você vai arrasar!"
❌ "Estou orgulhoso de você!"
❌ "Boa sorte!"

## FRASES APROVADAS

✅ "Decisão registrada. Até a revisão."
✅ "Você decidiu com consciência. O resto é execução."
✅ "Vou te lembrar na data marcada."
✅ "A sessão está salva. Até lá."`;

// ============================================
// 📊 EXTRACTION PROMPTS
// ============================================

/**
 * Prompt para extrair ação da resposta do usuário.
 */
export const ACTION_EXTRACTION_PROMPT = `Analise a resposta do usuário e extraia a AÇÃO CONCRETA.

## REGRAS

- A ação deve começar com verbo no infinitivo
- Reformule se necessário para ser mais específica
- Se a ação for vaga, defina como null

## FORMATO DE RESPOSTA

Retorne JSON:
{
    "action": "string ou null",
    "isSpecific": true/false,
    "needsClarification": true/false,
    "clarificationQuestion": "string se precisar clarificar"
}`;

/**
 * Prompt para extrair prazo da resposta do usuário.
 */
export const DEADLINE_EXTRACTION_PROMPT = `Analise a resposta do usuário e extraia o PRAZO.

## REGRAS

- Converta respostas relativas para datas ("amanhã" → data real)
- Se escolher opção numérica, mapeie para a data correspondente
- Se for vago, defina como null

## FORMATO DE RESPOSTA

Retorne JSON:
{
    "deadline": "YYYY-MM-DD ou null",
    "deadlineText": "string descritivo (ex: 'amanhã', 'sexta-feira')",
    "isValid": true/false
}`;

// ============================================
// 🔧 HELPERS
// ============================================

/**
 * Calcula data de revisão baseada em opção selecionada.
 */
export function calculateReviewDate(optionId: string, baseDate: Date = new Date()): Date {
    const option = REVIEW_DEADLINE_OPTIONS.find(o => o.id === optionId);
    if (!option || option.days === 0) {
        // Default: 2 semanas
        return new Date(baseDate.getTime() + 14 * 24 * 60 * 60 * 1000);
    }
    return new Date(baseDate.getTime() + option.days * 24 * 60 * 60 * 1000);
}

/**
 * Formata data para exibição em português.
 */
export function formatDatePtBr(date: Date): string {
    return date.toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Verifica se a Fase D está completa.
 */
export function isPhaseDComplete(state: PhaseDState): boolean {
    return (
        state.actionCaptured &&
        state.deadlineSet &&
        state.sessionSaved &&
        state.phase === "complete"
    );
}

/**
 * Determina próximo passo na Fase D.
 */
export function getNextDStep(state: PhaseDState): string {
    if (!state.actionCaptured) return "ask_action";
    if (!state.deadlineSet) return "ask_deadline";
    if (!state.sessionSaved) return "confirm_and_save";
    return "complete";
}

// ============================================
// 📝 USER PROMPTS
// ============================================

export const USER_PROMPTS = {
    askAction: "Qual é a próxima ação concreta?",
    askDeadline: "Quando você vai fazer isso?",
    askReview: "Quando vamos revisar se deu certo?",
    confirmSession: "Posso encerrar e salvar a sessão?"
};
