/**
 * 🔄 Revision Prompts
 * 
 * Sistema de prompts para Modo Revisão de decisões.
 * Segue prompt-engineer skill patterns.
 * 
 * @see regras_decisoes.md — Revisão e Outcomes
 * @see fluxos_jornadas.md — Sistema de Decisões
 */

import { Decision, DecisionOutcome } from "@/types";

// ============================================
// 📐 TYPES
// ============================================

export interface RevisionState {
    /** Decisão sendo revisada */
    decision: Decision;
    /** Etapa atual da revisão */
    step: "presenting" | "asking_outcome" | "asking_explanation" | "asking_learning" | "confirming" | "complete";
    /** Outcome selecionado */
    outcome?: DecisionOutcome;
    /** Explicação do usuário */
    explanation?: string;
    /** Aprendizado capturado */
    learning?: string;
}

export interface RevisionResult {
    decisionId: string;
    outcome: DecisionOutcome;
    explanation: string;
    learning: string;
    reviewedAt: Date;
}

// ============================================
// 📝 SYSTEM PROMPTS
// ============================================

/**
 * Prompt base do Moderador em Modo Revisão
 */
export const REVISION_MODERATOR_SYSTEM = `Você é o Moderador do HoldAI em MODO REVISÃO.

CONTEXTO:
O usuário está revisando uma decisão passada para registrar o outcome.
Seu papel é GUIAR a reflexão de forma estruturada, sem julgamento.

TOM DE VOZ:
- Neutro e curioso (não julgador)
- Focado em aprendizado (não em certo/errado)
- Direto e objetivo (sem filosofar demais)
- Empático mas firme (não aceita respostas vagas)

REGRAS:
- ❌ NÃO julgar se a decisão foi boa ou ruim
- ❌ NÃO dizer "eu avisei" ou similar
- ❌ NÃO celebrar exageradamente sucessos
- ✅ Extrair aprendizados concretos
- ✅ Ajudar o usuário a articular o que aconteceu
- ✅ Manter foco no que é ÚTIL para decisões futuras

FORMATO:
- Respostas curtas e focadas
- Uma pergunta por vez
- Sem listas longas de opções`;

// ============================================
// 🎯 STEP PROMPTS
// ============================================

/**
 * Prompt para apresentar a decisão para revisão
 */
