"use client";

import { useMemo, useRef, useState } from "react";
import { Activity, Database, Mic, PhoneCall, Radio, ShieldCheck, Square, Wifi } from "lucide-react";
import { LocalTrackPublication, Room, RoomEvent } from "livekit-client";

import { createLiveKitToken } from "@/lib/livekit";
import { wsBaseUrl } from "@/lib/api";
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
  const websocketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const shouldReconnectRef = useRef(false);
  const {
    connectionState,
    error,
    micEnabled,
    participantName,
    realtimeState,
    roomName,
    sessionId,
    setConnectionState,
    setError,
    setMicEnabled,
    setRealtimeState,
    setRoomDetails,
    setSessionId,
    setStartedAt,
  } = useVoiceStore();
  const [messages, setMessages] = useState<TranscriptMessage[]>([
    {
      id: "system-intro",
      role: "system",
      content: "Phase 2 is active. Start a test call to create a tracked browser voice session.",
    },
  ]);

  const statusLabel = useMemo(() => {
    if (connectionState === "connecting") return "Connecting";
    if (connectionState === "connected") return "Live";
    if (connectionState === "error") return "Needs attention";
    return "Ready";
  }, [connectionState]);

  function appendSystemMessage(content: string) {
    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: crypto.randomUUID(),
        role: "system",
        content,
      },
    ]);
  }

  function closeRealtimeSocket() {
    shouldReconnectRef.current = false;
    if (reconnectTimeoutRef.current) {
      window.clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    websocketRef.current?.close();
    websocketRef.current = null;
    setRealtimeState("idle");
  }

  function sendRealtimeEvent(type: string, payload: Record<string, unknown> = {}, attempts = 5) {
    const socket = websocketRef.current;
    if (!socket) return;

    if (socket.readyState !== WebSocket.OPEN) {
      if (attempts > 0) {
        window.setTimeout(() => sendRealtimeEvent(type, payload, attempts - 1), 250);
      }
      return;
    }

    socket.send(JSON.stringify({ type, ...payload }));
  }

  function connectRealtimeSocket(nextSessionId: string) {
    shouldReconnectRef.current = true;
    setRealtimeState(websocketRef.current ? "reconnecting" : "connecting");

    const socket = new WebSocket(`${wsBaseUrl}/api/realtime/ws/${nextSessionId}`);
    websocketRef.current = socket;

    socket.onopen = () => {
      setRealtimeState("connected");
      sendRealtimeEvent("ping");
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as { type?: string; session?: { status?: string } };
        if (data.type === "session.connected") {
          appendSystemMessage("Realtime session socket connected.");
        }
        if (data.type === "session.updated" && data.session?.status) {
          appendSystemMessage(`Session status updated: ${data.session.status}.`);
        }
      } catch {
        appendSystemMessage("Received an unreadable realtime event.");
      }
    };

    socket.onerror = () => {
      setRealtimeState("error");
    };

    socket.onclose = () => {
      websocketRef.current = null;
      if (!shouldReconnectRef.current) {
        setRealtimeState("disconnected");
        return;
      }

      setRealtimeState("reconnecting");
      reconnectTimeoutRef.current = window.setTimeout(() => connectRealtimeSocket(nextSessionId), 1500);
    };
  }

  async function startCall() {
    setConnectionState("connecting");
    setError(null);

    try {
      const tokenData = await createLiveKitToken();
      const room = new Room({ adaptiveStream: true, dynacast: true });
      setSessionId(tokenData.session_id);
      setStartedAt(new Date().toISOString());
      connectRealtimeSocket(tokenData.session_id);

      room.on(RoomEvent.Disconnected, () => {
        setConnectionState("idle");
        setRoomDetails(null, null);
        setMicEnabled(false);
        roomRef.current = null;
      });

      room.on(RoomEvent.LocalTrackPublished, (publication: LocalTrackPublication) => {
        if (publication.kind === "audio") {
          setMicEnabled(true);
        }
      });

      await room.connect(tokenData.url, tokenData.token);
      await room.localParticipant.setMicrophoneEnabled(true);
      sendRealtimeEvent("voice.active", { room_name: tokenData.room_name });

      roomRef.current = room;
      setRoomDetails(tokenData.room_name, tokenData.participant_name);
      setConnectionState("connected");
      appendSystemMessage(`Connected to ${tokenData.room_name} as ${tokenData.participant_name}.`);
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Could not start the test call.";
      setError(message);
      setConnectionState("error");
      setMicEnabled(false);
      roomRef.current?.disconnect();
      roomRef.current = null;
      closeRealtimeSocket();
    }
  }

  function stopCall() {
    sendRealtimeEvent("voice.ended");
    roomRef.current?.disconnect();
    roomRef.current = null;
    closeRealtimeSocket();
    setConnectionState("idle");
    setRoomDetails(null, null);
    setMicEnabled(false);
    appendSystemMessage("Voice session ended.");
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
                  : "The voice room is idle. Phase 2 tracks browser voice sessions and realtime lifecycle events."}
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
          <h2>Session State</h2>
          <div className="sessionMeta">
            <div>
              <span>Session</span>
              <strong>{sessionId ? sessionId.slice(0, 8) : "none"}</strong>
            </div>
            <div>
              <span>Room</span>
              <strong>{roomName ?? "idle"}</strong>
            </div>
            <div>
              <span>Mic</span>
              <strong className={micEnabled ? "good" : ""}>{micEnabled ? "publishing" : "off"}</strong>
            </div>
            <div>
              <span>Realtime</span>
              <strong className={realtimeState === "connected" ? "good" : ""}>{realtimeState}</strong>
            </div>
          </div>

          <h2 className="sideHeading">Build Targets</h2>
          <div className="capabilityGrid">
            {capabilities.map((item) => (
              <div className="capability" key={item.label}>
                <item.icon size={18} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
          <div className="capability realtimeNote">
            <Wifi size={18} />
            <span>WebSocket lifecycle</span>
          </div>
        </aside>
      </section>
    </main>
  );
}
