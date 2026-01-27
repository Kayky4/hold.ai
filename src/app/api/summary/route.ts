import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

interface MeetingMessage {
    speaker: string;
    speakerIndex: number;
    content: string;
    timestamp: Date;
}

interface SummaryRequest {
    messages: MeetingMessage[];
    topic: string;
    persona1Name: string;
    persona2Name: string;
    projectContext?: string;
}

export async function POST(request: NextRequest) {
    try {
        const body: SummaryRequest = await request.json();
        const { messages, topic, persona1Name, persona2Name, projectContext } = body;

        if (!messages || messages.length === 0) {
            return NextResponse.json(
                { error: "No messages provided" },
                { status: 400 }
            );
        }

        // Format conversation for the AI
        const conversationText = messages
            .map((m) => `${m.speaker}: ${m.content}`)
            .join("\n\n");

        const systemPrompt = `Você é um analista de reuniões estratégicas. Gere um resumo CONCISO e ACIONÁVEL usando o framework HOLD.

${projectContext ? `Contexto: ${projectContext}\n` : ""}

## REGRAS IMPORTANTES
- Seja BRUTAL na objetividade. Máximo 1-2 frases por item.
- Use bullet points curtos. Nada de parágrafos longos.
- Foque no que é ACIONÁVEL, não em filosofia.
- Cada seção deve ter no máximo 3-4 bullets.

## FORMATO DO RESUMO (siga exatamente)

## 📋 Resumo
[1-2 frases diretas sobre o que foi discutido e o resultado]

## 🎯 Tema
[Uma frase com o tema central]

## 💡 HOLD

**H - Hipótese**
- [Hipótese central discutida - 1 frase]

**O - Objeções**
- [Objeção 1]
- [Objeção 2]

**L - Alavancas**
- [Oportunidade 1]
- [Oportunidade 2]

**D - Decisão**
- [Decisão tomada ou "Pendente: [razão]"]

## ⚔️ Tensões
- [Ponto de discordância - máx 2]

## ✅ Decisões
- [Lista clara de 1-3 decisões]

## 📌 Próximos Passos
- [Ação 1]
- [Ação 2]`;

        const userPrompt = `Reunião: ${topic}
Participantes: ${persona1Name}, ${persona2Name}

Transcrição:
${conversationText}

---
Gere o resumo CONCISO seguindo o formato acima.`;

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

        const result = await model.generateContent({
            contents: [
                {
                    role: "user",
                    parts: [{ text: systemPrompt + "\n\n" + userPrompt }],
                },
            ],
            generationConfig: {
                temperature: 0.2,
                topP: 0.8,
                maxOutputTokens: 4000,
            },
        });

        const response = result.response;
        const summary = response.text();

        // Extract decisions from the summary for the Banco de Decisões
        const decisionsPrompt = `Baseado no resumo abaixo, extraia APENAS as decisões tomadas em formato JSON.

${summary}

Retorne um array JSON com objetos no formato:
[
  {
    "decision": "Texto claro da decisão",
    "status": "taken" ou "pending",
    "context": "Breve contexto de 1 linha"
  }
]

Se não houver decisões claras, retorne um array vazio [].
Retorne APENAS o JSON, sem markdown ou explicações.`;

        const decisionsResult = await model.generateContent({
            contents: [
                {
                    role: "user",
                    parts: [{ text: decisionsPrompt }],
                },
            ],
            generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 1000,
            },
        });

        let decisions = [];
        try {
            const decisionsText = decisionsResult.response.text().trim();
            // Remove markdown code blocks if present
            const cleanJson = decisionsText.replace(/```json\n?|\n?```/g, "").trim();
            decisions = JSON.parse(cleanJson);
        } catch {
            console.error("Failed to parse decisions JSON");
            decisions = [];
        }

        return NextResponse.json({
            summary,
            decisions,
            topic,
            personas: [persona1Name, persona2Name],
            messageCount: messages.length,
            generatedAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Error generating summary:", error);
        return NextResponse.json(
            { error: "Failed to generate summary" },
            { status: 500 }
        );
    }
}
