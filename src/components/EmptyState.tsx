/**
 * 📭 EmptyState Component
 * 
 * Estado vazio reutilizável com ilustração e ação opcional.
 * Usado quando não há dados para exibir.
 * 
 * @see design_system.md — Tom firme, não friendly
 */

"use client";

interface EmptyStateProps {
    /** Ícone SVG ou nó React */
    icon?: React.ReactNode;
    /** Título do estado vazio */
    title: string;
    /** Descrição opcional */
    description?: string;
    /** Texto do botão de ação */
    actionLabel?: string;
    /** Callback da ação */
    onAction?: () => void;
    /** Tamanho do componente */
    size?: "sm" | "md" | "lg";
}

// Ícones pré-definidos para estados comuns
const DEFAULT_ICONS = {
    decision: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
    ),
    project: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
    ),
    persona: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    session: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
    ),
    search: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
    ),
};

export default function EmptyState({
    icon,
    title,
    description,
    actionLabel,
    onAction,
    size = "md",
}: EmptyStateProps) {
    // Size variants
    const sizeStyles = {
        sm: {
            wrapper: "py-6",
            iconBox: "w-14 h-14",
            iconScale: "scale-75",
            title: "text-sm",
            description: "text-xs",
            button: "px-3 py-1.5 text-xs",
        },
        md: {
            wrapper: "py-10",
            iconBox: "w-20 h-20",
            iconScale: "",
            title: "text-base",
            description: "text-sm",
            button: "px-4 py-2 text-sm",
        },
        lg: {
            wrapper: "py-16",
            iconBox: "w-28 h-28",
            iconScale: "scale-125",
            title: "text-lg",
            description: "text-base",
            button: "px-6 py-3 text-base",
        },
    };

    const styles = sizeStyles[size];

    return (
        <div className={`flex flex-col items-center justify-center text-center ${styles.wrapper}`}>
            {/* Icon Container */}
            <div className={`${styles.iconBox} rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 text-slate-400 dark:text-slate-500 ${styles.iconScale}`}>
                {icon || DEFAULT_ICONS.decision}
            </div>

            {/* Title */}
            <h3 className={`font-semibold text-foreground mb-1 ${styles.title}`}>
                {title}
            </h3>

            {/* Description */}
            {description && (
                <p className={`text-slate-500 dark:text-slate-400 max-w-xs ${styles.description}`}>
                    {description}
                </p>
            )}

            {/* Action Button */}
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className={`mt-4 bg-slate-800 dark:bg-white dark:text-slate-900 text-white font-medium rounded-xl hover:bg-slate-700 dark:hover:bg-slate-100 transition-colors ${styles.button}`}
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
}

// Export icons for direct use
export { DEFAULT_ICONS as EmptyStateIcons };
