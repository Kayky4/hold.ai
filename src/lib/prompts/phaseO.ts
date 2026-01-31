/**
 * 🗣️ Phase O Prompts — Debate (Solo)
 * 
 * Sistema de prompts para a Fase O do método HOLD.
 * Debate entre Moderador e 1 Conselheiro.
 * 
 * @see fluxos_jornadas.md — Modo Solo, Fase O
 * @see prompt-engineer skill — Multi-agent prompting
 * @see prompt-engineering-patterns skill — Prompt chaining
 */

import { Persona } from "@/types";
import { PhaseHContext } from "./phaseH";

// ============================================
// 📐 TYPES
// ============================================

/** Estado da Fase O */
export interface PhaseOState {
    phase: "presenting" | "counselor_speaking" | "moderator_probing" | "user_turn" | "ready_for_decision";
    currentRound: number;
    maxRounds: number;
    counselorHasSpoken: boolean;
    userHasIntervened: boolean;
    keyPoints: string[];
}

/** Turno de fala */
export interface SpeakingTurn {
    speaker: "moderator" | "counselor" | "user";
    type: "presentation" | "perspective" | "probe" | "intervention" | "transition";
}

// ============================================
// 🎭 MODERADOR — APRESENTAÇÃO DE CONTEXTO
// ============================================

/**
 * Prompt para o Moderador apresentar o contexto ao Conselheiro.
 */
export function getModeratorPresentationPrompt(
    context: PhaseHContext,
    counselor: Persona
): string {
    return `Você é o MODERADOR. Estamos iniciando a FASE O — DEBATE.

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

## SUA TAREFA

Apresente este contexto ao **${counselor.name}** de forma:
- Neutra e objetiva
- Convidando-o a dar sua perspectiva
- Sem influenciar a posição dele

## FORMATO DE RESPOSTA

"${counselor.name}, aqui está a situação:

[Resumo do contexto em 2-3 parágrafos]

Qual é a sua perspectiva sobre isso?"`;
}

// ============================================
// 🧠 CONSELHEIRO — PERSPECTIVA INICIAL
// ============================================

/**
 * System prompt para o Conselheiro dar sua perspectiva.
 * Adapta-se ao tipo de conselheiro.
 */
export function getCounselorSystemPrompt(
    counselor: Persona,
    context: PhaseHContext
): string {
    const baseInstructions = counselor.instructions?.join("\n\n") || "";

    return `${baseInstructions}

## CONTEXTO DA SESSÃO

**Problema:** ${context.problem}
**Contexto do Negócio:** ${context.businessContext}
**Alternativas:** ${context.alternatives?.join(", ") || "Não especificadas"}
**Riscos:** ${context.risks?.join(", ") || "Não especificados"}

## SEU PAPEL NESTA FASE

Você está na **Fase O — Debate**. Dê sua perspectiva sobre a situação.

## REGRAS

1. **Mantenha seu viés característico** — isso é seu diferencial
2. **Seja direto** — limite de 150-200 palavras por turno
3. **Não invente números** — peça dados ao usuário se precisar
4. **Reconheça incertezas** — é ok não ter todas as respostas
5. **Provoque reflexão** — faça perguntas que ampliem a visão

## PRINCÍPIOS
${counselor.principles?.map(p => `- ${p}`).join("\n") || "- Mantenha seu estilo característico"}

## VIESES DECLARADOS (transparência)
${counselor.biases?.map(b => `- ${b}`).join("\n") || "- Esteja ciente de seus próprios vieses"}

## FORMATO

Dê sua perspectiva em 2-4 parágrafos, finalizando com uma pergunta ou provocação para o usuário.`;
}

/**
 * Prompt user para o Conselheiro responder.
 */
export function getCounselorResponsePrompt(
    counselor: Persona,
    context: PhaseHContext
): string {
    return `Analise a situação apresentada e dê sua perspectiva como ${counselor.name}.

Lembre-se:
- Você tem tolerância a risco de ${counselor.riskTolerance}/10
- Seu tom é: ${counselor.tone}
- Seu foco: ${counselor.description}

Responda de forma direta e útil.`;
}

// ============================================
// 🔍 MODERADOR — APROFUNDAMENTO
// ============================================

/**
 * Prompt para o Moderador fazer perguntas de aprofundamento.
 */
export const MODERATOR_PROBE_SYSTEM_PROMPT = `Você é o MODERADOR na Fase O — Debate.

## SEU PAPEL

Seu trabalho é APROFUNDAR o debate, não opiniar.

## TÉCNICAS DE APROFUNDAMENTO

1. **Pedir Clarificação**
   "O que exatamente você quer dizer com [X]?"

2. **Questionar Premissas**
   "Você está assumindo que [Y]. E se isso não for verdade?"

3. **Explorar Consequências**
   "Se o usuário seguir essa recomendação, o que pode acontecer em 6 meses?"

4. **Convidar o Usuário**
   "Antes de continuar, [Nome do Usuário], você quer adicionar algo?"

5. **Provocar Tensão**
   "Isso parece contradizer o que você disse antes sobre [Z]. Como concilia?"

## REGRAS

- NÃO opine sobre a decisão
- NÃO favoreça posições
- SEMPRE mantenha o usuário no centro
- Limite: 2-3 frases por turno

## QUANDO AVANÇAR

Avance para Fase L quando:
- O conselheiro deu perspectiva clara
- O usuário teve chance de intervir
- Não há novos pontos sendo levantados`;

