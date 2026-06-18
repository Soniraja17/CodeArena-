import { Verdict } from "@/components/primitives/VerdictPill";
import { Duel } from "./duel";

export type QueueEvent =
  | { type: "queue_tick"; payload: { eta_seconds: number; queued_count: number } }
  | {
      type: "match_found";
      payload: {
        duel_id: string;
        opponent: {
          user_id?: string;
          handle?: string | null;
          username: string;
          elo: number;
          tier?: string;
        };
      };
    }
  | { type: "connected"; payload: { user_id: string } };

export interface EloChange {
  before: number;
  after: number;
  delta: number;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
}

export interface ActivityEvent {
  type: "verdict" | "step_advance" | "step_solved" | "emote" | "chat" | "system" | "opponent_left" | "duel_complete" | "duel_abandoned";
  user_id: string | null;
  username?: string;
  timestamp: string;
  data: Record<string, unknown>;
}

export type DuelEvent =
  | { type: "state"; payload: { state: Duel } }
  | {
      type: "verdict";
      payload: {
        user_id: string;
        step_index: number;
        verdict: Verdict;
        testset?: number;
        submission_id: number;
      };
    }
  | {
      type: "step_advance";
      payload: { user_id: string; new_step_index: number };
    }
  | {
      type: "duel_complete";
      payload: {
        winner_id: string | null;
        elo_changes: Record<string, EloChange>;
        promotion_for?: string | null;
        new_tier?: string | null;
        demotion_for?: string | null;
      };
    }
  | {
      type: "opponent_disconnected";
      payload: { user_id: string; reconnect_grace_ms: number };
    }
  | {
      type: "opponent_left";
      payload: { user_id: string; username: string; auto_forfeit: boolean };
    }
  | {
      type: "duel_abandoned";
      payload: { winner_id: string; reason: string };
    }
  | {
      type: "emote";
      payload: { user_id: string; glyph: EmoteGlyph; sent_at: number };
    }
  | {
      type: "chat_message";
      payload: ChatMessage;
    }
  | { type: "system"; payload: { message: string } }
  | { type: "pong" };

export type EmoteGlyph =
  | "gg"
  | "salt"
  | "thinking"
  | "coffee"
  | "fire"
  | "exclaim";
