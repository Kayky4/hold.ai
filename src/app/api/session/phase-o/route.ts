import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";
import {
    getModeratorPresentationPrompt,
    getCounselorSystemPrompt,
    getCounselorResponsePrompt,
    MODERATOR_PROBE_SYSTEM_PROMPT,
    getModeratorProbePrompt,
    getTransitionToLPrompt,
    PhaseOState
} from "@/lib/prompts/phaseO";
import { PhaseHContext } from "@/lib/prompts/phaseH";
import { Persona } from "@/types";

// ============================================
// 📐 CONFIG
// ============================================

const ALLOWED_MODELS = ["gemini-2.5-flash-lite", "gemini-3-flash-preview"];
const DEFAULT_MODEL = "gemini-2.5-flash-lite";

// ============================================
// 📤 POST — Phase O Chat with Streaming
// ============================================

export async function POST(request: NextRequest) {
    try {
        const {
            messages,
            counselor,
            context,
            phaseState,
            model: requestedModel,
            action = "chat" // "chat" | "present_context" | "counselor_response" | "moderator_probe" | "transition"
        } = await request.json();

        // Validate
        if (!counselor) {
            return new Response(
                JSON.stringify({ error: "Counselor is required" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return new Response(
                JSON.stringify({ error: "GEMINI_API_KEY not configured" }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        const selectedModel = ALLOWED_MODELS.includes(requestedModel) ? requestedModel : DEFAULT_MODEL;
        const genAI = new GoogleGenerativeAI(apiKey);

        // Handle different actions
        switch (action) {
            case "present_context":
                return await handlePresentContext(genAI, selectedModel, context, counselor);

            case "counselor_response":
                return await handleCounselorResponse(genAI, selectedModel, counselor, context, messages);

            case "moderator_probe":
                return await handleModeratorProbe(genAI, selectedModel, phaseState, messages);

            case "transition":
                return await handleTransition(genAI, selectedModel, counselor, context, messages);

            default:
                return await handleChat(genAI, selectedModel, counselor, context, messages);
        }

    } catch (error: unknown) {
        console.error("Error in phase-o API:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return new Response(
            JSON.stringify({ error: "Failed to generate response", details: errorMessage }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}

// ============================================
// 📋 PRESENT CONTEXT
// ============================================

async function handlePresentContext(
    genAI: GoogleGenerativeAI,
    modelName: string,
    context: PhaseHContext,
    counselor: Persona
): Promise<Response> {
    const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: "Você é o Moderador de uma sessão HOLD. Apresente o contexto de forma neutra.",
    });

    const prompt = getModeratorPresentationPrompt(context, counselor);

    return streamResponse(model, prompt);
}

// ============================================
// 🧠 COUNSELOR RESPONSE
// ============================================

async function handleCounselorResponse(
    genAI: GoogleGenerativeAI,
    modelName: string,
    counselor: Persona,
    context: PhaseHContext,
    messages: { role: string; content: string }[]
): Promise<Response> {
    const systemPrompt = getCounselorSystemPrompt(counselor, context);

    const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: systemPrompt,
    });

    // Build conversation history
    const history = messages.slice(0, -1).map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({ history });
    const lastMessage = messages[messages.length - 1];

    const userPrompt = lastMessage?.content || getCounselorResponsePrompt(counselor, context);

    return streamResponse(chat, userPrompt, true);
}

// ============================================
// 🔍 MODERATOR PROBE
// ============================================

async function handleModeratorProbe(
    genAI: GoogleGenerativeAI,
    modelName: string,
    phaseState: PhaseOState,
    messages: { role: string; content: string }[]
): Promise<Response> {
    const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: MODERATOR_PROBE_SYSTEM_PROMPT,
    });

    const lastCounselorResponse = messages
        .filter(m => m.role === "assistant")
        .pop()?.content || "";

    const prompt = getModeratorProbePrompt(
        phaseState?.currentRound || 1,
        lastCounselorResponse,
        phaseState?.userHasIntervened || false
    );

    return streamResponse(model, prompt);
}

// ============================================
// 🔄 TRANSITION TO PHASE L
// ============================================

async function handleTransition(
    genAI: GoogleGenerativeAI,
    modelName: string,
    counselor: Persona,
    context: PhaseHContext,
    messages: { role: string; content: string }[]
): Promise<Response> {
    const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: "Você é o Moderador. Sintetize o debate e transicione para a decisão.",
    });

    // Build summary from messages
    const conversationSummary = messages
        .filter(m => m.role === "assistant")
        .map(m => m.content)
        .join("\n\n");

    const prompt = `${getTransitionToLPrompt(counselor, context)}

## DEBATE QUE OCORREU

${conversationSummary}

Agora, gere a síntese e transição para Fase L.`;

    return streamResponse(model, prompt);
}

// ============================================
// 💬 GENERAL CHAT
// ============================================

async function handleChat(
    genAI: GoogleGenerativeAI,
    modelName: string,
    counselor: Persona,
    context: PhaseHContext,
    messages: { role: string; content: string }[]
): Promise<Response> {
    const systemPrompt = getCounselorSystemPrompt(counselor, context);

    const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: systemPrompt,
    });

    // Build conversation history
    const history = messages.slice(0, -1).map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({ history });
    const lastMessage = messages[messages.length - 1];

    return streamResponse(chat, lastMessage?.content || "Continue o debate.", true);
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

                if (isChat) {
                    result = await modelOrChat.sendMessageStream(prompt);
                } else {
                    result = await modelOrChat.generateContentStream(prompt);
                }

                for await (const chunk of result.stream) {
                    const text = chunk.text();
                    if (text) {
                        const data = JSON.stringify({
                            type: "content",
                            content: text
                        });
                        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                    }
                }

                // Send completion signal
                const doneData = JSON.stringify({ type: "done" });
                controller.enqueue(encoder.encode(`data: ${doneData}\n\n`));
                controller.close();

            } catch (error) {
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
