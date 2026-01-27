// Meeting Templates for common strategic discussions

export interface MeetingTemplate {
    id: string;
    name: string;
    description: string;
    icon: string;
    suggestedPersonas: [string, string]; // Persona IDs
    promptTemplate: string;
    followUpQuestions: string[];
    estimatedDuration: string;
    category: "validation" | "strategy" | "growth" | "operations";
}

export const MEETING_TEMPLATES: MeetingTemplate[] = [
    {
        id: "idea-validation",
        name: "Validação de Ideia",
        description: "Teste sua ideia de negócio ou feature antes de investir tempo e dinheiro",
        icon: "💡",
        suggestedPersonas: ["steve-jobs", "eric-ries"],
        promptTemplate: "Quero validar a seguinte ideia: [DESCREVA SUA IDEIA]. O público-alvo seria [PÚBLICO]. O problema que resolve é [PROBLEMA].",
        followUpQuestions: [
            "Qual problema específico você está tentando resolver?",
            "Quem seria seu cliente ideal?",
            "Como você validaria isso com um MVP?",
        ],
        estimatedDuration: "10-15 min",
        category: "validation",
    },
    {
        id: "pricing-decision",
        name: "Decisão de Pricing",
        description: "Defina a precificação ideal para seu produto ou serviço",
        icon: "💰",
        suggestedPersonas: ["steve-jobs", "eric-ries"],
        promptTemplate: "Preciso definir o preço do meu produto/serviço: [DESCREVA]. As opções são: [OPÇÃO A] vs [OPÇÃO B]. Meu público é [PÚBLICO].",
        followUpQuestions: [
            "Qual valor seu produto entrega ao cliente?",
            "Quanto seus concorrentes cobram?",
            "Qual é o custo de aquisição do cliente?",
        ],
        estimatedDuration: "15-20 min",
        category: "strategy",
    },
    {
        id: "pivot-or-persevere",
        name: "Pivô ou Perseverança",
        description: "Decida se deve pivotar ou continuar com a estratégia atual",
        icon: "🔄",
        suggestedPersonas: ["eric-ries", "steve-jobs"],
        promptTemplate: "Estou considerando pivotar porque: [RAZÕES]. A situação atual é: [CONTEXTO]. As métricas mostram: [MÉTRICAS].",
        followUpQuestions: [
            "Quais métricas indicam que algo precisa mudar?",
            "O que você já tentou para melhorar?",
            "Qual seria o pivô específico?",
        ],
        estimatedDuration: "20-25 min",
        category: "strategy",
    },
    {
        id: "feature-prioritization",
        name: "Priorização de Features",
        description: "Decida quais features construir primeiro com recursos limitados",
        icon: "📊",
        suggestedPersonas: ["steve-jobs", "eric-ries"],
        promptTemplate: "Preciso priorizar entre as seguintes features: [LISTA DE FEATURES]. Meus recursos são limitados a [RECURSOS]. O objetivo principal é [OBJETIVO].",
        followUpQuestions: [
            "Qual feature tem maior impacto no usuário?",
            "Qual é mais rápida de implementar?",
            "O que os dados mostram sobre o uso atual?",
        ],
        estimatedDuration: "15-20 min",
        category: "operations",
    },
    {
        id: "go-to-market",
        name: "Estratégia Go-to-Market",
        description: "Defina como lançar seu produto no mercado",
        icon: "🚀",
        suggestedPersonas: ["steve-jobs", "eric-ries"],
        promptTemplate: "Estou planejando lançar [PRODUTO] para [MERCADO]. Minha proposta de valor é [PROPOSTA]. Tenho [RECURSOS] disponíveis.",
        followUpQuestions: [
            "Quem são seus primeiros 100 clientes?",
            "Qual é seu canal de aquisição principal?",
            "Como você vai medir o sucesso do lançamento?",
        ],
        estimatedDuration: "20-25 min",
        category: "growth",
    },
    {
        id: "problem-solution-fit",
        name: "Problem-Solution Fit",
        description: "Valide se sua solução realmente resolve o problema do cliente",
        icon: "🎯",
        suggestedPersonas: ["eric-ries", "steve-jobs"],
        promptTemplate: "O problema que identifico é: [PROBLEMA]. Minha solução proposta é: [SOLUÇÃO]. As evidências que tenho são: [EVIDÊNCIAS].",
        followUpQuestions: [
            "Como você descobriu esse problema?",
            "Quantas pessoas você entrevistou?",
            "Os clientes pagariam para resolver isso?",
        ],
        estimatedDuration: "15-20 min",
        category: "validation",
    },
];

export function getTemplateById(id: string): MeetingTemplate | undefined {
    return MEETING_TEMPLATES.find(t => t.id === id);
}

export function getTemplatesByCategory(category: MeetingTemplate["category"]): MeetingTemplate[] {
    return MEETING_TEMPLATES.filter(t => t.category === category);
}