export function getPresentDecisionPrompt(decision: Decision): string {
    const formattedDate = new Date(decision.createdAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    const risksText = decision.acceptedRisks.length > 0
        ? decision.acceptedRisks.map(r => `• ${r}`).join('\n')
        : '(Nenhum risco explicitamente aceito)';

    const actionsText = decision.actions.length > 0
        ? decision.actions.map(a => `• ${a.description} ${a.completed ? '✅' : '⬜'}`).join('\n')
        : '(Nenhuma ação definida)';

    return `Você está iniciando a REVISÃO de uma decisão passada.

DECISÃO ORIGINAL:
Título: ${decision.title}
Data: ${formattedDate}
${decision.isCrisisDecision ? '⚠️ Esta foi uma decisão de CRISE.' : ''}

O QUE FOI DECIDIDO:
"${decision.decision}"

RACIOCÍNIO NA ÉPOCA:
"${decision.reasoning}"

RISCOS ACEITOS:
${risksText}

AÇÕES PLANEJADAS:
${actionsText}

---

Apresente este contexto ao usuário de forma resumida e pergunte:
"Qual foi o resultado dessa decisão?"

Ofereça as opções de forma clara:
1. ✅ Funcionou - deu certo como planejado
2. ⚠️ Parcial - funcionou em partes
3. ❌ Não funcionou - não deu certo
4. 🔄 Pivotei - mudei de direção

Seja breve. O usuário conhece a própria história.`;
}

/**
 * Prompt para explorar o outcome selecionado
 */
export function getExploreOutcomePrompt(outcome: DecisionOutcome, decision: Decision): string {
    const outcomeLabels: Record<DecisionOutcome, string> = {
        success: "funcionou",
        partial: "foi parcial",
        failure: "não funcionou",
        pending: "ainda está em andamento",
        pivoted: "você pivotou"
    };

    const outcomeQuestions: Record<DecisionOutcome, string> = {
        success: `Ótimo, a decisão deu certo.

O que você acha que foi DECISIVO para o sucesso?
(Seja específico — não queremos "esforço e dedicação", queremos o que REALMENTE fez diferença)`,

        partial: `Entendi, foi um resultado misto.

1. O que funcionou conforme esperado?
2. O que não saiu como planejado?

Comece pelo que funcionou.`,

        failure: `Obrigado pela honestidade. Vamos entender o que aconteceu.

A decisão não funcionou por:
1. A execução foi fora do planejado?
2. O cenário mudou de forma imprevisível?
3. A premissa original estava errada?

Qual dessas se aproxima mais da situação?`,

        pending: `A decisão ainda está em andamento. Isso é diferente de não ter funcionado.

Por que você está revisando agora?
1. Quer registrar progresso parcial?
2. Algo mudou e você quer reavaliar?
3. Chegou a data de revisão automática?`,

        pivoted: `Você mudou de direção. Isso é uma decisão em si.

O que motivou o pivot?
1. Nova informação surgiu?
2. O contexto mudou?
3. Percebeu que a premissa original estava errada?`
    };

    return `O usuário indicou que a decisão "${decision.title}" ${outcomeLabels[outcome]}.

${outcomeQuestions[outcome]}

Mantenha o tom neutro. Não julgue. Estamos aqui para aprender.`;
}

/**
 * Prompt para capturar aprendizado
 */
export function getCaptureLearningPrompt(outcome: DecisionOutcome): string {
    const learningPrompts: Record<DecisionOutcome, string> = {
        success: `Agora a pergunta mais importante:

**O que você aprendeu que pode aplicar em decisões futuras?**

Não precisa ser profundo. Um insight simples mas acionável vale mais que filosofia.`,

        partial: `Com base no que funcionou e no que não funcionou:

**O que você faria diferente se tomasse essa decisão hoje?**

Seja específico. "Planejar melhor" não é acionável. "Definir métricas antes de começar" é.`,

        failure: `Entendo. A decisão não saiu como planejado.

**Se você pudesse voltar no tempo, tomaria a mesma decisão?**

Se sim: o que aconteceu foi imprevisível ou execução ruim?
Se não: qual premissa estava errada?`,

        pending: `Como a decisão ainda está em andamento:

**O que você está observando até agora que influenciaria decisões similares?**`,

        pivoted: `O pivot é um sinal de adaptação, não de falha.

**O que você aprendeu que fez você mudar de direção?**
E: isso é algo que você poderia ter identificado antes?`
    };

    return learningPrompts[outcome];
}

/**
 * Prompt para confirmação final
 */
export function getConfirmationPrompt(
    decision: Decision,
    outcome: DecisionOutcome,
    explanation: string,
    learning: string
): string {
    const outcomeLabels: Record<DecisionOutcome, string> = {
        success: "✅ Sucesso",
        partial: "⚠️ Parcial",
        failure: "❌ Não funcionou",
        pending: "⏳ Em andamento",
        pivoted: "🔄 Pivotei"
    };

    return `RESUMO DA REVISÃO

Decisão: "${decision.title}"
Resultado: ${outcomeLabels[outcome]}

O QUE ACONTECEU:
"${explanation}"

APRENDIZADO:
"${learning}"

---

Confirme este registro com o usuário.
Se algo estiver incorreto, permita ajustes.
Se estiver tudo certo, finalize com tom sóbrio:

"Revisão registrada. Esse aprendizado ficará vinculado à decisão original."

❌ NÃO diga "parabéns" ou "ótimo trabalho"
✅ Seja direto e confirme que foi salvo`;
}

// ============================================
// 🔧 EXTRACTION PROMPTS
// ============================================

/**
 * Prompt para extrair outcome da resposta do usuário
 */
export const EXTRACT_OUTCOME_PROMPT = `Analise a resposta do usuário e identifique qual OUTCOME ele está indicando.

OPÇÕES:
- "success": A decisão funcionou, deu certo
- "partial": Funcionou em partes, resultado misto
- "failure": Não funcionou, deu errado
- "pending": Ainda em andamento, sem resultado final
- "pivoted": Mudou de direção, abandonou o plano original

Responda APENAS com uma destas palavras em lowercase: success, partial, failure, pending, pivoted

Se não conseguir identificar claramente, responda: unclear`;

/**
 * Prompt para extrair explicação estruturada
 */
export const EXTRACT_EXPLANATION_PROMPT = `Resuma a explicação do usuário sobre o que aconteceu com a decisão.

REGRAS:
- Máximo 2-3 frases
- Capture os FATOS principais
- Remova opinião e mantenha objetividade
- Se o usuário foi vago, indique "(explicação genérica)"

Responda apenas com o resumo, sem prefixo.`;

/**
 * Prompt para extrair aprendizado estruturado
 */
export const EXTRACT_LEARNING_PROMPT = `Transforme a reflexão do usuário em um APRENDIZADO acionável.

REGRAS:
- Uma frase clara e acionável
- Focada no FUTURO (o que fazer diferente)
- Se o usuário não teve insight, responda: "(sem aprendizado claro)"

EXEMPLOS BOM:
- "Definir métricas de sucesso antes de começar qualquer projeto"
- "Validar premissas com dados antes de escalar"
- "Delays são sinais, não exceções — agir mais cedo"

EXEMPLOS RUIM:
- "Planejar melhor" (vago)
- "Ter mais atenção" (não acionável)
- "Foi uma experiência" (não é aprendizado)

Responda apenas com o aprendizado, sem prefixo.`;

// ============================================
// 🎨 UTILITY FUNCTIONS
// ============================================

/**
 * Gera mensagem de lembrete de revisão
 */
export function getReviewReminderMessage(decision: Decision): string {
    const daysAgo = Math.floor(
        (Date.now() - new Date(decision.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    return `📅 **Lembrete de Revisão**

Há ${daysAgo} dias você tomou esta decisão:

"${decision.title}"

${decision.actions.length > 0
            ? `A ação planejada era: "${decision.actions[0].description}"`
            : ''}

**Qual foi o resultado?**`;
}

/**
 * Verifica se uma decisão precisa de revisão
 */
export function needsReview(decision: Decision): boolean {
    // Já foi revisada
    if (decision.outcome) return false;

    // Ainda está em draft
    if (decision.pipelineStatus === "draft") return false;

    // Verifica se passou da data de revisão
    const reviewDate = new Date(decision.reviewDate);
    const now = new Date();

    return now >= reviewDate;
}

/**
 * Calcula quantos dias faltam para revisão
 */
export function daysUntilReview(decision: Decision): number {
    const reviewDate = new Date(decision.reviewDate);
    const now = new Date();

    return Math.ceil((reviewDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Formata lista de decisões pendentes de revisão
 */
export function formatPendingReviewsList(decisions: Decision[]): string {
    if (decisions.length === 0) {
        return "Nenhuma decisão pendente de revisão.";
    }

    const lines = decisions.map((d, i) => {
        const days = daysUntilReview(d);
        const status = days < 0
            ? `🔴 Atrasado ${Math.abs(days)}d`
            : days === 0
                ? `🟡 Hoje`
                : `🟢 Em ${days}d`;

        return `${i + 1}. ${d.title} — ${status}`;
    });

    return `**Decisões para revisar:**\n\n${lines.join('\n')}`;
}
