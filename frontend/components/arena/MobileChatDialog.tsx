"use client";
import { useState } from "react";
import { MessageSquare, Activity, X } from "lucide-react";
import { ChatPanel } from "@/components/arena/ChatPanel";
import { LiveActivityFeed } from "@/components/arena/LiveActivityFeed";
import { cn } from "@/lib/cn";
import { useAuth } from "@/stores/auth";
import type { Duel } from "@/types/duel";

interface MobileChatDialogProps {
  duelId: string;
  opponentUsername: string;
  duel: Duel | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MobileChatDialog({ duelId, opponentUsername, duel, isOpen, onClose }: MobileChatDialogProps) {
  const me = useAuth((s) => s.user);
  const isHost = !!(me && duel?.host?.user_id === me.id);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 lg:hidden">
      <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] rounded-t-xl bg-[var(--color-bg-secondary)]">
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
          <h3 className="font-mono text-lg font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Chat with {opponentUsername}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="h-[60vh]">
          <ChatPanel
            duelId={duelId}
            opponentUsername={opponentUsername}
            isHost={isHost}
            className="h-full rounded-none border-none border-t border-[var(--color-border)]"
          />
        </div>
      </div>
    </div>
  );
}
