import { create } from "zustand";

type VoiceConnectionState = "idle" | "connecting" | "connected" | "error";

type VoiceState = {
  connectionState: VoiceConnectionState;
  roomName: string | null;
  participantName: string | null;
  error: string | null;
  setConnectionState: (connectionState: VoiceConnectionState) => void;
  setRoomDetails: (roomName: string | null, participantName: string | null) => void;
  setError: (error: string | null) => void;
};

export const useVoiceStore = create<VoiceState>((set) => ({
  connectionState: "idle",
  roomName: null,
  participantName: null,
  error: null,
  setConnectionState: (connectionState) => set({ connectionState }),
  setRoomDetails: (roomName, participantName) => set({ roomName, participantName }),
  setError: (error) => set({ error }),
}));
