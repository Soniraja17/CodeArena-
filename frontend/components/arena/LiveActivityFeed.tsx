"use client";
import { useState, useEffect, useRef } from "react";
import { AlertCircle, CheckCircle, Activity, MessageSquare, UserX, Clock } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/cn";
import type { ActivityEvent } from "@/types/ws";

interface LiveActivityFeedProps {
  className?: string;
  userId?: string | null;
}

export function LiveActivityFeed({ className, userId }: LiveActivityFeedProps) {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const eventsEndRef = useRef<HTMLDivElement>(null);

  const fetchEvents = async () => {
    try {
      const response = await api.get("/duel/activity");
      if (response.status === 200) {
        setEvents(response.data.events);
      }
    } catch (error) {
      console.error("Failed to fetch activity events:", error);
    }
  };

  function formatEventText(event: ActivityEvent, isMe: boolean): string {
    switch (event.type) {
      case "verdict": {
        const verdict = event.data.verdict as string | undefined;
        const step = event.data.step_index as number | undefined;
        if (verdict && step != null) return `${verdict} on step ${step + 1}`;
        if (verdict) return `${verdict}`;
        return "Received a verdict";
      }
      case "step_advance": {
        const step = event.data.new_step_index as number | undefined;
        return step != null
          ? `Advanced to step ${step + 1}`
          : "Advanced to next step";
      }
      case "step_solved": {
        const step = event.data.step_index as number | undefined;
        return step != null
          ? `Solved step ${step + 1}`
          : "Solved a step";
      }
      case "emote":
        return "Sent an emote";
      case "chat":
        return (event.data.message as string) ?? "Sent a message";
      case "system":
        return (event.data.message as string) ?? "";
      case "opponent_left": {
        const forfeit = event.data.auto_forfeit as boolean | undefined;
        return forfeit ? "Left the duel · Forfeit" : "Left the duel";
      }
      case "duel_complete": {
        const winnerId = event.data.winner_id as string | null;
        const elo = event.data.elo_changes as Record<string, { before: number; after: number; delta: number }> | undefined;
        const userId = event.user_id;
        const eloStr = userId && elo?.[userId]
          ? ` · ${elo[userId].before} → ${elo[userId].after} (${elo[userId].delta >= 0 ? "+" : ""}${elo[userId].delta})`
          : "";
        if (winnerId == null) return `Draw${eloStr}`;
        const won = (isMe && winnerId === userId) || (!isMe && winnerId === userId);
        return won ? `Won${eloStr}` : `Lost${eloStr}`;
      }
      case "duel_abandoned":
        return `Duel abandoned · ${(event.data.reason as string) ?? "Unknown reason"}`;
      default:
        return JSON.stringify(event.data);
    }
  }

  const getEventIcon = (type: ActivityEvent["type"]) => {
    switch (type) {
      case "verdict":
        return <CheckCircle className="w-4 h-4 text-[var(--color-success)]" />;
      case "step_advance":
        return <Activity className="w-4 h-4 text-[var(--color-primary)]" />;
      case "emote":
        return <MessageSquare className="w-4 h-4 text-[var(--color-secondary)]" />;
      case "chat":
        return <MessageSquare className="w-4 h-4 text-[var(--color-accent)]" />;
      case "opponent_left":
        return <UserX className="w-4 h-4 text-[var(--color-danger)]" />;
      case "system":
        return <AlertCircle className="w-4 h-4 text-[var(--color-warning)]" />;
      default:
        return <Clock className="w-4 h-4 text-[var(--color-text-tertiary)]" />;
    }
  };

  const getEventColor = (type: ActivityEvent["type"], isMe: boolean) => {
    if (isMe) {
      return "bg-[var(--color-primary)]/10 border-[var(--color-primary)]/30 text-[var(--color-primary)]";
    }
    switch (type) {
      case "verdict":
        return "bg-[var(--color-success)]/10 border-[var(--color-success)]/30 text-[var(--color-success)]";
      case "step_advance":
        return "bg-[var(--color-primary)]/10 border-[var(--color-primary)]/30 text-[var(--color-primary)]";
      case "emote":
        return "bg-[var(--color-secondary)]/10 border-[var(--color-secondary)]/30 text-[var(--color-secondary)]";
      case "chat":
        return "bg-[var(--color-accent)]/10 border-[var(--color-accent)]/30 text-[var(--color-accent)]";
      case "opponent_left":
        return "bg-[var(--color-danger)]/10 border-[var(--color-danger)]/30 text-[var(--color-danger)]";
      case "system":
        return "bg-[var(--color-warning)]/10 border-[var(--color-warning)]/30 text-[var(--color-warning)]";
      default:
        return "bg-[var(--color-bg-tertiary)] border-[var(--color-border)] text-[var(--color-text-secondary)]";
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const hours = Math.floor(diffMins / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  useEffect(() => {
    fetchEvents();
    // Poll for new events every 2 seconds
    const interval = setInterval(fetchEvents, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    eventsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [events]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className={cn(
      "w-full max-w-md h-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg",
      className
    )}>
      <div className="p-3 border-b border-[var(--color-border)] bg-[var(--color-bg-tertiary)] flex items-center justify-between">
        <h3 className="font-mono text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Live Activity
        </h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          <AlertCircle className="w-4 h-4" />
        </button>
      </div>

      <div className="p-3 overflow-y-auto min-h-0" style={{ maxHeight: "300px" }}>
        {events.length === 0 ? (
          <div className="text-center text-[var(--color-text-tertiary)] text-sm py-6">
            No activity yet
          </div>
        ) : (
          <div className="space-y-2">
            {events.map((event, index) => {
              const isMe = !!userId && event.user_id === userId;
              const displayText = formatEventText(event, isMe);
              return (
                <div
                  key={index}
                  className={cn(
                    "flex gap-3 p-2 rounded-lg border transition-all",
                    getEventColor(event.type, isMe)
                  )}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className={cn(
                        "font-mono text-xs font-semibold",
                        isMe ? "text-[var(--color-primary)]" : "text-[var(--color-text-primary)]"
                      )}>
                        {isMe ? "You" : `Opponent`}
                      </span>
                      <span className="font-mono text-xs text-[var(--color-text-tertiary)]">
                        {formatTime(event.timestamp)}
                      </span>
                    </div>
                    <div className="font-mono text-xs text-[var(--color-text-primary)] break-words">
                      {displayText}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={eventsEndRef} />
          </div>
        )}
      </div>
    </div>
  );
}
