"use client";

import type { FormEvent } from "react";
import { useMemo, useRef, useState } from "react";
import { Activity, Database, Mic, PhoneCall, Radio, Send, ShieldCheck, Square } from "lucide-react";
import { Room, RoomEvent } from "livekit-client";

type ConnectionState = "idle" | "connecting" | "connected" | "error";

type TokenResponse = {
  token: string;
  url: string;
  room_name: string;
  participant_name: string;
};

type TranscriptMessage = {
  id: string;
  role: "system" | "customer" | "agent";
  content: string;
};

type ConversationResponse = {
  session_id: string;
  reply: string;
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
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [draftMessage, setDraftMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<TranscriptMessage[]>([
    {
      id: "system-intro",
      role: "system",
      content: "Start a test call to join a local LiveKit room, or send a text message to test the support agent brain.",
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

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedMessage = draftMessage.trim();
    if (!trimmedMessage || isSending) return;

    const customerMessage: TranscriptMessage = {
      id: crypto.randomUUID(),
      role: "customer",
      content: trimmedMessage,
    };

    setMessages((currentMessages) => [...currentMessages, customerMessage]);
    setDraftMessage("");
    setIsSending(true);
    setError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/api/conversations/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, message: trimmedMessage }),
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => null)) as { detail?: string } | null;
        throw new Error(errorData?.detail ?? `Agent request failed with ${response.status}`);
      }

      const data = (await response.json()) as ConversationResponse;
      setSessionId(data.session_id);
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: crypto.randomUUID(),
          role: "agent",
          content: data.reply,
        },
      ]);
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Could not send the message.";
      setError(message);
    } finally {
      setIsSending(false);
    }
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
                  : "The voice room is idle. Text chat is available for testing dynamic agent replies."}
              </p>
            </div>
            {messages.map((message) => (
              <div className={`message ${message.role}`} key={message.id}>
                <span>{message.role === "customer" ? "Customer" : message.role === "agent" ? "Agent" : "System"}</span>
                <p>{message.content}</p>
              </div>
            ))}
            {isSending ? (
              <div className="message agent">
                <span>Agent</span>
                <p>Thinking...</p>
              </div>
            ) : null}
            {error ? (
              <div className="message error">
                <span>Error</span>
                <p>{error}</p>
              </div>
            ) : null}
          </div>

          <form className="composer" onSubmit={sendMessage}>
            <input
              aria-label="Customer message"
              onChange={(event) => setDraftMessage(event.target.value)}
              placeholder="Ask about a refund, account issue, order status..."
              type="text"
              value={draftMessage}
            />
            <button className="iconButton" type="submit" disabled={isSending || !draftMessage.trim()}>
              <Send size={18} />
            </button>
          </form>

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
