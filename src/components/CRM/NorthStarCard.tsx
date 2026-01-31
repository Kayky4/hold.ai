/**
 * 🌟 NorthStarCard Component
 * 
 * Card para exibir e editar o North Star do usuário.
 * Usando Tailwind CSS (padrão do projeto).
 */

"use client";

import { useState } from "react";
import { NorthStar } from "@/types/crm";

interface NorthStarCardProps {
    northStar: NorthStar | null;
    onSave: (northStar: NorthStar) => Promise<void>;
    onUpdate: (updates: Partial<NorthStar>) => Promise<void>;
}

export function NorthStarCard({ northStar, onSave, onUpdate }: NorthStarCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(northStar?.title || "");
    const [description, setDescription] = useState(northStar?.description || "");

    const handleSave = async () => {
        if (!title.trim()) return;

        if (northStar) {
            await onUpdate({ title, description });
        } else {
            await onSave({
                id: `ns-${Date.now()}`,
                userId: 'anonymous',
                title,
                description,
                createdAt: new Date()
            });
        }

        setIsEditing(false);
    };

    const handleCancel = () => {
        setTitle(northStar?.title || "");
        setDescription(northStar?.description || "");
        setIsEditing(false);
    };

    // Empty state
    if (!northStar && !isEditing) {
        return (
            <div className="bg-gradient-to-r from-card to-background border-2 border-dashed border-border rounded-xl p-5 mb-6">
                <div className="flex items-center gap-4 flex-wrap">
                    <span className="text-3xl opacity-50">⭐</span>
                    <div className="flex-1 min-w-[200px]">
                        <h3 className="text-sm font-semibold text-foreground mb-1">Defina sua North Star</h3>
                        <p className="text-xs text-muted-foreground">
                            Qual é o seu objetivo macro? Isso ajuda a conectar decisões.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-semibold transition-colors whitespace-nowrap"
                    >
                        Definir North Star
                    </button>
                </div>
            </div>
        );
    }

    // Editing state
    if (isEditing) {
        return (
            <div className="bg-card border border-border rounded-xl p-5 mb-6">
                <header className="flex items-center gap-2 mb-4">
                    <span className="text-lg">⭐</span>
                    <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        North Star
                    </h2>
                </header>

                <div className="space-y-3">
                    <div>
                        <label htmlFor="ns-title" className="block text-xs font-semibold text-muted-foreground mb-1">
                            Objetivo
                        </label>
                        <input
                            id="ns-title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ex: R$ 100k MRR em 2026"
                            autoFocus
                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>

                    <div>
                        <label htmlFor="ns-description" className="block text-xs font-semibold text-muted-foreground mb-1">
                            Contexto (opcional)
                        </label>
                        <textarea
                            id="ns-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Por que isso é importante para você?"
                            rows={2}
                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            onClick={handleCancel}
                            className="px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:bg-background transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!title.trim()}
                            className="px-5 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Salvar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Display state
    if (!northStar) return null;

    return (
        <div className="bg-gradient-to-r from-card to-background border border-border rounded-xl p-5 mb-6 group">
            <header className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-lg">⭐</span>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        North Star
                    </span>
                </div>
                <button
                    onClick={() => setIsEditing(true)}
                    title="Editar"
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-background rounded transition-all"
                >
                    ✏️
                </button>
            </header>

            <div>
                <h2 className="text-lg font-bold text-foreground mb-1">{northStar.title}</h2>
                {northStar.description && (
                    <p className="text-sm text-muted-foreground">{northStar.description}</p>
                )}
            </div>
        </div>
    );
}
