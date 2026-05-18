# TouchGrass Voice Agent

Open-source customer support voice agent platform built for realtime conversations, dynamic reasoning, retrieval, tool use, memory, and future phone support.

## Target Stack

- **Frontend:** Next.js + React
- **Backend:** FastAPI
- **Realtime audio:** LiveKit
- **Voice orchestration:** Pipecat
- **STT:** Faster-Whisper
- **LLM serving:** Ollama for local development, vLLM for production
- **TTS:** Piper/Kokoro for MVP, XTTS-v2 as an upgrade path
- **Agent workflows:** LangGraph
- **Knowledge base:** ChromaDB + LlamaIndex
- **Memory:** Redis + PostgreSQL
- **Monitoring:** Langfuse later

## First Milestone

Build a browser-based support voice agent before adding telephony:

1. Next.js support console.
2. FastAPI backend health/config endpoints.
3. LiveKit room/token flow.
4. Pipecat voice pipeline skeleton.
5. STT -> LLM -> TTS loop.
6. Conversation memory and transcript storage.
7. RAG over support documents.

## Current Capabilities

- FastAPI health and public config endpoints
- Local infrastructure with PostgreSQL, Redis, ChromaDB, and LiveKit
- Browser voice console shell
- LiveKit token endpoint and browser microphone room connection

## Development

Copy the environment template:

```bash
cp .env.example .env
```

Start infrastructure:

```bash
docker compose up -d postgres redis chroma livekit
```

Run backend:

```bash
cd backend
python -m venv .venv
.venv/Scripts/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Run frontend:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` and click **Start test call**. Your browser should ask for microphone permission and connect to the local LiveKit room.

If the UI shows `could not establish pc connection`, check that Docker Desktop is running, Windows Firewall allows Docker/LiveKit network traffic, and the backend token response uses `ws://127.0.0.1:7880` for the LiveKit client URL.

The local Docker LiveKit server uses [docker/livekit.yaml](docker/livekit.yaml), which pins the advertised RTC node IP to `127.0.0.1` for browser testing on the same machine.
