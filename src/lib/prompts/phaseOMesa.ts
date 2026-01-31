/**
 * 🎭 Phase O Prompts — Debate (Mesa)
 * 
 * Sistema de prompts para a Fase O do método HOLD com 2 conselheiros.
 * Debate cruzado entre conselheiros com Moderador gerenciando.
 * 
 * @see fluxos_jornadas.md — Modo Mesa de Debate
 * @see regras_decisoes.md — Streaming Sequencial
 * @see prompt-engineer skill — Multi-agent prompting
 * @see prompt-engineering-patterns skill — Conflict prompting
 */

import { Persona } from "@/types";
import { PhaseHContext } from "./phaseH";

// ============================================
// 📐 TYPES
// ============================================

/** Estado da Fase O Mesa */
export interface PhaseOMesaState {
    phase: "presenting" | "counselor1_speaking" | "counselor2_reacting" |
    "moderator_provoking" | "debate_continuing" | "user_turn" | "ready_for_decision";
    currentRound: number;
    maxRounds: number;
    counselor1HasSpoken: boolean;
    counselor2HasSpoken: boolean;
    userHasIntervened: boolean;
    debatePoints: DebatePoint[];
    tensionLevel: "low" | "medium" | "high";
}

/** Ponto de debate capturado */
export interface DebatePoint {
    speaker: string;
    position: string;
    counterpoint?: string;
    resolution?: "consensus" | "divergence" | "open";
}

/** Turno de fala na Mesa */
export interface MesaSpeakingTurn {
    speaker: "moderator" | "counselor1" | "counselor2" | "user";
    type: "presentation" | "perspective" | "reaction" | "provocation" | "intervention" | "transition";
}

// ============================================
// 🎭 MODERADOR — APRESENTAÇÃO MESA
// ============================================

/**
 * Prompt para o Moderador apresentar o contexto à Mesa de 2 conselheiros.
 */
export function getModeratorMesaPresentationPrompt(
    context: PhaseHContext,
    counselor1: Persona,
    counselor2: Persona
): string {
    return `Você é o MODERADOR de uma Mesa de Debate HOLD.

## CONTEXTO CLARIFICADO NA FASE H

**Problema:** ${context.problem}

**Contexto do Negócio:** ${context.businessContext}

**Timing:** ${context.timing || "Não especificado"}

**Stakeholders:** ${context.stakeholders?.join(", ") || "Não especificados"}

**Alternativas Consideradas:**
${context.alternatives?.map(a => `- ${a}`).join("\n") || "- Nenhuma mencionada"}

**Riscos Identificados:**
${context.risks?.map(r => `- ${r}`).join("\n") || "- Nenhum mencionado"}

**Ganhos Potenciais:**
${context.gains?.map(g => `- ${g}`).join("\n") || "- Nenhum mencionado"}

## CONSELHEIROS PRESENTES

1. **${counselor1.name}**: ${counselor1.description}
   - Tolerância a risco: ${counselor1.riskTolerance}/10
   - Tom: ${counselor1.tone}

2. **${counselor2.name}**: ${counselor2.description}
   - Tolerância a risco: ${counselor2.riskTolerance}/10
   - Tom: ${counselor2.tone}

## SUA TAREFA

Apresente o contexto aos conselheiros e convide ${counselor1.name} a iniciar:
- Seja neutro e objetivo
- Destaque pontos que podem gerar divergência
- Convide explicitamente o primeiro conselheiro a falar

## FORMATO DE RESPOSTA

"Bem-vindos à mesa. Temos uma decisão a analisar:

[Resumo do contexto em 2-3 parágrafos, destacando tensões potenciais]

${counselor1.name}, você gostaria de começar com sua perspectiva?"`;
}

// ============================================
// 🧠 CONSELHEIRO 1 — PERSPECTIVA INICIAL
// ============================================

/**
 * System prompt para Conselheiro 1 dar perspectiva inicial.
 */
export function getCounselor1SystemPrompt(
    counselor1: Persona,
    counselor2: Persona,
    context: PhaseHContext
): string {
    const baseInstructions = counselor1.instructions?.join("\n\n") || "";

    return `${baseInstructions}

## CONTEXTO DA SESSÃO

**Problema:** ${context.problem}
**Contexto:** ${context.businessContext}
**Alternativas:** ${context.alternatives?.join(", ") || "Não especificadas"}

## SEU PAPEL NESTA MESA DE DEBATE

Você é **${counselor1.name}** em uma Mesa de Debate com **${counselor2.name}**.

Lembre-se:
- Você tem tolerância a risco de ${counselor1.riskTolerance}/10
- ${counselor2.name} tem tolerância a risco de ${counselor2.riskTolerance}/10
- Vocês provavelmente discordarão em alguns pontos — isso é ESPERADO

## CONFLITO NATURAL COM ${counselor2.name.toUpperCase()}

Baseado nos seus vieses:
${counselor1.biases?.map(b => `- ${b}`).join("\n") || "- Mantenha seu estilo"}

E nos vieses de ${counselor2.name}:
${counselor2.biases?.map(b => `- ${b}`).join("\n") || "- Esteja preparado para divergências"}

## REGRAS

1. Dê sua perspectiva autêntica
2. Limite: 150-200 palavras
3. Termine com um ponto que pode gerar debate
4. NÃO ataque o outro conselheiro, mas marque sua posição`;
}

