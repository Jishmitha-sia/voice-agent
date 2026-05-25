# Voice Agent

Production-style browser-based AI customer support voice platform built with a simple modular monolith architecture.

## Phase 1 Scope

Phase 1 established the foundation:

- Next.js frontend shell
- FastAPI backend shell
- Docker Compose infrastructure
- PostgreSQL with pgvector
- Redis
- LiveKit local development server
- LiveKit browser token endpoint
- Basic realtime WebSocket endpoint
- Authentication foundation placeholders
- `projectstate.md` as the source of truth

## Phase 2 Scope

Phase 2 adds browser voice session polish and backend room/session tracking:

- `voice_sessions` database table
- session-aware LiveKit token creation
- session detail endpoint
- realtime WebSocket lifecycle endpoint
- microphone and session state UI
- simple browser WebSocket reconnect handling

Future phases will add Pipecat, Faster-Whisper, Ollama/qwen3:8b, Piper TTS, memory, RAG, tool calling, analytics, and deployment hardening.

## Architecture

```text
frontend/ Next.js app
    |
    | HTTP + WebSocket
    v
backend/ FastAPI modular monolith
    |
    | tokens/config/status
    v
LiveKit local server

Data:
PostgreSQL + pgvector
Redis
```

Local port mappings:

```text
PostgreSQL: 127.0.0.1:5434 -> container 5432
Redis:      127.0.0.1:6380 -> container 6379
LiveKit:    127.0.0.1:7880/7881/7882
```

## Folder Structure

```text
voice-agent/
  backend/
    app/
      api/
      core/
      modules/
        auth/
        livekit/
        realtime/
        system/
  frontend/
    app/
    components/
    lib/
    stores/
  docker/
    livekit.yaml
    postgres/
  docs/
  projectstate.md
```

## Setup

Copy environment variables:

```powershell
Copy-Item .env.example .env
```

Start infrastructure:

```powershell
docker compose up -d
```

Run backend:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Run frontend:

```powershell
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

## Phase 1 Test Checklist

- `http://localhost:8000/health` returns `ok`.
- `http://localhost:8000/api/config` returns public app config.
- `POST http://localhost:8000/api/livekit/token` returns a token.
- Token response includes `session_id`.
- `GET http://localhost:8000/api/sessions/{session_id}` returns session metadata.
- Frontend loads at `http://localhost:3000`.
- **Start test call** connects the browser to LiveKit and publishes microphone audio.
- Session panel shows room, microphone, and realtime WebSocket state.
- **End test call** disconnects cleanly.

## Development Rules

- Read `projectstate.md` before making decisions.
- Update `projectstate.md` after major tasks or phase changes.
- Commit after automated checks.
- Push only after manual verification.
- Keep the architecture simple and modular.
