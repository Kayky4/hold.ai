export interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

export interface Persona {
    id: string;
    name: string;
    description: string;
    style: string;
    tone: string;
    principles: string[];
    biases: string[];
    riskTolerance: number;
    objectives: string[];
    instructions: string[];
}

export interface Conversation {
    id: string;
    title: string;
    messages: Message[];
    createdAt: Date;
    updatedAt: Date;
}
