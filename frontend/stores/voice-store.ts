import { create } from "zustand";

type VoiceConnectionState = "idle" | "connecting" | "connected" | "error";
type RealtimeConnectionState = "idle" | "connecting" | "connected" | "reconnecting" | "disconnected" | "error";

type VoiceState = {
  connectionState: VoiceConnectionState;
  realtimeState: RealtimeConnectionState;
  sessionId: string | null;
  roomName: string | null;
  participantName: string | null;
  micEnabled: boolean;
  startedAt: string | null;
  error: string | null;
  setConnectionState: (connectionState: VoiceConnectionState) => void;
  setRealtimeState: (realtimeState: RealtimeConnectionState) => void;
  setSessionId: (sessionId: string | null) => void;
  setRoomDetails: (roomName: string | null, participantName: string | null) => void;
  setMicEnabled: (micEnabled: boolean) => void;
  setStartedAt: (startedAt: string | null) => void;
  setError: (error: string | null) => void;
  resetSession: () => void;
};

export const useVoiceStore = create<VoiceState>((set) => ({
  connectionState: "idle",
  realtimeState: "idle",
  sessionId: null,
  roomName: null,
  participantName: null,
  micEnabled: false,
  startedAt: null,
  error: null,
  setConnectionState: (connectionState) => set({ connectionState }),
  setRealtimeState: (realtimeState) => set({ realtimeState }),
  setSessionId: (sessionId) => set({ sessionId }),
  setRoomDetails: (roomName, participantName) => set({ roomName, participantName }),
  setMicEnabled: (micEnabled) => set({ micEnabled }),
  setStartedAt: (startedAt) => set({ startedAt }),
  setError: (error) => set({ error }),
  resetSession: () =>
    set({
      connectionState: "idle",
      realtimeState: "idle",
      sessionId: null,
      roomName: null,
      participantName: null,
      micEnabled: false,
      startedAt: null,
      error: null,
    }),
}));