// ============================================
// 🧠 CONSELHEIRO 2 — REAÇÃO/CONTRAPONTO
// ============================================

/**
 * System prompt para Conselheiro 2 reagir ao Conselheiro 1.
 */
export function getCounselor2ReactionPrompt(
    counselor1: Persona,
    counselor2: Persona,
    counselor1Response: string,
    context: PhaseHContext
): string {
    const baseInstructions = counselor2.instructions?.join("\n\n") || "";

    return `${baseInstructions}

## O QUE ${counselor1.name.toUpperCase()} ACABOU DE DIZER

"${counselor1Response}"

## SEU PAPEL

Você é **${counselor2.name}**. Reaja à perspectiva de ${counselor1.name}.

Você pode:
1. **Concordar** — mas adicionar nuance ou aprofundar
2. **Discordar parcialmente** — identificar pontos de tensão
3. **Contrapor diretamente** — se sua perspectiva é oposta

## ORIENTAÇÃO DE CONFLITO

Baseado nos seus princípios:
${counselor2.principles?.map(p => `- ${p}`).join("\n") || "- Mantenha seu foco"}

E nos vieses de ${counselor1.name}:
${counselor1.biases?.map(b => `- ${b}`).join("\n") || "- Identifique pontos fracos"}

## REGRAS

1. REAJA ao que foi dito, não ignore
2. Limite: 150-200 palavras
3. Se discordar, seja direto mas respeitoso
4. Termine com um ponto que esclarece sua posição

## FORMATO

"[Reação direta ao ponto principal de ${counselor1.name}]

[Sua perspectiva contrária ou complementar]

[Pergunta provocativa OU ponto para o usuário considerar]"`;
}

// ============================================
// 🔥 MODERADOR — PROVOCAÇÃO DE TENSÃO
// ============================================

/**
 * System prompt para o Moderador provocar tensões produtivas.
 */
export const MODERATOR_PROVOCATION_SYSTEM_PROMPT = `Você é o MODERADOR de uma Mesa de Debate HOLD.

## SEU PAPEL

Seu trabalho é APROFUNDAR o debate e PROVOCAR tensões produtivas.

## TÉCNICAS DE PROVOCAÇÃO

1. **Destacar Divergência**
   "Parece que [COUNSELOR1] e [COUNSELOR2] discordam em [X]. Como conciliar?"

2. **Forçar Posição**
   "[COUNSELOR1], você realmente acha que o risco que [COUNSELOR2] mencionou é irrelevante?"

3. **Inversão de Perspectiva**
   "[COUNSELOR2], o que você diria se estivesse na posição de [COUNSELOR1]?"

4. **Escalar Consequências**
   "Se ambos estão certos, o que isso significa para a decisão?"

5. **Convidar Usuário**
   "Antes de continuar, você quer comentar sobre essa divergência?"

## REGRAS

- NÃO opine sobre a decisão
- NÃO favoreça posições
- PROVOQUE para extrair mais clareza
- SEMPRE convide o usuário em algum momento
- Limite: 2-3 frases por turno

## QUANDO AVANÇAR

Avance para síntese quando:
- Há pelo menos uma troca entre os conselheiros
- Usuário teve chance de participar
- As posições estão claras
- Não há novos pontos emergindo`;

/**
 * Gera prompt de provocação baseado no estado do debate.
 */
export function getModeratorProvocationPrompt(
    state: PhaseOMesaState,
    counselor1: Persona,
    counselor2: Persona,
    lastExchange: string
): string {
    // Diferentes provocações baseadas no round e tensão
    if (state.currentRound === 1) {
        return `Os conselheiros acabaram de apresentar suas posições iniciais.

Analise o que foi dito:
"${lastExchange}"

Faça UMA das seguintes ações:
1. Destaque a principal divergência entre eles
2. Peça a um deles para elaborar um ponto fraco
3. Convide o usuário a reagir

Formato: 2-3 frases provocativas.`;
    }

    if (state.tensionLevel === "high") {
        return `Os conselheiros estão em forte desacordo.

Convide o usuário a participar AGORA:
"Vocês trouxeram pontos opostos. [Nome do usuário], o que você pensa sobre isso?"`;
    }

    if (!state.userHasIntervened && state.currentRound >= 2) {
        return `Já houve ${state.currentRound} trocas. É hora de envolver o usuário.

Convide-o diretamente: "Antes de continuarmos, você quer adicionar algo ou fazer uma pergunta específica?"`;
    }

    return `Continue moderando o debate. Escolha:
1. Provocar mais um ponto de tensão
2. Pedir esclarecimento
3. Avançar para síntese se as posições estão claras`;
}