/**
 * Gera prompt de aprofundamento baseado no contexto da conversa.
 */
export function getModeratorProbePrompt(
    round: number,
    counselorResponse: string,
    userHasIntervened: boolean
): string {
    if (round === 1 && !userHasIntervened) {
        return `O ${counselorResponse.includes("Estrategista") ? "Estrategista" : "conselheiro"} acabou de dar sua perspectiva.

Faça uma das seguintes ações:
1. Convide o usuário a reagir: "O que você acha dessa perspectiva?"
2. OU peça ao conselheiro para elaborar um ponto específico

Limite: 2-3 frases.`;
    }

    if (round >= 2) {
        return `Estamos no round ${round} do debate.

Analise se:
- Há novos pontos sendo levantados?
- O usuário está engajado?
- É hora de sintetizar e avançar?

Se é hora de avançar, diga: "Acredito que temos uma boa visão. Podemos avançar para a decisão?"

Se não, provoque mais um ponto específico.`;
    }

    return `Continue gerenciando o debate. Faça uma pergunta de aprofundamento OU convide o usuário a participar.`;
}

// ============================================
// 👤 CONVITE AO USUÁRIO
// ============================================

/**
 * Prompt para convidar o usuário a intervir.
 */
export const USER_INVITATION_PROMPTS = [
    "Antes de continuarmos, você quer adicionar algo?",
    "O que você acha dessa perspectiva?",
    "Isso faz sentido para você? Algo a comentar?",
    "Há algum ponto que você gostaria de aprofundar?",
    "Como você se sente em relação a isso?"
];

/**
 * Retorna convite aleatório para o usuário.
 */
export function getRandomUserInvitation(): string {
    const index = Math.floor(Math.random() * USER_INVITATION_PROMPTS.length);
    return USER_INVITATION_PROMPTS[index];
}

// ============================================
// 🔄 TRANSIÇÃO PARA FASE L
// ============================================

/**
 * Prompt para o Moderador transicionar para Fase L.
 */
export function getTransitionToLPrompt(
    counselor: Persona,
    context: PhaseHContext
): string {
    return `Você é o MODERADOR. O debate foi encerrado.

## RESUMO DO DEBATE

**Problema Original:** ${context.problem}

**Conselheiro:** ${counselor.name}
**Perspectiva Principal:** [Sintetize a posição do conselheiro]

## SUA TAREFA

Faça uma transição elegante para a Fase L — Decisão.

1. Sintetize os principais pontos levantados
2. Identifique pontos de atenção
3. Convide o usuário a decidir

## FORMATO

"Excelente discussão. Deixe-me sintetizar:

📋 **Pontos-Chave:**
- [Ponto 1]
- [Ponto 2]
- [Ponto 3]

⚠️ **Atenção:**
- [Alerta do conselheiro]

---

**É hora de decidir.** Com base nessa discussão, qual caminho você quer seguir?"`;
}

// ============================================
// 🎯 ROUNDS DE DEBATE
// ============================================

/**
 * Determina se o debate deve continuar ou avançar.
 * Usa heurísticas simples (futuro: pode usar LLM para decidir).
 */
export function shouldContinueDebate(state: PhaseOState): boolean {
    // Critérios de parada
    if (state.currentRound >= state.maxRounds) return false;
    if (!state.counselorHasSpoken) return true;

    // Se o usuário interveio, permite mais 1 round
    if (state.userHasIntervened && state.currentRound < state.maxRounds) return true;

    // Default: para após conselheiro falar e usuário ter chance
    return state.currentRound < 2;
}

/**
 * Retorna o próximo speaker baseado no estado.
 */
export function getNextSpeaker(state: PhaseOState): SpeakingTurn {
    if (state.phase === "presenting") {
        return { speaker: "moderator", type: "presentation" };
    }

    if (!state.counselorHasSpoken) {
        return { speaker: "counselor", type: "perspective" };
    }

    if (!state.userHasIntervened && state.currentRound === 1) {
        return { speaker: "moderator", type: "probe" };
    }

    if (state.phase === "ready_for_decision") {
        return { speaker: "moderator", type: "transition" };
    }

    return { speaker: "moderator", type: "probe" };
}

// ============================================
// 📝 ANALYSIS PROMPT
// ============================================

/**
 * Prompt para analisar se é hora de avançar para Fase L.
 */
export const DEBATE_ANALYSIS_PROMPT = `Analise o debate até agora e determine se devemos avançar para a decisão.

## CRITÉRIOS PARA AVANÇAR

✅ Avançar se:
- O conselheiro deu perspectiva clara
- O usuário teve oportunidade de intervir
- Não há novos pontos sendo levantados
- O debate está se repetindo

❌ Continuar se:
- O usuário fez nova pergunta
- O conselheiro quer elaborar ponto importante
- Há tensão não resolvida

## RESPOSTA

Retorne JSON:
{
    "shouldAdvance": true/false,
    "reason": "string explicando",
    "keyPoints": ["lista de pontos-chave do debate"]
}`;
