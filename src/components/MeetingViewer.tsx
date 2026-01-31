"use client";

import { Meeting } from "@/lib/meetings";

interface MeetingViewerProps {
    meeting: Meeting;
    onClose: () => void;
}

export default function MeetingViewer({ meeting, onClose }: MeetingViewerProps) {
    const getSpeakerColor = (speakerIndex: number) => {
        switch (speakerIndex) {
            case 0:
                return "from-blue-500 to-cyan-500"; // User
            case 1:
                return "from-violet-500 to-purple-500"; // Persona 1
            case 2:
                return "from-orange-500 to-red-500"; // Persona 2
            default:
                return "from-gray-500 to-gray-600";
        }
    };

    const getSpeakerBorder = (speakerIndex: number) => {
        switch (speakerIndex) {
            case 0:
                return "border-blue-500/20";
            case 1:
                return "border-violet-500/20";
            case 2:
                return "border-orange-500/20";
            default:
                return "border-border";
        }
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    };

    const getDuration = () => {
        if (meeting.messages.length < 2) return "0 min";
        const first = new Date(meeting.messages[0].timestamp);
        const last = new Date(meeting.messages[meeting.messages.length - 1].timestamp);
        const minutes = Math.round((last.getTime() - first.getTime()) / 60000);
        return `${minutes} min`;
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
                <div className="flex items-center gap-4">
                    {/* Back button */}
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-background transition-colors"
                    >
                        <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    {/* Meeting info */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-foreground">{meeting.title}</h2>
                            <p className="text-xs text-muted-foreground">
                                Reunião encerrada • {formatDate(meeting.createdAt)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-background rounded-lg">
                        <span className="text-xs text-muted-foreground">Turnos:</span>
                        <span className="text-sm font-medium text-foreground">{meeting.rounds}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-background rounded-lg">
                        <span className="text-xs text-muted-foreground">Mensagens:</span>
                        <span className="text-sm font-medium text-foreground">{meeting.messages.length}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-background rounded-lg">
                        <span className="text-xs text-muted-foreground">Duração:</span>
                        <span className="text-sm font-medium text-foreground">{getDuration()}</span>
                    </div>
                </div>
            </header>

            {/* Topic Banner */}
            <div className="px-6 py-4 bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-border">
                <div className="flex items-center gap-2 mb-1">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    <span className="text-xs font-medium text-muted-foreground">Tema da reunião</span>
                </div>
                <p className="text-sm text-foreground">{meeting.topic}</p>
            </div>

            {/* Personas */}
            <div className="px-6 py-3 border-b border-border flex items-center justify-center gap-6">
                <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${getSpeakerColor(1)} flex items-center justify-center`}>
                        <span className="text-white font-bold text-xs">{meeting.persona1Name.charAt(0)}</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">{meeting.persona1Name}</span>
                </div>
                <span className="text-muted">vs</span>
                <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${getSpeakerColor(2)} flex items-center justify-center`}>
                        <span className="text-white font-bold text-xs">{meeting.persona2Name.charAt(0)}</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">{meeting.persona2Name}</span>
                </div>
            </div>

            {/* Messages */}
            <main className="flex-1 overflow-y-auto px-6 py-6">
                <div className="max-w-4xl mx-auto space-y-4">
                    {meeting.messages.map((message) => (
                        <div key={message.id} className="animate-fade-in">
                            <div className={`rounded-2xl px-5 py-4 border bg-card ${getSpeakerBorder(message.speakerIndex)}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${getSpeakerColor(message.speakerIndex)} flex items-center justify-center`}>
                                        <span className="text-white font-bold text-xs">
                                            {message.speaker.charAt(0)}
                                        </span>
                                    </div>
                                    <span className="text-sm font-medium text-foreground">
                                        {message.speaker}
                                    </span>
                                    <span className="text-xs text-muted">
                                        {new Date(message.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                                    </span>
                                </div>
                                <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                                    {message.content}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Footer */}
            <footer className="px-6 py-4 border-t border-border bg-card">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center justify-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-medium text-emerald-400">Reunião Encerrada</p>
                            <p className="text-xs text-emerald-400/70">
                                Esta é uma visualização somente leitura da reunião
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
