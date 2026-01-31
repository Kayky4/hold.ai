/**
 * ⚙️ Settings Modal
 * 
 * Modal de preferências do usuário.
 * Inclui notificações e exclusão de conta.
 * 
 * @see design_system.md — Industrial Minimal / Strategic Severity
 * @see frontend-design skill — Distinctive, Production-Grade
 * @see regras_decisoes.md — Deleção de Dados, Notificações
 */

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
    getUserSettings,
    updateNotificationSettings,
    NotificationSettings,
} from "@/lib/userSettings";
import {
    deleteAccount,
    validateDeletionConfirmation,
    DeletionProgress,
} from "@/lib/deleteAccount";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type SettingsTab = "notifications" | "account";

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const { user, signOut } = useAuth();
    const router = useRouter();

    // Tab state
    const [activeTab, setActiveTab] = useState<SettingsTab>("notifications");

    // Notification settings
    const [notifications, setNotifications] = useState<NotificationSettings>({
        reviewReminders: true,
        reminderDays: 7,
        inAppNotifications: true,
        emailNotifications: false,
        pushNotifications: false,
    });
    const [loadingSettings, setLoadingSettings] = useState(true);
    const [savingSettings, setSavingSettings] = useState(false);

    // Delete account state
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteConfirmInput, setDeleteConfirmInput] = useState("");
    const [deletionProgress, setDeletionProgress] = useState<DeletionProgress | null>(null);
    const [deletionError, setDeletionError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Load settings on open
    useEffect(() => {
        if (isOpen && user) {
            loadSettings();
        }
    }, [isOpen, user]);

    const loadSettings = async () => {
        if (!user) return;
        setLoadingSettings(true);
        try {
            const settings = await getUserSettings(user.uid);
            setNotifications(settings.notifications);
        } catch (error) {
            console.error("[Settings] Load error:", error);
        } finally {
            setLoadingSettings(false);
        }
    };

    const handleNotificationChange = async (
        key: keyof NotificationSettings,
        value: boolean | number
    ) => {
        if (!user) return;

        const updated = { ...notifications, [key]: value };
        setNotifications(updated);

        setSavingSettings(true);
        try {
            await updateNotificationSettings(user.uid, { [key]: value });
        } catch (error) {
            console.error("[Settings] Save error:", error);
            // Revert on error
            setNotifications(notifications);
        } finally {
            setSavingSettings(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!user || !validateDeletionConfirmation(deleteConfirmInput)) {
            return;
        }

        setIsDeleting(true);
        setDeletionError(null);

        try {
            await deleteAccount(user, (progress) => {
                setDeletionProgress(progress);
            });

            // Account deleted successfully - redirect to login
            router.push("/");
        } catch (error: any) {
            console.error("[Settings] Delete account error:", error);

            // Check for re-authentication required
            if (error.code === "auth/requires-recent-login") {
                setDeletionError(
                    "Por segurança, você precisa fazer login novamente antes de excluir sua conta."
                );
            } else {
                setDeletionError(
                    error.message || "Erro ao excluir conta. Tente novamente."
                );
            }
            setIsDeleting(false);
            setDeletionProgress(null);
        }
    };

    const resetDeleteState = () => {
        setShowDeleteConfirm(false);
        setDeleteConfirmInput("");
        setDeletionError(null);
        setDeletionProgress(null);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scaleIn">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">
                                Preferências
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Personalize sua experiência
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-background transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-border">
                    <button
                        onClick={() => setActiveTab("notifications")}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === "notifications"
                            ? "text-foreground border-b-2 border-primary bg-background/50"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        <span className="flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            Notificações
                        </span>
                    </button>
                    <button
                        onClick={() => { setActiveTab("account"); resetDeleteState(); }}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === "account"
                            ? "text-foreground border-b-2 border-primary bg-background/50"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        <span className="flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Conta
                        </span>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {/* Notifications Tab */}
                    {activeTab === "notifications" && (
                        <div className="space-y-4">
                            {loadingSettings ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                </div>
                            ) : (
                                <>
                                    {/* Review Reminders */}
                                    <div className="flex items-center justify-between p-4 bg-background rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                                                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-foreground">Lembretes de Revisão</p>
                                                <p className="text-xs text-muted-foreground">Aviso quando decisões precisam ser revisadas</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleNotificationChange("reviewReminders", !notifications.reviewReminders)}
                                            className={`relative w-11 h-6 rounded-full transition-colors overflow-hidden flex-shrink-0 ${notifications.reviewReminders ? "bg-primary" : "bg-border"
                                                }`}
                                            disabled={savingSettings}
                                        >
                                            <span
                                                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all duration-200 shadow-sm ${notifications.reviewReminders ? "translate-x-5" : "translate-x-0"
                                                    }`}
                                            />
                                        </button>
                                    </div>

                                    {/* Reminder Days */}
                                    {notifications.reviewReminders && (
                                        <div className="p-4 bg-background rounded-xl">
                                            <div className="flex items-center justify-between mb-3">
                                                <p className="text-sm font-medium text-foreground">Dias de antecedência</p>
                                                <span className="text-sm font-semibold text-primary">{notifications.reminderDays} dias</span>
                                            </div>
                                            <input
                                                type="range"
                                                min={1}
                                                max={30}
                                                value={notifications.reminderDays}
                                                onChange={(e) => handleNotificationChange("reminderDays", parseInt(e.target.value))}
                                                className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
                                            />
                                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                                <span>1 dia</span>
                                                <span>30 dias</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* In-App Notifications */}
                                    <div className="flex items-center justify-between p-4 bg-background rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-foreground">Notificações In-App</p>
                                                <p className="text-xs text-muted-foreground">Alertas dentro da plataforma</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleNotificationChange("inAppNotifications", !notifications.inAppNotifications)}
                                            className={`relative w-11 h-6 rounded-full transition-colors overflow-hidden flex-shrink-0 ${notifications.inAppNotifications ? "bg-primary" : "bg-border"
                                                }`}
                                            disabled={savingSettings}
                                        >
                                            <span
                                                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all duration-200 shadow-sm ${notifications.inAppNotifications ? "translate-x-5" : "translate-x-0"
                                                    }`}
                                            />
                                        </button>
                                    </div>

                                    {/* Email Notifications (Coming Soon) */}
                                    <div className="flex items-center justify-between p-4 bg-background rounded-xl opacity-60">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
                                                <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-foreground">Email</p>
                                                <p className="text-xs text-muted-foreground">Em breve</p>
                                            </div>
                                        </div>
                                        <span className="text-xs text-muted bg-border px-2 py-1 rounded-full">Em breve</span>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Account Tab */}
                    {activeTab === "account" && (
                        <div className="space-y-6">
                            {/* Danger Zone */}
                            <div className="p-4 border border-red-500/30 bg-red-500/5 rounded-xl">
                                <h3 className="text-sm font-semibold text-red-500 mb-2 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    Zona de Perigo
                                </h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Ações irreversíveis que afetam permanentemente sua conta.
                                </p>

                                {!showDeleteConfirm ? (
                                    <button
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="w-full px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 rounded-xl text-sm font-medium transition-colors"
                                    >
                                        Excluir minha conta
                                    </button>
                                ) : (
                                    <div className="space-y-4 animate-fadeIn">
                                        {deletionError && (
                                            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-sm text-red-400">
                                                {deletionError}
                                            </div>
                                        )}

                                        {isDeleting ? (
                                            <div className="text-center py-4">
                                                <div className="w-8 h-8 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto mb-3" />
                                                <p className="text-sm text-foreground font-medium">
                                                    {deletionProgress?.step || "Excluindo dados..."}
                                                </p>
                                                {deletionProgress && (
                                                    <div className="mt-2 w-full h-2 bg-border rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-red-500 transition-all duration-300"
                                                            style={{
                                                                width: `${(deletionProgress.current / deletionProgress.total) * 100}%`
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <>
                                                <div className="p-3 bg-red-500/10 rounded-lg">
                                                    <p className="text-sm text-red-400 font-medium mb-1">
                                                        ⚠️ Esta ação não pode ser desfeita
                                                    </p>
                                                    <p className="text-xs text-red-400/80">
                                                        Todos os seus dados serão permanentemente excluídos, incluindo projetos, decisões, sessões e configurações.
                                                    </p>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-foreground mb-2">
                                                        Digite <strong>EXCLUIR</strong> para confirmar
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={deleteConfirmInput}
                                                        onChange={(e) => setDeleteConfirmInput(e.target.value)}
                                                        placeholder="EXCLUIR"
                                                        className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500"
                                                    />
                                                </div>

                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={resetDeleteState}
                                                        className="flex-1 px-4 py-2.5 bg-background border border-border text-foreground rounded-xl text-sm font-medium hover:bg-border transition-colors"
                                                    >
                                                        Cancelar
                                                    </button>
                                                    <button
                                                        onClick={handleDeleteAccount}
                                                        disabled={!validateDeletionConfirmation(deleteConfirmInput)}
                                                        className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        Excluir permanentemente
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-border bg-background">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-xl transition-colors"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}
