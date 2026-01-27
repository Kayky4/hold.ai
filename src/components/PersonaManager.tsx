"use client";

import { useState, useEffect } from "react";
import { Persona } from "@/types";
import { getPersonas, createPersona, updatePersona, deletePersona } from "@/lib/personas";
import PersonaForm from "./PersonaForm";
import ConfirmModal from "./ConfirmModal";
import { useAuth } from "@/contexts/AuthContext";

interface PersonaManagerProps {
    selectedPersonaId: string | null;
    onSelectPersona: (persona: Persona) => void;
    onClose: () => void;
}

export default function PersonaManager({
    selectedPersonaId,
    onSelectPersona,
    onClose,
}: PersonaManagerProps) {
    const { user } = useAuth();
    const userId = user?.uid || "";
    const [personas, setPersonas] = useState<Persona[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingPersona, setEditingPersona] = useState<Persona | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [personaToDelete, setPersonaToDelete] = useState<Persona | null>(null);

    useEffect(() => {
        if (userId) {
            loadPersonas();
        }
    }, [userId]);

    const loadPersonas = async () => {
        if (!userId) return;
        setIsLoading(true);
        try {
            const data = await getPersonas(userId);
            setPersonas(data);
        } catch (error) {
            console.error("Error loading personas:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreatePersona = async (personaData: Omit<Persona, "id">) => {
        if (!userId) return;
        setIsSaving(true);
        try {
            const id = await createPersona(userId, personaData);
            await loadPersonas();
            setShowForm(false);
            // Auto-select the new persona
            const newPersona = { ...personaData, id };
            onSelectPersona(newPersona);
        } catch (error) {
            console.error("Error creating persona:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdatePersona = async (personaData: Omit<Persona, "id">) => {
        if (!editingPersona) return;
        setIsSaving(true);
        try {
            await updatePersona(editingPersona.id, personaData);
            await loadPersonas();
            setShowForm(false);
            setEditingPersona(null);
            // Update selected if editing current
            if (selectedPersonaId === editingPersona.id) {
                onSelectPersona({ ...personaData, id: editingPersona.id });
            }
        } catch (error) {
            console.error("Error updating persona:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteClick = (persona: Persona, e: React.MouseEvent) => {
        e.stopPropagation();
        setPersonaToDelete(persona);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!personaToDelete) return;
        try {
            await deletePersona(personaToDelete.id);
            await loadPersonas();
        } catch (error) {
            console.error("Error deleting persona:", error);
        } finally {
            setDeleteModalOpen(false);
            setPersonaToDelete(null);
        }
    };

    const handleEditClick = (persona: Persona, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingPersona(persona);
        setShowForm(true);
    };

    const handleSelectPersona = (persona: Persona) => {
        onSelectPersona(persona);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className="relative bg-[var(--card)] border border-[var(--border)] rounded-2xl w-full max-w-2xl max-h-[90vh] mx-4 shadow-2xl animate-fade-in overflow-hidden flex flex-col"
                style={{ animationDuration: "0.2s" }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
                    <div>
                        <h2 className="text-xl font-semibold text-[var(--foreground)]">
                            {showForm ? (editingPersona ? "Editar Persona" : "Nova Persona") : "Gerenciar Personas"}
                        </h2>
                        <p className="text-sm text-[var(--muted-foreground)] mt-1">
                            {showForm
                                ? "Configure os atributos da persona"
                                : "Selecione ou crie personas para suas reuniões"}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)] transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {showForm ? (
                        <PersonaForm
                            persona={editingPersona}
                            onSave={editingPersona ? handleUpdatePersona : handleCreatePersona}
                            onCancel={() => {
                                setShowForm(false);
                                setEditingPersona(null);
                            }}
                            isLoading={isSaving}
                        />
                    ) : (
                        <>
                            {/* Create New Button */}
                            <button
                                onClick={() => {
                                    setEditingPersona(null);
                                    setShowForm(true);
                                }}
                                className="w-full p-4 mb-4 border-2 border-dashed border-[var(--border)] rounded-xl hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all duration-200 flex items-center justify-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--primary)]"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Criar Nova Persona
                            </button>

                            {/* Personas List */}
                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="w-8 h-8 border-2 border-[var(--muted)] border-t-[var(--primary)] rounded-full animate-spin"></div>
                                </div>
                            ) : personas.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 rounded-2xl bg-[var(--background)] flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-[var(--muted-foreground)]">Nenhuma persona criada ainda</p>
                                    <p className="text-sm text-[var(--muted)] mt-1">
                                        Clique em &quot;Criar Nova Persona&quot; para começar
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {personas.map((persona) => (
                                        <div
                                            key={persona.id}
                                            onClick={() => handleSelectPersona(persona)}
                                            className={`group p-4 rounded-xl cursor-pointer transition-all duration-200 border ${selectedPersonaId === persona.id
                                                ? "bg-[var(--primary)]/10 border-[var(--primary)]/30"
                                                : "bg-[var(--background)] border-[var(--border)] hover:border-[var(--primary)]/30"
                                                }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-3">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${selectedPersonaId === persona.id
                                                        ? "bg-[var(--primary)]"
                                                        : "bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)]"
                                                        }`}>
                                                        <span className="text-white font-bold text-sm">
                                                            {persona.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h3 className={`font-medium ${selectedPersonaId === persona.id
                                                                ? "text-[var(--primary)]"
                                                                : "text-[var(--foreground)]"
                                                                }`}>
                                                                {persona.name}
                                                            </h3>
                                                            {selectedPersonaId === persona.id && (
                                                                <span className="px-2 py-0.5 text-xs bg-[var(--primary)] text-white rounded-full">
                                                                    Ativo
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
                                                            {persona.description}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <span className="text-xs px-2 py-1 bg-[var(--card)] rounded-lg text-[var(--muted)]">
                                                                {persona.style}
                                                            </span>
                                                            <span className="text-xs px-2 py-1 bg-[var(--card)] rounded-lg text-[var(--muted)]">
                                                                {persona.riskTolerance < 0.3
                                                                    ? "Conservador"
                                                                    : persona.riskTolerance < 0.7
                                                                        ? "Moderado"
                                                                        : "Agressivo"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => handleEditClick(persona, e)}
                                                        className="p-2 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card)] transition-colors"
                                                        title="Editar"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleDeleteClick(persona, e)}
                                                        className="p-2 rounded-lg text-[var(--muted)] hover:text-[var(--destructive)] hover:bg-[var(--card)] transition-colors"
                                                        title="Excluir"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteModalOpen}
                title="Excluir persona"
                message={`Tem certeza que deseja excluir "${personaToDelete?.name}"? Esta ação não pode ser desfeita.`}
                confirmLabel="Excluir"
                cancelLabel="Cancelar"
                onConfirm={handleConfirmDelete}
                onCancel={() => {
                    setDeleteModalOpen(false);
                    setPersonaToDelete(null);
                }}
                isDestructive={true}
            />
        </div>
    );
}