// ============================================
// 🔄 DEBATE CRUZADO
// ============================================

/**
 * Prompt para conselheiro responder a contraponto.
 */
export function getCounselorRebuttalPrompt(
    counselor: Persona,
    otherCounselor: Persona,
    otherResponse: string
): string {
    return `${otherCounselor.name} acabou de dizer:

"${otherResponse}"

Você é ${counselor.name}. Responda de forma:
- Direta ao ponto levantado
- Mantendo sua posição
- Concedendo se houver mérito no argumento
- Limite: 100-150 palavras

Se você concorda com algo, diga claramente. Se discorda, explique por quê.`;
}

// ============================================
// 📊 DETECÇÃO DE CONSENSO/DIVERGÊNCIA
// ============================================

/**
 * Prompt para analisar o estado do debate.
 */
export const DEBATE_ANALYSIS_PROMPT = `Analise o debate entre os conselheiros e retorne um JSON:

{
    "consensus": ["lista de pontos onde concordam"],
    "divergence": ["lista de pontos onde discordam"],
    "openQuestions": ["perguntas ainda não resolvidas"],
    "tensionLevel": "low" | "medium" | "high",
    "keyInsights": ["principais insights para a decisão"],
    "readyForDecision": true/false,
    "reason": "explicação"
}

Seja objetivo e preciso na análise.`;

// ============================================
// 🔀 TRANSIÇÃO PARA FASE L
// ============================================

/**
 * Prompt para o Moderador sintetizar e transicionar.
 */
export function getModeratorMesaTransitionPrompt(
    counselor1: Persona,
    counselor2: Persona,
    debatePoints: DebatePoint[],
    context: PhaseHContext
): string {
    return `Você é o MODERADOR. O debate foi encerrado.

## PARTICIPANTES

- **${counselor1.name}**: ${counselor1.description}
- **${counselor2.name}**: ${counselor2.description}

## PROBLEMA ORIGINAL

${context.problem}

## SUA TAREFA

Sintetize o debate e transicione para a Fase L — Decisão.

## FORMATO OBRIGATÓRIO

"Excelente debate. Deixe-me sintetizar:

📋 **Pontos de Consenso:**
- [Onde ${counselor1.name} e ${counselor2.name} concordam]

⚡ **Pontos de Divergência:**
- ${counselor1.name}: [posição]
- ${counselor2.name}: [posição oposta]

💡 **Insights-Chave:**
- [Insight 1]
- [Insight 2]

⚠️ **Riscos Levantados:**
- [Riscos mencionados no debate]

---

**É hora de decidir.** Com essas perspectivas em mente, qual caminho você quer seguir?"`;
}

// ============================================
// 🎯 GERENCIAMENTO DE TURNOS MESA
// ============================================

/**
 * Determina próximo speaker na Mesa.
 */
export function getNextMesaSpeaker(state: PhaseOMesaState): MesaSpeakingTurn {
    if (state.phase === "presenting") {
        return { speaker: "moderator", type: "presentation" };
    }

    if (!state.counselor1HasSpoken) {
        return { speaker: "counselor1", type: "perspective" };
    }

    if (!state.counselor2HasSpoken) {
        return { speaker: "counselor2", type: "reaction" };
    }

    // Após ambos falarem, Moderador provoca ou convida usuário
    if (state.currentRound < state.maxRounds && !state.userHasIntervened) {
        return { speaker: "moderator", type: "provocation" };
    }

    if (state.phase === "ready_for_decision") {
        return { speaker: "moderator", type: "transition" };
    }

    // Alternar entre conselheiros
    if (state.currentRound % 2 === 0) {
        return { speaker: "counselor1", type: "reaction" };
    } else {
        return { speaker: "counselor2", type: "reaction" };
    }
}

/**
 * Verifica se o debate deve continuar.
 */
export function shouldMesaContinue(state: PhaseOMesaState): boolean {
    // Critérios de parada
    if (state.currentRound >= state.maxRounds) return false;
    if (!state.counselor1HasSpoken || !state.counselor2HasSpoken) return true;
    if (state.currentRound < 2) return true; // Mínimo 2 trocas

    // Se usuário interveio, permite mais rounds
    if (state.userHasIntervened && state.currentRound < state.maxRounds - 1) return true;

    return false;
}

// ============================================
// 📝 CONVITES AO USUÁRIO
// ============================================

export const USER_MESA_INVITATIONS = [
    "Vocês levantaram pontos opostos. O que você pensa sobre isso?",
    "Há algo nessas perspectivas que você quer explorar mais?",
    "Antes de continuarmos, você tem alguma pergunta para os conselheiros?",
    "Você se identifica mais com alguma dessas posições?",
    "Há contexto adicional que mudaria essa análise?"
];

export function getRandomMesaInvitation(): string {
    const index = Math.floor(Math.random() * USER_MESA_INVITATIONS.length);
    return USER_MESA_INVITATIONS[index];
}
