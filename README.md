# Voice Agent

Production-style browser-based AI customer support voice platform built with a simple modular monolith architecture.

## Phase 1 Scope

This phase is only the foundation:

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
- Frontend loads at `http://localhost:3000`.
- **Start test call** connects the browser to LiveKit and publishes microphone audio.
- **End test call** disconnects cleanly.

## Development Rules

- Read `projectstate.md` before making decisions.
- Update `projectstate.md` after major tasks or phase changes.
- Commit after automated checks.
- Push only after manual verification.
- Keep the architecture simple and modular.
