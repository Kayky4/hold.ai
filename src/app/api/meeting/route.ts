import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_MODELS = ["gemini-2.5-flash-lite", "gemini-2.5-flash", "gemini-3-flash"];
const DEFAULT_MODEL = "gemini-2.5-flash-lite";

// API for multi-persona meeting room
export async function POST(request: NextRequest) {
    try {
        const {
            conversationHistory,
            persona1SystemPrompt,
            persona2SystemPrompt,
            persona1Name,
            persona2Name,
            currentSpeaker,
            userIntervention,
            projectContext,
            model: requestedModel,
        } = await request.json();

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: "GEMINI_API_KEY not configured" },
                { status: 500 }
            );
        }

        // Validate and set model
        const selectedModel = ALLOWED_MODELS.includes(requestedModel) ? requestedModel : DEFAULT_MODEL;

        const genAI = new GoogleGenerativeAI(apiKey);

        // Select which persona should speak
        const systemPrompt = currentSpeaker === 1 ? persona1SystemPrompt : persona2SystemPrompt;
        const speakerName = currentSpeaker === 1 ? persona1Name : persona2Name;
        const otherName = currentSpeaker === 1 ? persona2Name : persona1Name;

        // Build enhanced system prompt for debate context
        const debateSystemPrompt = `${systemPrompt}

${projectContext ? `${projectContext}\n` : ""}
## Contexto da Reunião
Você está em uma reunião estratégica com ${otherName} e o fundador do projeto. 
- Você é ${speakerName}
- Você está debatendo diretamente com ${otherName}
- O fundador está observando e pode intervir a qualquer momento

## Regras do Debate
- IMPORTANTE: Use o contexto do projeto fornecido acima para embasar suas análises e sugestões
- Responda diretamente ao que foi dito anteriormente
- Se discordar de ${otherName}, seja claro e direto sobre o porquê
- Construa sobre os pontos válidos que ${otherName} trouxe
- Faça perguntas provocativas quando necessário
- Mantenha suas respostas concisas (2-4 parágrafos)
- Seja assertivo mas respeitoso
- NÃO repita o que já foi dito
- Traga novas perspectivas e argumentos

${userIntervention ? `\n## Intervenção do Fundador\nO fundador acabou de intervir com: "${userIntervention}"\nResponda considerando essa intervenção.` : ""}
`;

        const model = genAI.getGenerativeModel({
            model: selectedModel,
            systemInstruction: debateSystemPrompt,
        });

        // Build a simple prompt with conversation context
        let conversationContext = "";
        if (conversationHistory && conversationHistory.length > 0) {
            conversationContext = conversationHistory
                .map((msg: { speaker: string; content: string }) => `[${msg.speaker}]: ${msg.content}`)
                .join("\n\n");
        }

        const prompt = conversationContext
            ? `Aqui está o histórico da discussão até agora:\n\n${conversationContext}\n\nAgora é sua vez de falar como ${speakerName}. Responda ao que foi dito, trazendo sua perspectiva única:`
            : `Como ${speakerName}, inicie a discussão com sua perspectiva sobre o tema apresentado pelo fundador.`;

        // Use simple generateContent instead of chat
        const result = await model.generateContent(prompt);
        const response = result.response.text();

        return NextResponse.json({
            role: "assistant",
            content: response,
            speaker: speakerName,
            speakerIndex: currentSpeaker,
            modelUsed: selectedModel,
        });

    } catch (error: unknown) {
        console.error("Error in meeting API:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
            { error: "Failed to generate response", details: errorMessage },
            { status: 500 }
        );
    }
}
