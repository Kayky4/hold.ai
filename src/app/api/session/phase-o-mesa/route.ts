import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";
import {
    getModeratorMesaPresentationPrompt,
    getCounselor1SystemPrompt,
    getCounselor2ReactionPrompt,
    MODERATOR_PROVOCATION_SYSTEM_PROMPT,
    getModeratorProvocationPrompt,
    getCounselorRebuttalPrompt,
    getModeratorMesaTransitionPrompt,
    PhaseOMesaState
} from "@/lib/prompts/phaseOMesa";
import { PhaseHContext } from "@/lib/prompts/phaseH";
import { Persona } from "@/types";

// ============================================
// 📐 CONFIG
// ============================================

const ALLOWED_MODELS = ["gemini-2.5-flash-lite", "gemini-3-flash-preview"];
const DEFAULT_MODEL = "gemini-2.5-flash-lite";

// ============================================
// 📤 POST — Phase O Mesa Chat with Streaming
// ============================================

export async function POST(request: NextRequest) {
    try {
        const {
            messages,
            counselor1,
            counselor2,
            context,
            phaseState,
            lastCounselorResponse,
            model: requestedModel,
            action = "chat"
            // Actions: "present_context" | "counselor1_response" | "counselor2_reaction" 
            //        | "counselor1_rebuttal" | "counselor2_rebuttal" | "moderator_provoke" | "transition"
        } = await request.json();

        // Validate
        if (!counselor1 || !counselor2) {
            return new Response(
                JSON.stringify({ error: "Both counselors are required for Mesa mode" }),
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
                return await handleMesaPresentation(genAI, selectedModel, context, counselor1, counselor2);

            case "counselor1_response":
                return await handleCounselor1Response(genAI, selectedModel, counselor1, counselor2, context, messages);

            case "counselor2_reaction":
                return await handleCounselor2Reaction(genAI, selectedModel, counselor1, counselor2, context, lastCounselorResponse);

            case "counselor1_rebuttal":
                return await handleCounselorRebuttal(genAI, selectedModel, counselor1, counselor2, lastCounselorResponse, messages);

            case "counselor2_rebuttal":
                return await handleCounselorRebuttal(genAI, selectedModel, counselor2, counselor1, lastCounselorResponse, messages);

            case "moderator_provoke":
                return await handleModeratorProvocation(genAI, selectedModel, phaseState, counselor1, counselor2, lastCounselorResponse);

            case "transition":
                return await handleMesaTransition(genAI, selectedModel, counselor1, counselor2, context, phaseState, messages);

            default:
                return await handleMesaChat(genAI, selectedModel, counselor1, counselor2, context, messages);
        }

    } catch (error: unknown) {
        console.error("Error in phase-o-mesa API:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return new Response(
            JSON.stringify({ error: "Failed to generate response", details: errorMessage }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}

// ============================================
// 📋 PRESENT CONTEXT TO MESA
// ============================================

async function handleMesaPresentation(
    genAI: GoogleGenerativeAI,
    modelName: string,
    context: PhaseHContext,
    counselor1: Persona,
    counselor2: Persona
): Promise<Response> {
    const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: "Você é o Moderador de uma Mesa de Debate HOLD. Apresente o contexto de forma neutra.",
    });

    const prompt = getModeratorMesaPresentationPrompt(context, counselor1, counselor2);

    return streamResponse(model, prompt);
}

// ============================================
// 🧠 COUNSELOR 1 RESPONSE
// ============================================

async function handleCounselor1Response(
    genAI: GoogleGenerativeAI,
    modelName: string,
    counselor1: Persona,
    counselor2: Persona,
    context: PhaseHContext,
    messages: { role: string; content: string }[]
): Promise<Response> {
    const systemPrompt = getCounselor1SystemPrompt(counselor1, counselor2, context);

    const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: systemPrompt,
    });

    const history = messages.slice(0, -1).map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({ history });
    const lastMessage = messages[messages.length - 1];

    return streamResponse(chat, lastMessage?.content || "Dê sua perspectiva sobre a situação.", true);
}

// ============================================
// 🧠 COUNSELOR 2 REACTION
// ============================================

async function handleCounselor2Reaction(
    genAI: GoogleGenerativeAI,
    modelName: string,
    counselor1: Persona,
    counselor2: Persona,
    context: PhaseHContext,
    counselor1Response: string
): Promise<Response> {
    const systemPrompt = getCounselor2ReactionPrompt(counselor1, counselor2, counselor1Response, context);

    const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: systemPrompt,
    });

    const prompt = `Reaja à perspectiva de ${counselor1.name} e dê sua visão sobre o problema.`;

    return streamResponse(model, prompt);
}

// ============================================
// 🔄 COUNSELOR REBUTTAL
// ============================================

async function handleCounselorRebuttal(
    genAI: GoogleGenerativeAI,
    modelName: string,
    counselor: Persona,
    otherCounselor: Persona,
    otherResponse: string,
    messages: { role: string; content: string }[]
): Promise<Response> {
    const baseInstructions = counselor.instructions?.join("\n\n") || "";

    const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: `${baseInstructions}

Você é ${counselor.name}. Está em debate com ${otherCounselor.name}.
Mantenha seu estilo e princípios.
Limite: 100-150 palavras por resposta.`,
    });

    const prompt = getCounselorRebuttalPrompt(counselor, otherCounselor, otherResponse);

    const history = messages.slice(0, -1).map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({ history });

    return streamResponse(chat, prompt, true);
}

// ============================================
// 🔥 MODERATOR PROVOCATION
// ============================================

async function handleModeratorProvocation(
    genAI: GoogleGenerativeAI,
    modelName: string,
    phaseState: PhaseOMesaState,
    counselor1: Persona,
    counselor2: Persona,
    lastExchange: string
): Promise<Response> {
    const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: MODERATOR_PROVOCATION_SYSTEM_PROMPT
            .replace(/\[COUNSELOR1\]/g, counselor1.name)
            .replace(/\[COUNSELOR2\]/g, counselor2.name),
    });

    const prompt = getModeratorProvocationPrompt(phaseState, counselor1, counselor2, lastExchange);

    return streamResponse(model, prompt);
}

// ============================================
// 🔀 MESA TRANSITION
// ============================================

async function handleMesaTransition(
    genAI: GoogleGenerativeAI,
    modelName: string,
    counselor1: Persona,
    counselor2: Persona,
    context: PhaseHContext,
    phaseState: PhaseOMesaState,
    messages: { role: string; content: string }[]
): Promise<Response> {
    const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: "Você é o Moderador. Sintetize o debate da Mesa e transicione para a decisão.",
    });

    const conversationSummary = messages
        .filter(m => m.role === "assistant")
        .map(m => m.content)
        .join("\n\n---\n\n");

    const prompt = `${getModeratorMesaTransitionPrompt(counselor1, counselor2, phaseState.debatePoints || [], context)}

## DEBATE QUE OCORREU

${conversationSummary}

Gere a síntese final e transição para Fase L.`;

    return streamResponse(model, prompt);
}

// ============================================
// 💬 MESA GENERAL CHAT
// ============================================

async function handleMesaChat(
    genAI: GoogleGenerativeAI,
    modelName: string,
    counselor1: Persona,
    counselor2: Persona,
    context: PhaseHContext,
    messages: { role: string; content: string }[]
): Promise<Response> {
    // Default to counselor1 for general chat
    const systemPrompt = getCounselor1SystemPrompt(counselor1, counselor2, context);

    const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: systemPrompt,
    });

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
