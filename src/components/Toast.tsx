/**
 * 🔔 Toast Component
 * 
 * Sistema de notificações toast premium com animações suaves.
 */

"use client";

import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
    message: string;
    type?: ToastType;
    duration?: number;
    onClose: () => void;
}

const ICONS: Record<ToastType, React.ReactNode> = {
    success: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
    ),
    error: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    warning: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
    ),
    info: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
};

const COLORS: Record<ToastType, { bg: string; border: string; icon: string; text: string }> = {
    success: {
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        icon: "text-emerald-500",
        text: "text-emerald-400"
    },
    error: {
        bg: "bg-red-500/10",
        border: "border-red-500/20",
        icon: "text-red-500",
        text: "text-red-400"
    },
    warning: {
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
        icon: "text-amber-500",
        text: "text-amber-400"
    },
    info: {
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
        icon: "text-blue-500",
        text: "text-blue-400"
    },
};

export default function Toast({ message, type = "success", duration = 3000, onClose }: ToastProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);

    const colors = COLORS[type];

    useEffect(() => {
        // Animate in
        requestAnimationFrame(() => {
            setIsVisible(true);
        });

        // Auto-dismiss
        const timer = setTimeout(() => {
            handleClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration]);

    const handleClose = () => {
        setIsLeaving(true);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    return (
        <div
            className={`
                fixed bottom-6 right-6 z-[100] max-w-sm
                transform transition-all duration-300 ease-out
                ${isVisible && !isLeaving ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
            `}
        >
            <div
                className={`
                    flex items-center gap-3 px-4 py-3.5 rounded-xl
                    ${colors.bg} border ${colors.border}
                    backdrop-blur-xl shadow-2xl
                `}
            >
                {/* Icon with pulse animation */}
                <div className={`shrink-0 ${colors.icon}`}>
                    <div className="relative">
                        {ICONS[type]}
                        {type === "success" && (
                            <div className="absolute inset-0 animate-ping opacity-50">
                                {ICONS[type]}
                            </div>
                        )}
                    </div>
                </div>

                {/* Message */}
                <p className={`text-sm font-medium ${colors.text}`}>
                    {message}
                </p>

                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="shrink-0 ml-2 p-1 rounded-lg hover:bg-white/10 transition-colors"
                >
                    <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Progress bar */}
            <div className="mt-1 mx-2 h-0.5 bg-white/10 rounded-full overflow-hidden">
                <div
                    className={`h-full ${colors.icon.replace('text-', 'bg-')} rounded-full`}
                    style={{
                        animation: `shrink ${duration}ms linear forwards`,
                    }}
                />
            </div>

            <style jsx>{`
                @keyframes shrink {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `}</style>
        </div>
    );
}

// Toast container hook for easy usage
interface ToastState {
    message: string;
    type: ToastType;
    id: number;
}

let toastId = 0;

export function useToast() {
    const [toasts, setToasts] = useState<ToastState[]>([]);

    const showToast = (message: string, type: ToastType = "success") => {
        const id = ++toastId;
        setToasts(prev => [...prev, { message, type, id }]);
    };

    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const ToastContainer = () => (
        <>
            {toasts.map((toast, index) => (
                <div
                    key={toast.id}
                    style={{ bottom: `${24 + index * 80}px` }}
                    className="fixed right-6 z-[100]"
                >
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => removeToast(toast.id)}
                    />
                </div>
            ))}
        </>
    );

    return { showToast, ToastContainer };
}
