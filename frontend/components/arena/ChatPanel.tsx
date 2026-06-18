"use client";
import { useState, useEffect, useRef, type KeyboardEvent } from "react";
import { Send, MessageSquare, Activity } from "lucide-react";
import { useAuth } from "@/stores/auth";
import { api } from "@/lib/api";
import type { ChatMessage, ActivityEvent } from "@/types/ws";
import { cn } from "@/lib/cn";

interface ChatPanelProps {
  duelId: string;
  opponentUsername: string;
  isHost: boolean;
  className?: string;
}

export function ChatPanel({ duelId, opponentUsername, isHost, className }: ChatPanelProps) {
  const me = useAuth((s) => s.user);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    if (!me?.id) return;
    try {
      const response = await api.get(`/duel/${duelId}/chat`);
      if (response.status === 200) {
        setMessages(response.data.messages);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !me?.id || isLoading) return;
    
    setIsLoading(true);
    try {
      const response = await api.post(`/duel/${duelId}/chat`, {
        user_id: me.id,
        message: newMessage.trim(),
      });
      
      if (response.status === 200) {
        setMessages(prev => [...prev, response.data.message]);
        setNewMessage("");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    fetchMessages();
    // Poll for new messages every 3 seconds
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [duelId, me?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className={cn(
      "flex flex-col h-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)]",
      className
    )}>
      <div className="p-3 border-b border-[var(--color-border)] bg-[var(--color-bg-tertiary)]">
        <h3 className="font-mono text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Chat with {opponentUsername}
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
        {messages.length === 0 ? (
          <div className="text-center text-[var(--color-text-tertiary)] text-sm py-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.user_id === me?.id;
            const time = new Date(msg.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });
            
            return (
              <div
                key={msg.id}
                className={cn(
                  "flex w-full",
                  isMe ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg px-3 py-2 font-mono text-sm",
                    isMe
                      ? "bg-[var(--color-primary)] text-[var(--color-bg-primary)]"
                      : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] border border-[var(--color-border)]"
                  )}
                >
                  {!isMe && (
                    <div className="text-xs text-[var(--color-primary)] font-semibold mb-1">
                      Opponent
                    </div>
                  )}
                  <div className="break-words whitespace-pre-wrap">{msg.message}</div>
                  <div className={cn(
                    "text-xs mt-1",
                    isMe ? "text-[var(--color-bg-primary)]/70" : "text-[var(--color-text-tertiary)]"
                  )}>
                    {time}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-[var(--color-border)] bg-[var(--color-bg-tertiary)]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex gap-2"
        >
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 resize-none px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
            rows={1}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isLoading}
            className={cn(
              "px-4 py-2 rounded-lg font-mono text-sm font-semibold transition-colors",
              newMessage.trim() && !isLoading
                ? "bg-[var(--color-primary)] text-[var(--color-bg-primary)] hover:opacity-90"
                : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-tertiary)] cursor-not-allowed"
            )}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
