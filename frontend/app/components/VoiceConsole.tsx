"use client";

import { useMemo, useRef, useState } from "react";
import { Activity, Database, Mic, PhoneCall, Radio, ShieldCheck, Square } from "lucide-react";
import { Room, RoomEvent } from "livekit-client";

type ConnectionState = "idle" | "connecting" | "connected" | "error";

type TokenResponse = {
  token: string;
  url: string;
  room_name: string;
  participant_name: string;
};

const capabilities = [
  { label: "Realtime voice", icon: Mic },
  { label: "RAG knowledge", icon: Database },
  { label: "Inbound ready", icon: PhoneCall },
  { label: "Barge-in path", icon: Radio },
  { label: "Support guardrails", icon: ShieldCheck },
  { label: "Latency tracking", icon: Activity },
];

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export default function VoiceConsole() {
  const roomRef = useRef<Room | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>("idle");
  const [roomName, setRoomName] = useState<string | null>(null);
  const [participantName, setParticipantName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      const response = await fetch(`${apiBaseUrl}/api/livekit/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error(`Token request failed with ${response.status}`);
      }

      const tokenData = (await response.json()) as TokenResponse;
      const room = new Room({ adaptiveStream: true, dynacast: true });

      room.on(RoomEvent.Disconnected, () => {
        setConnectionState("idle");
        roomRef.current = null;
      });

      await room.connect(tokenData.url, tokenData.token);
      await room.localParticipant.setMicrophoneEnabled(true);

      roomRef.current = room;
      setRoomName(tokenData.room_name);
      setParticipantName(tokenData.participant_name);
      setConnectionState("connected");
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
                  : "Start a test call to join a local LiveKit room and publish your microphone."}
              </p>
            </div>
            <div className="message customer">
              <span>Customer</span>
              <p>I need help with a billing issue.</p>
            </div>
            <div className="message agent">
              <span>Agent</span>
              <p>I can help with that. I will check the account, review the billing policy, and create a ticket if needed.</p>
            </div>
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
