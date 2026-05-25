"use client";

import { useMemo, useRef, useState } from "react";
import { Activity, Database, Mic, PhoneCall, Radio, ShieldCheck, Square } from "lucide-react";
import { Room, RoomEvent } from "livekit-client";

import { createLiveKitToken } from "@/lib/livekit";
import { useVoiceStore } from "@/stores/voice-store";

type TranscriptMessage = {
  id: string;
  role: "system" | "customer" | "agent";
  content: string;
};

const capabilities = [
  { label: "Realtime voice", icon: Mic },
  { label: "RAG knowledge", icon: Database },
  { label: "Inbound ready", icon: PhoneCall },
  { label: "Barge-in path", icon: Radio },
  { label: "Support guardrails", icon: ShieldCheck },
  { label: "Latency tracking", icon: Activity },
];

export default function VoiceConsole() {
  const roomRef = useRef<Room | null>(null);
  const { connectionState, error, participantName, roomName, setConnectionState, setError, setRoomDetails } =
    useVoiceStore();
  const [messages, setMessages] = useState<TranscriptMessage[]>([
    {
      id: "system-intro",
      role: "system",
      content: "Phase 1 foundation is active. Start a test call to join a local LiveKit room and publish your microphone.",
    },
  ]);

  const statusLabel = useMemo(() => {
    if (connectionState === "connecting") return "Connecting";
    if (connectionState === "connected") return "Live";
    if (connectionState === "error") return "Needs attention";
    return "Ready";
  }, [connectionState]);

  async function startCall() {
    setConnectionState("connecting");
    setError(null);

    try {
      const tokenData = await createLiveKitToken();
      const room = new Room({ adaptiveStream: true, dynacast: true });

      room.on(RoomEvent.Disconnected, () => {
        setConnectionState("idle");
        setRoomDetails(null, null);
        roomRef.current = null;
      });

      await room.connect(tokenData.url, tokenData.token);
      await room.localParticipant.setMicrophoneEnabled(true);

      roomRef.current = room;
      setRoomDetails(tokenData.room_name, tokenData.participant_name);
      setConnectionState("connected");
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: crypto.randomUUID(),
          role: "system",
          content: `Connected to ${tokenData.room_name} as ${tokenData.participant_name}.`,
        },
      ]);
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Could not start the test call.";
      setError(message);
      setConnectionState("error");
      roomRef.current?.disconnect();
      roomRef.current = null;
    }
  }

  function stopCall() {
    roomRef.current?.disconnect();
    roomRef.current = null;
    setConnectionState("idle");
    setRoomDetails(null, null);
  }

  const isConnected = connectionState === "connected";
  const isConnecting = connectionState === "connecting";

  return (
    <main className="shell">
      <section className="workspace">
        <div className="panel conversation">
          <div className="topbar">
            <div>
              <p className="eyebrow">Customer support agent</p>
              <h1>Voice Console</h1>
            </div>
            <span className={`status ${connectionState}`}>{statusLabel}</span>
          </div>

          <div className="transcript">
            <div className="message system">
              <span>System</span>
              <p>
                {isConnected
                  ? `Connected to ${roomName} as ${participantName}. Your microphone is publishing to LiveKit.`
                  : "The voice room is idle. Phase 1 only verifies app structure, tokens, WebSocket foundation, and browser audio publishing."}
              </p>
            </div>
            {messages.map((message) => (
              <div className={`message ${message.role}`} key={message.id}>
                <span>{message.role === "customer" ? "Customer" : message.role === "agent" ? "Agent" : "System"}</span>
                <p>{message.content}</p>
              </div>
            ))}
            {error ? (
              <div className="message error">
                <span>Error</span>
                <p>{error}</p>
              </div>
            ) : null}
          </div>

          <div className="controls">
            {isConnected ? (
              <button className="danger" type="button" onClick={stopCall}>
                <Square size={18} />
                End test call
              </button>
            ) : (
              <button className="primary" type="button" onClick={startCall} disabled={isConnecting}>
                <Mic size={18} />
                {isConnecting ? "Connecting..." : "Start test call"}
              </button>
            )}
            <button className="secondary" type="button">
              Configure agent
            </button>
          </div>
        </div>

        <aside className="panel side">
          <h2>Build Targets</h2>
          <div className="capabilityGrid">
            {capabilities.map((item) => (
              <div className="capability" key={item.label}>
                <item.icon size={18} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}
