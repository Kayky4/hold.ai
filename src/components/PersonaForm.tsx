"use client";

import { useState, useEffect } from "react";
import { Persona } from "@/types";
import { DEFAULT_PERSONA } from "@/lib/personas";

interface PersonaFormProps {
    persona?: Persona | null;
    onSave: (persona: Omit<Persona, "id">) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export default function PersonaForm({
    persona,
    onSave,
    onCancel,
    isLoading = false,
}: PersonaFormProps) {
    const [formData, setFormData] = useState<Omit<Persona, "id">>({
        name: "",
        description: "",
        style: "",
        tone: "",
        principles: [""],
        biases: [""],
        riskTolerance: 0.5,
        objectives: [""],
        instructions: [""],
    });

    useEffect(() => {
        if (persona) {
            setFormData({
                name: persona.name,
                description: persona.description,
                style: persona.style,
                tone: persona.tone,
                principles: persona.principles.length > 0 ? persona.principles : [""],
                biases: persona.biases.length > 0 ? persona.biases : [""],
                riskTolerance: persona.riskTolerance,
                objectives: persona.objectives.length > 0 ? persona.objectives : [""],
                instructions: persona.instructions.length > 0 ? persona.instructions : [""],
            });
        }
    }, [persona]);

    const handleArrayChange = (
        field: "principles" | "biases" | "objectives" | "instructions",
        index: number,
        value: string
    ) => {
        const newArray = [...formData[field]];
        newArray[index] = value;
        setFormData({ ...formData, [field]: newArray });
    };

    const handleAddArrayItem = (
        field: "principles" | "biases" | "objectives" | "instructions"
    ) => {
        setFormData({ ...formData, [field]: [...formData[field], ""] });
    };

    const handleRemoveArrayItem = (
        field: "principles" | "biases" | "objectives" | "instructions",
        index: number
    ) => {
        if (formData[field].length > 1) {
            const newArray = formData[field].filter((_, i) => i !== index);
            setFormData({ ...formData, [field]: newArray });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Filter out empty strings from arrays
        const cleanedData = {
            ...formData,
            principles: formData.principles.filter((p) => p.trim() !== ""),
            biases: formData.biases.filter((b) => b.trim() !== ""),
            objectives: formData.objectives.filter((o) => o.trim() !== ""),
            instructions: formData.instructions.filter((i) => i.trim() !== ""),
        };
        onSave(cleanedData);
    };

    const loadTemplate = () => {
        setFormData({
            ...DEFAULT_PERSONA,
            principles: [...DEFAULT_PERSONA.principles],
            biases: [...DEFAULT_PERSONA.biases],
            objectives: [...DEFAULT_PERSONA.objectives],
            instructions: [...DEFAULT_PERSONA.instructions],
        });
    };

    const getRiskLabel = (value: number) => {
        if (value < 0.3) return "Conservador";
        if (value < 0.7) return "Moderado";
        return "Agressivo";
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header Actions */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-[var(--foreground)]">
                    {persona ? "Editar Persona" : "Nova Persona"}
                </h2>
                <button
                    type="button"
                    onClick={loadTemplate}
                    className="text-sm text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors"
                >
                    Carregar template
                </button>
            </div>

            {/* Basic Info */}
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                        Nome da Persona
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ex: Investidor Cético"
                        className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder-[var(--muted)] focus:border-[var(--primary)] focus:outline-none transition-colors"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                        Descrição Curta
                    </label>
                    <input
                        type="text"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Ex: Investidor experiente que questiona tudo"
                        className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder-[var(--muted)] focus:border-[var(--primary)] focus:outline-none transition-colors"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                            Estilo Comportamental
                        </label>
                        <input
                            type="text"
                            value={formData.style}
                            onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                            placeholder="Ex: Direto e analítico"
                            className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder-[var(--muted)] focus:border-[var(--primary)] focus:outline-none transition-colors"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                            Tom de Voz
                        </label>
                        <input
                            type="text"
                            value={formData.tone}
                            onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                            placeholder="Ex: Informal e provocador"
                            className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder-[var(--muted)] focus:border-[var(--primary)] focus:outline-none transition-colors"
                            required
                        />
                    </div>
                </div>
            </div>

            {/* Risk Tolerance */}
            <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                    Tolerância a Risco: <span className="text-[var(--primary)]">{getRiskLabel(formData.riskTolerance)}</span>
                </label>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={formData.riskTolerance}
                    onChange={(e) => setFormData({ ...formData, riskTolerance: parseFloat(e.target.value) })}
                    className="w-full accent-[var(--primary)]"
                />
                <div className="flex justify-between text-xs text-[var(--muted)] mt-1">
                    <span>Conservador</span>
                    <span>Moderado</span>
                    <span>Agressivo</span>
                </div>
            </div>

            {/* Array Fields */}
            {[
                { key: "principles" as const, label: "Princípios e Valores", placeholder: "Ex: Clareza acima de tudo" },
                { key: "biases" as const, label: "Vieses e Tendências", placeholder: "Ex: Prefere validação rápida" },
                { key: "objectives" as const, label: "Objetivos Internos", placeholder: "Ex: Desafiar suposições" },
                { key: "instructions" as const, label: "Instruções Explícitas", placeholder: "Ex: Nunca bajule" },
            ].map(({ key, label, placeholder }) => (
                <div key={key}>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                        {label}
                    </label>
                    <div className="space-y-2">
                        {formData[key].map((item, index) => (
                            <div key={index} className="flex gap-2">
                                <input
                                    type="text"
                                    value={item}
                                    onChange={(e) => handleArrayChange(key, index, e.target.value)}
                                    placeholder={placeholder}
                                    className="flex-1 px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder-[var(--muted)] focus:border-[var(--primary)] focus:outline-none transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveArrayItem(key, index)}
                                    className="p-2.5 text-[var(--muted)] hover:text-[var(--destructive)] transition-colors"
                                    disabled={formData[key].length <= 1}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => handleAddArrayItem(key)}
                            className="text-sm text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors flex items-center gap-1"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Adicionar
                        </button>
                    </div>
                </div>
            ))}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-[var(--border)]">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-[var(--foreground)] bg-[var(--background)] hover:bg-[var(--border)] border border-[var(--border)] rounded-xl transition-colors duration-200"
                    disabled={isLoading}
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={isLoading || !formData.name.trim()}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-50 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {persona ? "Salvar Alterações" : "Criar Persona"}
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
