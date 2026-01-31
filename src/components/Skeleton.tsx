/**
 * 💀 Skeleton Loading Components
 * 
 * Componentes de loading skeleton para feedback visual durante carregamento.
 * Usa a animação shimmer definida em globals.css
 * 
 * @see design_system.md — Loading states
 */

"use client";

interface SkeletonProps {
    className?: string;
}

// Base Skeleton component
export function Skeleton({ className = "" }: SkeletonProps) {
    return (
        <div className={`skeleton rounded ${className}`} />
    );
}

// Text line skeleton
export function SkeletonText({ lines = 3, className = "" }: { lines?: number; className?: string }) {
    return (
        <div className={`space-y-2 ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    className={`h-4 ${i === lines - 1 ? "w-3/4" : "w-full"}`}
                />
            ))}
        </div>
    );
}

// Card skeleton
export function SkeletonCard({ className = "" }: SkeletonProps) {
    return (
        <div className={`bg-card border border-border rounded-xl p-4 ${className}`}>
            <div className="flex items-start gap-3">
                <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-3/4" />
                </div>
            </div>
            <div className="mt-4 space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
            </div>
        </div>
    );
}

// Decision card skeleton (for Kanban)
export function SkeletonDecisionCard() {
    return (
        <div className="bg-card border border-border rounded-xl p-4 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <div className="flex gap-2 mt-3">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
            </div>
        </div>
    );
}

// List item skeleton
export function SkeletonListItem() {
    return (
        <div className="flex items-center gap-3 py-3 px-4 border-b border-border last:border-0">
            <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" />
            <div className="flex-1">
                <Skeleton className="h-4 w-1/3 mb-1" />
                <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="w-6 h-6 rounded flex-shrink-0" />
        </div>
    );
}

// Avatar skeleton
export function SkeletonAvatar({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
    const sizeClasses = {
        sm: "w-8 h-8",
        md: "w-10 h-10",
        lg: "w-14 h-14",
    };
    return <Skeleton className={`${sizeClasses[size]} rounded-full`} />;
}

// Button skeleton
export function SkeletonButton({ width = "w-24" }: { width?: string }) {
    return <Skeleton className={`h-10 ${width} rounded-xl`} />;
}

// Kanban column skeleton
export function SkeletonKanbanColumn() {
    return (
        <div className="flex-1 min-w-[280px] max-w-[320px]">
            <div className="flex items-center gap-2 mb-3 px-1">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-6 rounded-full" />
            </div>
            <div className="space-y-3">
                <SkeletonDecisionCard />
                <SkeletonDecisionCard />
            </div>
        </div>
    );
}

// Full page loading skeleton
export function SkeletonPage() {
    return (
        <div className="p-6 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-10 w-32 rounded-xl" />
            </div>

            {/* Content grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
            </div>
        </div>
    );
}

export default Skeleton;
