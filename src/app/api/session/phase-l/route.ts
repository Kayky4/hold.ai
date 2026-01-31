import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";
import {
    MODERATOR_SYNTHESIS_SYSTEM_PROMPT,
    getDebateSynthesisPrompt,
    DECISION_CAPTURE_SYSTEM_PROMPT,
    getDecisionConfirmationPrompt,
    REASONING_CAPTURE_PROMPT,
    getReasoningExtractionPrompt,
    DEFER_DECISION_PROMPT,
    getTransitionToDPrompt,
    DECISION_EXTRACTION_PROMPT,
    CapturedDecision,
    PhaseLState
} from "@/lib/prompts/phaseL";
import { PhaseHContext } from "@/lib/prompts/phaseH";
import { Persona } from "@/types";

// ============================================
// 📐 CONFIG
// ============================================

const ALLOWED_MODELS = ["gemini-2.5-flash-lite", "gemini-3-flash-preview"];
const DEFAULT_MODEL = "gemini-2.5-flash-lite";

// ============================================
// 📤 POST — Phase L with Streaming
// ============================================

export async function POST(request: NextRequest) {
    try {
        const {
            messages,
            counselors,
            context,
            phaseState,
            debateHistory,
            userChoice,
            userReasoning,
            risksFromDebate,
            model: requestedModel,
            action = "synthesize"
            // Actions: "synthesize" | "present_options" | "confirm_decision" | 
            //          "capture_reasoning" | "defer" | "extract_decision" | "transition" | "chat"
        } = await request.json();

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return new Response(
                JSON.stringify({ error: "GEMINI_API_KEY not configured" }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        const selectedModel = ALLOWED_MODELS.includes(requestedModel) ? requestedModel : DEFAULT_MODEL;
        const genAI = new GoogleGenerativeAI(apiKey);

        console.log("[phase-l API] Action:", action);

        // Handle different actions
        switch (action) {
            case "synthesize":
                return await handleSynthesis(genAI, selectedModel, context, counselors, debateHistory);

            case "present_options":
                return await handlePresentOptions(genAI, selectedModel, context, messages);

            case "confirm_decision":
                return await handleConfirmDecision(genAI, selectedModel, userChoice, context, risksFromDebate);

            case "capture_reasoning":
                return await handleCaptureReasoning(genAI, selectedModel, messages);

            case "defer":
                return await handleDefer(genAI, selectedModel);

            case "extract_decision":
                return await handleExtractDecision(genAI, selectedModel, messages);

            case "transition":
                return await handleTransition(genAI, selectedModel);

            default:
                return await handleChat(genAI, selectedModel, context, messages);
        }

    } catch (error: unknown) {
        console.error("Error in phase-l API:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return new Response(
            JSON.stringify({ error: "Failed to generate response", details: errorMessage }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}

// ============================================
// 📊 SYNTHESIS HANDLER
// ============================================

async function handleSynthesis(
    genAI: GoogleGenerativeAI,
    modelName: string,
    context: PhaseHContext,
    counselors: Persona[],
    debateHistory: string
): Promise<Response> {
    console.log("[phase-l API] Generating synthesis...");

    const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: MODERATOR_SYNTHESIS_SYSTEM_PROMPT,
    });

    const prompt = getDebateSynthesisPrompt(context, counselors, debateHistory);

    return streamResponse(model, prompt);
}

// ============================================
// 🎯 PRESENT OPTIONS HANDLER
// ============================================

async function handlePresentOptions(
    genAI: GoogleGenerativeAI,
    modelName: string,
    context: PhaseHContext,
    messages: { role: string; content: string }[]
): Promise<Response> {
    console.log("[phase-l API] Presenting options...");

    const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: MODERATOR_SYNTHESIS_SYSTEM_PROMPT,
    });

    const history = messages.map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({ history });

    const prompt = `Baseado na síntese, apresente as opções de decisão para o usuário de forma clara e equilibrada.
    
Lembre-se:
- Não recomende nenhuma opção
- Inclua "Adiar decisão" como opção
- Destaque riscos de cada caminho

Finalize perguntando: "Qual caminho você escolhe?"`;

    return streamResponse(chat, prompt, true);
}

// ============================================
// ✅ CONFIRM DECISION HANDLER
// ============================================

async function handleConfirmDecision(
    genAI: GoogleGenerativeAI,
    modelName: string,
    userChoice: string,
    context: PhaseHContext,
    risksFromDebate: string[]
): Promise<Response> {
    console.log("[phase-l API] Confirming decision:", userChoice);

    const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: DECISION_CAPTURE_SYSTEM_PROMPT,
    });

    const prompt = getDecisionConfirmationPrompt(userChoice, context, risksFromDebate || []);

    return streamResponse(model, prompt);
}

