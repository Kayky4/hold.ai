/**
 * 📂 CRMSidebar Component
 * 
 * Sidebar para a tela principal (CRM).
 * Contém: Nova Sessão, Conselheiros, Projetos, Sessões Recentes, Menu do Usuário.
 * 
 * @see visao_holdai.md — CRM é o produto principal
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Project, NorthStar } from "@/types/crm";
import ConfirmModal from "./ConfirmModal";

// Ícones de fase para sessões
const PHASE_ICONS: Record<string, string> = {
    'H': '🔍',
    'O': '💬',
    'L': '⚖️',
    'D': '✅',
    'default': '💭'
};

// Ícones de modo para sessões
const MODE_ICONS: Record<string, string> = {
    'solo': '👤',
    'mesa': '👥',
    'revisao': '🔄',
    'default': '💭'
};

export interface SessionItem {
    id: string;
    title: string;
    phase: 'H' | 'O' | 'L' | 'D';
    mode: 'solo' | 'mesa' | 'revisao';
    counselorCount?: number;
    updatedAt: Date;
}

interface CRMSidebarProps {
    projects: Project[];
    selectedProjectId: string | null;
    onSelectProject: (projectId: string | null) => void;
    onCreateProject: (name: string) => Promise<Project>;
    onUpdateProject: (id: string, name: string) => Promise<void>;
    onDeleteProject: (id: string) => Promise<void>;
    onNewSession: () => void;
    onOpenSettings: () => void;
    onOpenProfile: () => void;
    onOpenConselheiros: () => void;
    onResumeSession: (sessionId: string) => void;
    onRenameSession: (sessionId: string, newName: string) => Promise<void>;
    onDeleteSession: (sessionId: string) => Promise<void>;
    northStar: NorthStar | null;
    activeSessions?: SessionItem[];
    maxProjects?: number;
}

export default function CRMSidebar({
    projects,
    selectedProjectId,
    onSelectProject,
    onCreateProject,
    onUpdateProject,
    onDeleteProject,
    onNewSession,
    onOpenSettings,
    onOpenProfile,
    onOpenConselheiros,
    onResumeSession,
    onRenameSession,
    onDeleteSession,
    northStar,
    activeSessions = [],
    maxProjects = 3
}: CRMSidebarProps) {
    const { user, signOut } = useAuth();

    // Project states
    const [isCreatingProject, setIsCreatingProject] = useState(false);
    const [newProjectName, setNewProjectName] = useState("");
    const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
    const [editProjectName, setEditProjectName] = useState("");
    const [projectMenuId, setProjectMenuId] = useState<string | null>(null);
    const [showProjectDropdown, setShowProjectDropdown] = useState(false);

    // Session states
    const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
    const [editSessionName, setEditSessionName] = useState("");
    const [sessionMenuId, setSessionMenuId] = useState<string | null>(null);

    // User menu
    const [showUserMenu, setShowUserMenu] = useState(false);

    // Confirmation modals
    const [confirmDelete, setConfirmDelete] = useState<{
        type: 'project' | 'session';
        id: string;
        message: string;
    } | null>(null);

    const activeProjects = projects.filter(p => p.status === "active");
    const canCreateProject = activeProjects.length < maxProjects;

    // Close menus when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            // Check if click was on a menu trigger button (has data-menu-trigger attribute)
            const target = e.target as HTMLElement;
            if (target.closest('[data-menu-trigger]')) {
                return; // Don't close if clicking on a trigger
            }
            setProjectMenuId(null);
            setSessionMenuId(null);
            setShowProjectDropdown(false);
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    // Project handlers
    const handleCreateProject = async () => {
        if (!newProjectName.trim() || !canCreateProject) return;
        await onCreateProject(newProjectName.trim());
        setNewProjectName("");
        setIsCreatingProject(false);
    };

    const handleStartEditProject = (project: Project) => {
        setEditingProjectId(project.id);
        setEditProjectName(project.name);
        setProjectMenuId(null);
    };

    const handleSaveProjectEdit = async () => {
        if (!editingProjectId || !editProjectName.trim()) return;
        await onUpdateProject(editingProjectId, editProjectName.trim());
        setEditingProjectId(null);
        setEditProjectName("");
    };

    const handleDeleteProject = (id: string) => {
        setConfirmDelete({
            type: 'project',
            id,
            message: 'Tem certeza que deseja excluir este projeto? As decisões não serão excluídas.'
        });
        setProjectMenuId(null);
    };

    // Session handlers
    const handleStartEditSession = (session: SessionItem) => {
        setEditingSessionId(session.id);
        setEditSessionName(session.title);
        setSessionMenuId(null);
    };

    const handleSaveSessionEdit = async () => {
        if (!editingSessionId || !editSessionName.trim()) return;
        await onRenameSession(editingSessionId, editSessionName.trim());
        setEditingSessionId(null);
        setEditSessionName("");
    };

    const handleDeleteSession = (id: string) => {
        setConfirmDelete({
            type: 'session',
            id,
            message: 'Tem certeza que deseja excluir esta sessão? Esta ação não pode ser desfeita.'
        });
        setSessionMenuId(null);
    };

    const handleConfirmDelete = async () => {
        if (!confirmDelete) return;
        if (confirmDelete.type === 'project') {
            await onDeleteProject(confirmDelete.id);
        } else {
            await onDeleteSession(confirmDelete.id);
        }
        setConfirmDelete(null);
    };

    const handleLogout = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    const formatRelativeTime = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - new Date(date).getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (minutes < 1) return "agora";
        if (minutes < 60) return `${minutes}min`;
        if (hours < 24) return `${hours}h`;
        if (days < 7) return `${days}d`;
        return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    };

    return (
        <aside className="w-72 h-full bg-card border-r border-border flex flex-col">
            {/* Logo */}
            <header className="px-5 py-4 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">h</span>
                    </div>
                    <div>
                        <h1 className="font-bold text-foreground">hold.ai</h1>
                        <p className="text-xs text-muted-foreground">Decision Intelligence</p>
                    </div>
                </div>
            </header>

            {/* New Session Button */}
            <div className="px-4 pt-4 pb-2">
                <button
                    onClick={onNewSession}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold text-sm transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nova Sessão
                </button>
            </div>

            {/* Conselheiros Button (EXTERNAL - fora do menu do usuário) */}
            <div className="px-4 pb-3">
                <button
                    onClick={onOpenConselheiros}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-background transition-colors border border-border"
                >
                    <span className="text-base">👥</span>
                    <span>Conselheiros</span>
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-4 py-2">
                {/* Project Selector */}
                <div className="mb-4 relative">
                    {/* Project Selector Button */}
                    <button
                        data-menu-trigger
                        onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                        className={`
                            w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all
                            bg-gradient-to-r from-background to-background/50
                            border border-border hover:border-primary/50
                            ${showProjectDropdown ? 'border-primary ring-2 ring-primary/20' : ''}
                        `}
                    >
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-violet-500/20 flex items-center justify-center">
                                <span className="text-lg">📁</span>
                            </div>
                            <div className="text-left min-w-0">
                                <p className="font-medium text-foreground truncate">
                                    {selectedProjectId
                                        ? activeProjects.find(p => p.id === selectedProjectId)?.name || 'Projeto'
                                        : 'Todas as Decisões'
                                    }
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {selectedProjectId ? 'Filtrado' : `${activeProjects.length}/${maxProjects} projetos`}
                                </p>
                            </div>
                        </div>
                        <svg
                            className={`w-4 h-4 text-muted-foreground transition-transform ${showProjectDropdown ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {/* Project Dropdown */}
                    {showProjectDropdown && (
                        <div
                            className="absolute left-0 right-0 top-full mt-2 bg-card border border-border rounded-xl shadow-xl z-30 overflow-hidden animate-slideUp"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* All Projects */}
                            <button
                                onClick={() => {
                                    onSelectProject(null);
                                    setShowProjectDropdown(false);
                                }}
                                className={`
                                    w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors
                                    ${selectedProjectId === null
                                        ? 'bg-primary/10 text-primary'
                                        : 'hover:bg-background text-foreground'
                                    }
                                `}
                            >
                                <span className="text-lg">✨</span>
                                <span className="font-medium">Todas as Decisões</span>
                                {selectedProjectId === null && (
                                    <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </button>

                            {activeProjects.length > 0 && <div className="border-t border-border" />}

                            {/* Project List */}
                            {activeProjects.map((project) => (
                                <div
                                    key={project.id}
                                    className={`
                                        flex items-center gap-3 px-4 py-3 text-sm transition-colors group
                                        ${selectedProjectId === project.id
                                            ? 'bg-primary/10 text-primary'
                                            : 'hover:bg-background text-foreground'
                                        }
                                    `}
                                >
                                    {editingProjectId === project.id ? (
                                        <div className="flex-1 flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={editProjectName}
                                                onChange={(e) => setEditProjectName(e.target.value)}
                                                autoFocus
                                                className="flex-1 px-2 py-1 bg-background border border-border rounded text-sm focus:outline-none focus:border-primary"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleSaveProjectEdit();
                                                        setShowProjectDropdown(false);
                                                    }
                                                    if (e.key === 'Escape') setEditingProjectId(null);
                                                }}
                                            />
                                            <button onClick={() => { handleSaveProjectEdit(); setShowProjectDropdown(false); }} className="text-primary text-xs font-medium">✓</button>
                                            <button onClick={() => setEditingProjectId(null)} className="text-muted text-xs">✕</button>
                                        </div>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => {
                                                    onSelectProject(project.id);
                                                    setShowProjectDropdown(false);
                                                }}
                                                className="flex-1 flex items-center gap-3 text-left"
                                            >
                                                <span className="text-lg opacity-70">📁</span>
                                                <span className="font-medium truncate">{project.name}</span>
                                                {(project.decisionCount ?? 0) > 0 && (
                                                    <span className="text-xs text-muted bg-background px-1.5 py-0.5 rounded ml-auto mr-2">
                                                        {project.decisionCount}
                                                    </span>
                                                )}
                                                {selectedProjectId === project.id && (
                                                    <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </button>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleStartEditProject(project); }}
                                                    className="p-1 hover:bg-background rounded text-muted-foreground hover:text-foreground"
                                                    title="Renomear"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteProject(project.id); }}
                                                    className="p-1 hover:bg-red-500/10 rounded text-muted-foreground hover:text-red-500"
                                                    title="Excluir"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}

                            {/* Create New Project */}
                            {canCreateProject && (
                                <>
                                    <div className="border-t border-border" />
                                    {isCreatingProject ? (
                                        <div className="p-3">
                                            <input
                                                type="text"
                                                value={newProjectName}
                                                onChange={(e) => setNewProjectName(e.target.value)}
                                                placeholder="Nome do novo projeto..."
                                                autoFocus
                                                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') { handleCreateProject(); setShowProjectDropdown(false); }
                                                    if (e.key === 'Escape') setIsCreatingProject(false);
                                                }}
                                            />
                                            <div className="flex gap-2 mt-2">
                                                <button
                                                    onClick={() => { handleCreateProject(); setShowProjectDropdown(false); }}
                                                    disabled={!newProjectName.trim()}
                                                    className="flex-1 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium disabled:opacity-50"
                                                >
                                                    Criar
                                                </button>
                                                <button
                                                    onClick={() => setIsCreatingProject(false)}
                                                    className="px-3 py-1.5 text-muted-foreground text-xs"
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setIsCreatingProject(true)}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-primary hover:bg-primary/5 transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            <span className="font-medium">Novo Projeto</span>
                                            <span className="text-xs text-muted ml-auto">
                                                {activeProjects.length}/{maxProjects}
                                            </span>
                                        </button>
                                    )}
                                </>
                            )}

                            {!canCreateProject && (
                                <>
                                    <div className="border-t border-border" />
                                    <div className="px-4 py-3 text-xs text-muted-foreground text-center">
                                        Limite de {maxProjects} projetos atingido
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Sessions Section */}
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            Sessões Recentes
                        </span>
                        {activeSessions.length > 0 && (
                            <span className="text-xs text-muted bg-background px-1.5 py-0.5 rounded">
                                {activeSessions.length}
                            </span>
                        )}
                    </div>

                    {activeSessions.length > 0 ? (
                        activeSessions.map((session) => (
                            <div key={session.id} className="relative mb-0.5">
                                {editingSessionId === session.id ? (
                                    <div className="p-2 bg-background rounded-lg border border-primary">
                                        <input
                                            type="text"
                                            value={editSessionName}
                                            onChange={(e) => setEditSessionName(e.target.value)}
                                            autoFocus
                                            className="w-full px-2 py-1 bg-transparent border-none text-sm text-foreground focus:outline-none"
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") handleSaveSessionEdit();
                                                if (e.key === "Escape") setEditingSessionId(null);
                                            }}
                                        />
                                        <div className="flex gap-2 mt-2">
                                            <button onClick={handleSaveSessionEdit} className="flex-1 px-2 py-1 bg-primary text-white rounded text-xs">Salvar</button>
                                            <button onClick={() => setEditingSessionId(null)} className="px-2 py-1 text-muted-foreground text-xs">Cancelar</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center group overflow-hidden">
                                        <button
                                            onClick={() => onResumeSession(session.id)}
                                            className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-background transition-colors text-left min-w-0"
                                        >
                                            {/* Mode Icon - Subtle differentiation */}
                                            <div className={`
                                                shrink-0 w-7 h-7 rounded-md flex items-center justify-center
                                                ${session.mode === 'mesa'
                                                    ? 'bg-violet-500/15 text-violet-400'
                                                    : 'bg-primary/15 text-primary'
                                                }
                                            `}>
                                                {session.mode === 'mesa' ? (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0 overflow-hidden">
                                                <p className="truncate text-foreground group-hover:text-primary transition-colors">
                                                    {session.title}
                                                </p>
                                                <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                                                    <span className={session.mode === 'mesa' ? 'text-violet-400' : 'text-primary'}>
                                                        {session.mode === 'mesa' ? 'Mesa' : 'Solo'}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{PHASE_ICONS[session.phase]}</span>
                                                    <span>Fase {session.phase}</span>
                                                    <span>•</span>
                                                    <span>{formatRelativeTime(session.updatedAt)}</span>
                                                </p>
                                            </div>
                                        </button>

                                        {/* Options Button - Always visible */}
                                        <button
                                            data-menu-trigger
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSessionMenuId(sessionMenuId === session.id ? null : session.id);
                                            }}
                                            className="shrink-0 p-1.5 opacity-0 group-hover:opacity-100 hover:bg-background rounded transition-all"
                                        >
                                            <svg className="w-4 h-4 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                            </svg>
                                        </button>

                                        {/* Options Menu */}
                                        {sessionMenuId === session.id && (
                                            <div
                                                className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg z-20 py-1 min-w-[120px]"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <button
                                                    onClick={() => handleStartEditSession(session)}
                                                    className="w-full px-3 py-2 text-sm text-left hover:bg-background flex items-center gap-2"
                                                >
                                                    <span>✏️</span> Renomear
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteSession(session.id)}
                                                    className="w-full px-3 py-2 text-sm text-left hover:bg-red-500/10 text-red-500 flex items-center gap-2"
                                                >
                                                    <span>🗑️</span> Excluir
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-4 text-sm text-muted-foreground">
                            <p>Nenhuma sessão ainda</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer: User Menu */}
            <footer className="border-t border-border p-4">
                <div className="relative">
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-background transition-colors"
                    >
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-white font-semibold">
                            {user?.displayName?.charAt(0) || user?.email?.charAt(0) || "U"}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                                {user?.displayName || "Usuário"}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                                {user?.email}
                            </p>
                        </div>
                        <svg className={`w-4 h-4 text-muted-foreground transition-transform ${showUserMenu ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {/* Dropdown Menu - SEM "Gerenciar Conselheiros" */}
                    {showUserMenu && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShowUserMenu(false)}
                            />
                            <div className="absolute bottom-full left-0 right-0 mb-2 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-20">
                                {/* Editar Perfil */}
                                <button
                                    onClick={() => {
                                        setShowUserMenu(false);
                                        onOpenProfile();
                                    }}
                                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-background transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Editar Perfil
                                </button>

                                {/* Preferências */}
                                <button
                                    onClick={() => {
                                        setShowUserMenu(false);
                                        onOpenSettings();
                                    }}
                                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-background transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Preferências
                                </button>

                                <div className="h-px bg-border my-1" />

                                {/* Sair */}
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Sair
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </footer>

            {/* Confirmation Modal */}
            <ConfirmModal
                isOpen={!!confirmDelete}
                title={confirmDelete?.type === 'project' ? 'Excluir Projeto' : 'Excluir Sessão'}
                message={confirmDelete?.message || ''}
                confirmLabel="Excluir"
                cancelLabel="Cancelar"
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirmDelete(null)}
                isDestructive
            />
        </aside>
    );
}
