"use client";

import { useState } from "react";
import { Conversation } from "@/types";
import { ProjectContext } from "@/types/project";
import { Meeting } from "@/lib/meetings";
import ConfirmModal from "./ConfirmModal";
import ProjectSwitcher from "./ProjectSwitcher";
import EditProfileModal from "./EditProfileModal";
import { useAuth } from "@/contexts/AuthContext";

// User Menu Component
function UserMenu() {
    const { user, profile, signOut } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

    if (!user) return null;

    const displayName = profile?.displayName || user.displayName || user.email?.split("@")[0] || "Usuário";
    const initial = displayName.charAt(0).toUpperCase();

    return (
        <>
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-background transition-colors"
                >
                    {user.photoURL ? (
                        <img
                            src={user.photoURL}
                            alt={displayName}
                            className="w-9 h-9 rounded-lg object-cover"
                        />
                    ) : (
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center">
                            <span className="text-white font-medium text-sm">{initial}</span>
                        </div>
                    )}
                    <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-foreground truncate">
                            {displayName}
                        </p>
                        <p className="text-xs text-muted truncate">
                            {user.email}
                        </p>
                    </div>
                    <svg
                        className={`w-4 h-4 text-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setIsOpen(false)}
                        />
                        <div className="absolute bottom-full left-0 right-0 mb-1 bg-card border border-border rounded-xl shadow-lg p-1 z-20 animate-scale-in">
                            {/* Edit Profile */}
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    setIsEditProfileOpen(true);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-border rounded-lg transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Editar Perfil
                            </button>

                            {/* Divider */}
                            <div className="h-px bg-border my-1" />

                            {/* Sign Out */}
                            <button
                                onClick={async () => {
                                    setIsOpen(false);
                                    await signOut();
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
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

            {/* Edit Profile Modal */}
            <EditProfileModal
                isOpen={isEditProfileOpen}
                onClose={() => setIsEditProfileOpen(false)}
            />
        </>
    );
}


interface SidebarProps {
    conversations: Conversation[];
    meetings: Meeting[];
    activeConversationId: string | null;
    activeMeetingId: string | null;
    currentProject: ProjectContext | null;
    onSelectConversation: (id: string) => void;
    onSelectMeeting: (meeting: Meeting) => void;
    onNewConversation: () => void;
    onDeleteConversation: (id: string) => void;
    onDeleteMeeting: (id: string) => void;
    onStartMeeting: () => void;
    onOpenSettings: () => void;
    onOpenMetrics: () => void;
    onSelectProject: (project: ProjectContext | null) => void;
    onManageProjects: () => void;
    isLoading: boolean;
}

export default function Sidebar({
    conversations,
    meetings,
    activeConversationId,
    activeMeetingId,
    currentProject,
    onSelectConversation,
    onSelectMeeting,
    onNewConversation,
    onDeleteConversation,
    onDeleteMeeting,
    onStartMeeting,
    onOpenSettings,
    onOpenMetrics,
    onSelectProject,
    onManageProjects,
    isLoading,
}: SidebarProps) {
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [conversationToDelete, setConversationToDelete] = useState<Conversation | null>(null);
    const [meetingToDelete, setMeetingToDelete] = useState<Meeting | null>(null);

    const handleDeleteClick = (conversation: Conversation, e: React.MouseEvent) => {
        e.stopPropagation();
        setConversationToDelete(conversation);
        setMeetingToDelete(null);
        setDeleteModalOpen(true);
    };

    const handleDeleteMeetingClick = (meeting: Meeting, e: React.MouseEvent) => {
        e.stopPropagation();
        setMeetingToDelete(meeting);
        setConversationToDelete(null);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (conversationToDelete) {
            onDeleteConversation(conversationToDelete.id);
        }
        if (meetingToDelete) {
            onDeleteMeeting(meetingToDelete.id);
        }
        setDeleteModalOpen(false);
        setConversationToDelete(null);
        setMeetingToDelete(null);
    };

    const handleCancelDelete = () => {
        setDeleteModalOpen(false);
        setConversationToDelete(null);
        setMeetingToDelete(null);
    };

    const formatDate = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            return "Hoje";
        } else if (days === 1) {
            return "Ontem";
        } else if (days < 7) {
            return `${days} dias atrás`;
        } else {
            return date.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
            });
        }
    };

    return (
        <>
            <aside className="w-72 h-screen bg-card border-r border-border flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-border">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                            <span className="text-white font-bold text-lg">h</span>
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold text-foreground">hold.ai</h1>
                            <p className="text-xs text-muted-foreground">Reuniões Estratégicas</p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                        <button
                            onClick={onNewConversation}
                            disabled={isLoading}
                            className="w-full px-4 py-2.5 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            Nova Conversa
                        </button>

                        <button
                            onClick={onStartMeeting}
                            disabled={isLoading}
                            className="w-full px-4 py-2.5 bg-gradient-to-r from-[#f97316] to-[#ef4444] hover:from-[#ea580c] hover:to-[#dc2626] disabled:opacity-50 text-white rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Iniciar Reunião
                        </button>
                    </div>
                </div>

                {/* Project Switcher */}
                <div className="px-4 py-3 border-b border-border">
                    <ProjectSwitcher
                        currentProject={currentProject}
                        onSelectProject={onSelectProject}
                        onManageProjects={onManageProjects}
                    />
                </div>

                {/* Conversations & Meetings List */}
                <div className="flex-1 overflow-y-auto p-2">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="w-6 h-6 border-2 border-muted border-t-primary rounded-full animate-spin"></div>
                        </div>
                    ) : conversations.length === 0 && meetings.length === 0 ? (
                        <div className="text-center py-8 px-4">
                            <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center mx-auto mb-3">
                                <svg className="w-6 h-6 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Nenhuma conversa ainda
                            </p>
                            <p className="text-xs text-muted mt-1">
                                Comece uma conversa ou reunião
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Meetings Section */}
                            {meetings.length > 0 && (
                                <div>
                                    <p className="text-xs font-medium text-muted uppercase tracking-wide mb-2 px-2">
                                        Reuniões
                                    </p>
                                    <div className="space-y-1">
                                        {meetings.map((meeting) => (
                                            <div
                                                key={meeting.id}
                                                onClick={() => onSelectMeeting(meeting)}
                                                className={`group relative p-3 rounded-xl cursor-pointer transition-all duration-200 ${activeMeetingId === meeting.id
                                                    ? "bg-primary/10 border border-primary/20"
                                                    : "hover:bg-background border border-transparent"
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#f97316] to-[#ef4444] flex items-center justify-center flex-shrink-0">
                                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                            </svg>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-medium text-foreground truncate">
                                                                {meeting.title}
                                                            </p>
                                                            <p className="text-xs text-muted">
                                                                {meeting.rounds} {meeting.rounds === 1 ? "turno" : "turnos"} • {formatDate(meeting.updatedAt)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={(e) => handleDeleteMeetingClick(meeting, e)}
                                                        className="p-1.5 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100 hover:bg-background text-muted hover:text-destructive"
                                                        title="Deletar reunião"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Conversations Section */}
                            {conversations.length > 0 && (
                                <div>
                                    <p className="text-xs font-medium text-muted uppercase tracking-wide mb-2 px-2">
                                        Conversas
                                    </p>
                                    <div className="space-y-1">
                                        {conversations.map((conversation) => (
                                            <div
                                                key={conversation.id}
                                                onClick={() => onSelectConversation(conversation.id)}
                                                className={`group relative p-3 rounded-xl cursor-pointer transition-all duration-200 ${activeConversationId === conversation.id
                                                    ? "bg-primary/10 border border-primary/20"
                                                    : "hover:bg-background border border-transparent"
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm font-medium truncate ${activeConversationId === conversation.id
                                                            ? "text-primary"
                                                            : "text-foreground"
                                                            }`}>
                                                            {conversation.title}
                                                        </p>
                                                        <p className="text-xs text-muted mt-0.5">
                                                            {formatDate(conversation.updatedAt)}
                                                        </p>
                                                    </div>

                                                    <button
                                                        onClick={(e) => handleDeleteClick(conversation, e)}
                                                        className="p-1.5 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100 hover:bg-background text-muted hover:text-destructive"
                                                        title="Deletar conversa"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>

                                                {conversation.messages.length > 0 && (
                                                    <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
                                                        {conversation.messages[conversation.messages.length - 1]?.content.substring(0, 60)}...
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border space-y-2">
                    {/* User Menu */}
                    <UserMenu />

                    <button
                        onClick={onOpenMetrics}
                        className="w-full px-4 py-2.5 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 hover:from-cyan-500/20 hover:to-blue-500/20 text-foreground border border-cyan-500/30 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Suas Métricas
                    </button>
                    <button
                        onClick={onOpenSettings}
                        className="w-full px-4 py-2.5 bg-background hover:bg-border text-foreground border border-border rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Preferências
                    </button>
                    <p className="text-xs text-muted text-center">
                        {conversations.length} {conversations.length === 1 ? "conversa" : "conversas"} • {meetings.length} {meetings.length === 1 ? "reunião" : "reuniões"}
                    </p>
                </div>
            </aside>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteModalOpen}
                title={meetingToDelete ? "Excluir reunião" : "Excluir conversa"}
                message={`Tem certeza que deseja excluir "${meetingToDelete?.title || conversationToDelete?.title || "este item"}"? Esta ação não pode ser desfeita.`}
                confirmLabel="Excluir"
                cancelLabel="Cancelar"
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
                isDestructive={true}
            />
        </>
    );
}