// ============================================
// 🧠 CAPTURE REASONING HANDLER
// ============================================

async function handleCaptureReasoning(
    genAI: GoogleGenerativeAI,
    modelName: string,
    messages: { role: string; content: string }[]
): Promise<Response> {
    console.log("[phase-l API] Capturing reasoning...");

    const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: REASONING_CAPTURE_PROMPT,
    });

    const history = messages.map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({ history });

    const prompt = `O usuário confirmou a decisão. 
Pergunte de forma suave por que ele escolheu esse caminho.
Limite: 2-3 frases.`;

    return streamResponse(chat, prompt, true);
}

// ============================================
// ⏸️ DEFER HANDLER
// ============================================

async function handleDefer(
    genAI: GoogleGenerativeAI,
    modelName: string
): Promise<Response> {
    console.log("[phase-l API] Handling defer...");

    const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: "Você é o Moderador. O usuário quer adiar a decisão.",
    });

    return streamResponse(model, DEFER_DECISION_PROMPT);
}

// ============================================
// 📋 EXTRACT DECISION HANDLER
// ============================================

async function handleExtractDecision(
    genAI: GoogleGenerativeAI,
    modelName: string,
    messages: { role: string; content: string }[]
): Promise<Response> {
    console.log("[phase-l API] Extracting decision...");

    const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: "Você extrai informações estruturadas de conversas.",
    });

    const conversationText = messages
        .map(m => `${m.role === "user" ? "USUÁRIO" : "MODERADOR"}: ${m.content}`)
        .join("\n\n");

    const prompt = `${DECISION_EXTRACTION_PROMPT}

=== CONVERSA ===
${conversationText}
=== FIM ===`;

    try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Try to parse JSON
        let decision: Partial<CapturedDecision> = {};
        try {
            const jsonMatch = responseText.match(/```json?\s*([\s\S]*?)\s*```/);
            const jsonStr = jsonMatch ? jsonMatch[1] : responseText;
            decision = JSON.parse(jsonStr);
        } catch {
            console.error("Failed to parse decision JSON:", responseText);
        }

        return new Response(
            JSON.stringify({ success: true, decision }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("Error extracting decision:", error);
        return new Response(
            JSON.stringify({ success: false, error: "Failed to extract decision" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}

// ============================================
// 🔀 TRANSITION HANDLER
// ============================================

async function handleTransition(
    genAI: GoogleGenerativeAI,
    modelName: string
): Promise<Response> {
    console.log("[phase-l API] Transitioning to Phase D...");

    const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: "Você é o Moderador. Transicione para a Fase D — Ação.",
    });

    const prompt = getTransitionToDPrompt();

    return streamResponse(model, prompt);
}

// ============================================
// 💬 GENERAL CHAT HANDLER
// ============================================

async function handleChat(
    genAI: GoogleGenerativeAI,
    modelName: string,
    context: PhaseHContext,
    messages: { role: string; content: string }[]
): Promise<Response> {
    console.log("[phase-l API] General chat...");

    const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: `${MODERATOR_SYNTHESIS_SYSTEM_PROMPT}

## CONTEXTO ATUAL

**Problema:** ${context.problem}
**Contexto:** ${context.businessContext}`,
    });

    const history = messages.slice(0, -1).map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({ history });
    const lastMessage = messages[messages.length - 1];

    if (!lastMessage || !lastMessage.content) {
        return new Response(
            JSON.stringify({ error: "No message content" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }

    return streamResponse(chat, lastMessage.content, true);
}

// ============================================
// 📡 STREAM RESPONSE HELPER
// ============================================

async function streamResponse(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    modelOrChat: any,
    prompt: string,
    isChat = false
): Promise<Response> {
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            try {
                let result;
                let totalChunks = 0;

                console.log("[phase-l API] Starting stream...");

                if (isChat) {
                    result = await modelOrChat.sendMessageStream(prompt);
                } else {
                    result = await modelOrChat.generateContentStream(prompt);
                }

                for await (const chunk of result.stream) {
                    const text = chunk.text();
                    totalChunks++;
                    if (text) {
                        const data = JSON.stringify({
                            type: "content",
                            content: text
                        });
                        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                    }
                }

                console.log("[phase-l API] Stream complete, chunks:", totalChunks);

                const doneData = JSON.stringify({ type: "done" });
                controller.enqueue(encoder.encode(`data: ${doneData}\n\n`));
                controller.close();

            } catch (error) {
                console.error("[phase-l API] Stream error:", error);
                const errorData = JSON.stringify({
                    type: "error",
                    error: error instanceof Error ? error.message : "Unknown error"
                });
                controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
                controller.close();
            }
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    });
}
