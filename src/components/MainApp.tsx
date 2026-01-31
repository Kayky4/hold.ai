/**
 * 🏠 MainApp Component
 * 
 * App principal do HoldAI.
 * CRM como tela principal, Chat como modal.
 * 
 * @see visao_holdai.md — "O Chat é a entrada. O CRM é o produto."
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import CRMSidebar, { SessionItem } from "./CRMSidebar";
import { NorthStarCard } from "./CRM/NorthStarCard";
import { DecisionKanban } from "./CRM/DecisionKanban";
import { DecisionList } from "./CRM/DecisionList";
import SessionModal from "./SessionModal";
import SettingsModal from "./SettingsModal";
import EditProfileModal from "./EditProfileModal";
import PersonaManager from "./PersonaManager";
import ThemeToggle from "./ThemeToggle";
import { useCRM } from "@/hooks/useCRM";
import { DecisionWithCRM } from "@/types/crm";
import { Persona } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { getConversations, deleteConversation, updateConversationTitle } from "@/lib/conversations";
import OnboardingTour from "./OnboardingTour";

export default function MainApp() {
    const { user } = useAuth();
    const userId = user?.uid || "";

    // UI States
    const [showSessionModal, setShowSessionModal] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [showPersonaManager, setShowPersonaManager] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);

    // Session to resume
    const [resumeSessionId, setResumeSessionId] = useState<string | null>(null);

    // Active Sessions
    const [activeSessions, setActiveSessions] = useState<SessionItem[]>([]);

    // Tour state
    const [showTour, setShowTour] = useState(false);

    const {
        northStar,
        projects,
        decisionsByStatus,
        selectedProjectId,
        viewMode,
        isLoading,
        error,
        setNorthStar,
        updateNorthStar,
        createProject,
        updateProject,
        deleteProject,
        selectProject,
        setViewMode
    } = useCRM(userId || null);

    // Load active sessions
    const loadActiveSessions = useCallback(async () => {
        if (!userId) return;
        try {
            const conversations = await getConversations(userId);
            const sessions = conversations.slice(0, 10).map((c): SessionItem => ({
                id: c.id,
                title: c.title || "Sessão sem título",
                phase: c.phase || 'H',
                mode: c.mode || 'solo',
                counselorCount: c.counselorCount,
                updatedAt: c.updatedAt
            }));
            setActiveSessions(sessions);
        } catch (error) {
            console.error("Error loading sessions:", error);
        }
    }, [userId]);

    useEffect(() => {
        loadActiveSessions();
    }, [loadActiveSessions]);

    // Detect mobile
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) setShowMobileSidebar(false);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Calculate total decisions
    const totalDecisions = Object.values(decisionsByStatus).reduce(
        (sum, arr) => sum + arr.length, 0
    );

    // Handlers
    const handleDecisionClick = (decision: DecisionWithCRM) => {
        // TODO: Open decision detail modal
        console.log('Decision clicked:', decision);
    };

    const handleNewSession = () => {
        setResumeSessionId(null);
        setShowSessionModal(true);
        if (isMobile) setShowMobileSidebar(false);
    };

    const handleResumeSession = (sessionId: string) => {
        setResumeSessionId(sessionId);
        setShowSessionModal(true);
        if (isMobile) setShowMobileSidebar(false);
    };

    const handleRenameSession = async (sessionId: string, newName: string) => {
        await updateConversationTitle(sessionId, newName);
        await loadActiveSessions();
    };

    const handleDeleteSession = async (sessionId: string) => {
        await deleteConversation(sessionId);
        await loadActiveSessions();
    };

    const handleUpdateProject = async (id: string, name: string) => {
        await updateProject(id, { name });
    };

    const handleOpenProfile = () => {
        setShowEditProfile(true);
    };

    const handleOpenConselheiros = () => {
        setShowPersonaManager(true);
    };

    const handleSelectPersona = (persona: Persona) => {
        setShowPersonaManager(false);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-background">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Carregando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            {/* Desktop Sidebar */}
            {!isMobile && (
                <CRMSidebar
                    projects={projects}
                    selectedProjectId={selectedProjectId}
                    onSelectProject={selectProject}
                    onCreateProject={createProject}
                    onUpdateProject={handleUpdateProject}
                    onDeleteProject={deleteProject}
                    onNewSession={handleNewSession}
                    onOpenSettings={() => setShowSettings(true)}
                    onOpenProfile={handleOpenProfile}
                    onOpenConselheiros={handleOpenConselheiros}
                    onResumeSession={handleResumeSession}
                    onRenameSession={handleRenameSession}
                    onDeleteSession={handleDeleteSession}
                    northStar={northStar}
                    activeSessions={activeSessions}
                    maxProjects={3}
                />
            )}

            {/* Mobile Sidebar Overlay */}
            {isMobile && showMobileSidebar && (
                <>
                    <div
                        className="fixed inset-0 bg-black/50 z-40"
                        onClick={() => setShowMobileSidebar(false)}
                    />
                    <div className="fixed left-0 top-0 bottom-0 z-50 animate-slideRight">
                        <CRMSidebar
                            projects={projects}
                            selectedProjectId={selectedProjectId}
                            onSelectProject={(id) => {
                                selectProject(id);
                                setShowMobileSidebar(false);
                            }}
                            onCreateProject={createProject}
                            onUpdateProject={handleUpdateProject}
                            onDeleteProject={deleteProject}
                            onNewSession={handleNewSession}
                            onOpenSettings={() => {
                                setShowSettings(true);
                                setShowMobileSidebar(false);
                            }}
                            onOpenProfile={() => {
                                handleOpenProfile();
                                setShowMobileSidebar(false);
                            }}
                            onOpenConselheiros={() => {
                                handleOpenConselheiros();
                                setShowMobileSidebar(false);
                            }}
                            onResumeSession={(id) => {
                                handleResumeSession(id);
                                setShowMobileSidebar(false);
                            }}
                            onRenameSession={handleRenameSession}
                            onDeleteSession={handleDeleteSession}
                            northStar={northStar}
                            activeSessions={activeSessions}
                            maxProjects={3}
                        />
                    </div>
                </>
            )}

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Header - SEM ModelSelector */}
                <header className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-border bg-card">
                    <div className="flex items-center gap-3">
                        {/* Mobile Menu Button */}
                        {isMobile && (
                            <button
                                onClick={() => setShowMobileSidebar(true)}
                                className="p-2 rounded-lg hover:bg-background transition-colors"
                            >
                                <svg className="w-6 h-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        )}

                        <h1 className="text-lg md:text-xl font-bold text-foreground">Decisões</h1>
                        <span className="text-sm font-semibold text-muted-foreground bg-background px-3 py-1 rounded-full">
                            {totalDecisions}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 md:gap-3">
                        {/* View Mode Toggle - Funcionando */}
                        {!isMobile && (
                            <div className="flex bg-background rounded-lg p-0.5">
                                <button
                                    onClick={() => setViewMode('kanban')}
                                    className={`px-3 py-1.5 text-base rounded-md transition-all ${viewMode === 'kanban'
                                        ? 'bg-card text-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    title="Kanban"
                                >
                                    ▦
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`px-3 py-1.5 text-base rounded-md transition-all ${viewMode === 'list'
                                        ? 'bg-card text-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    title="Lista"
                                >
                                    ≡
                                </button>
                            </div>
                        )}

                        {/* Mobile: New Session Button */}
                        {isMobile && (
                            <button
                                onClick={handleNewSession}
                                className="p-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </button>
                        )}

                        <ThemeToggle />
                    </div>
                </header>

                {/* Error display */}
                {error && (
                    <div className="px-6 py-3 bg-red-500/10 text-red-500 text-sm">
                        ⚠️ {error}
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-4 md:px-6">
                    {/* North Star */}
                    <div className="pt-5" data-tour="northstar">
                        <NorthStarCard
                            northStar={northStar}
                            onSave={setNorthStar}
                            onUpdate={updateNorthStar}
                        />
                    </div>

                    {/* Filter indicator */}
                    {selectedProjectId && (
                        <div className="flex items-center justify-between px-4 py-2 bg-primary/10 rounded-lg mb-4">
                            <span className="text-sm text-muted-foreground">
                                Filtrando por: <strong className="text-primary">{projects.find(p => p.id === selectedProjectId)?.name}</strong>
                            </span>
                            <button
                                onClick={() => selectProject(null)}
                                className="text-muted-foreground hover:text-foreground text-sm p-1"
                            >
                                ✕
                            </button>
                        </div>
                    )}

                    {/* View Mode: Kanban or List */}
                    {viewMode === 'kanban' ? (
                        <DecisionKanban
                            decisionsByStatus={decisionsByStatus}
                            onDecisionClick={handleDecisionClick}
                            isMobile={isMobile}
                        />
                    ) : (
                        <DecisionList
                            decisionsByStatus={decisionsByStatus}
                            onDecisionClick={handleDecisionClick}
                        />
                    )}

                    {/* Empty State */}
                    {totalDecisions === 0 && (
                        <div className="text-center py-12">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/10 to-violet-500/10 flex items-center justify-center">
                                <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-foreground mb-2">
                                Nenhuma decisão ainda
                            </h2>
                            <p className="text-muted-foreground max-w-md mx-auto mb-6">
                                Comece uma sessão para analisar sua primeira decisão com a ajuda dos conselheiros.
                            </p>
                            <button
                                onClick={handleNewSession}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Iniciar Primeira Sessão
                            </button>
                        </div>
                    )}
                </div>
            </main>

            {/* Session Modal - passa resumeSessionId */}
            <SessionModal
                isOpen={showSessionModal}
                onClose={() => {
                    setShowSessionModal(false);
                    setResumeSessionId(null);
                    loadActiveSessions();
                }}
                resumeSessionId={resumeSessionId}
            />

            {/* Settings Modal */}
            <SettingsModal
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
            />

            {/* Edit Profile Modal */}
            <EditProfileModal
                isOpen={showEditProfile}
                onClose={() => setShowEditProfile(false)}
            />

            {/* Persona Manager Modal */}
            {showPersonaManager && (
                <PersonaManager
                    selectedPersonaId={null}
                    onSelectPersona={handleSelectPersona}
                    onClose={() => setShowPersonaManager(false)}
                />
            )}

            {/* Onboarding Tour */}
            {showTour && (
                <OnboardingTour
                    onComplete={() => setShowTour(false)}
                    onSkip={() => setShowTour(false)}
                />
            )}
        </div>
    );
}
