# Voice Agent Project State

## Project Identity

- **Name:** Voice Agent
- **Goal:** Production-style browser-based realtime AI customer support voice platform.
- **Architecture:** Modular monolith.
- **Current Phase:** Phase 1 - Foundation Architecture.

## Architecture Rules

- Keep the system simple, debuggable, and beginner-friendly.
- Use a modular monolith, not microservices.
- Avoid Kubernetes, Kafka, distributed event systems, and unnecessary abstractions.
- Prefer production-ready structure without premature complexity.
- Commit after implementation checks; push only after browser/manual verification.

## Fixed Tech Stack

- **Frontend:** Next.js, Tailwind CSS, shadcn/ui, Zustand, TanStack Query.
- **Backend:** FastAPI, Python async architecture.
- **Realtime:** LiveKit, Pipecat, WebSockets.
- **AI:** Faster-Whisper, Ollama, qwen3:8b, Piper TTS.
- **Database:** PostgreSQL, pgvector.
- **Cache:** Redis.
- **Deployment:** Docker, Docker Compose, nginx, GitHub Actions.

## Completed

- Clean project foundation exists with `frontend/`, `backend/`, and `docker/`.
- FastAPI app boots with CORS and health endpoint.
- LiveKit local Docker configuration works for browser microphone publishing.
- Backend can mint LiveKit room tokens.
- Next.js app provides an initial voice console shell.
- Docker Compose includes PostgreSQL/pgvector, Redis, and LiveKit.
- Phase 1 project state tracking established in this file.
- Phase 1 browser/manual verification completed on 2026-05-25.
- Backend health/config/auth/token endpoints verified locally.
- Frontend LiveKit test call verified locally.

## In Progress

- Phase 1 local commit pending.

## Pending

- Phase 2: Browser voice session polish and backend room/session tracking.
- Phase 3: Pipecat worker joins LiveKit room.
- Phase 4: STT pipeline with Faster-Whisper.
- Phase 5: LLM orchestration with Ollama/qwen3:8b.
- Phase 6: TTS pipeline with Piper.
- Phase 7: Memory and conversation persistence.
- Phase 8: pgvector RAG.
- Phase 9: Tool calling.
- Phase 10: Dashboard, analytics, auth completion, deployment hardening.

## Current Decisions

- Phase 1 must not implement STT, LLM chat, TTS, RAG, or tool calling.
- ChromaDB is removed from the foundation because the fixed stack uses PostgreSQL + pgvector.
- Auth foundation means config, security helpers, and route placeholders; full signup/login comes later.
- WebSocket foundation means a simple authenticated-ready status socket; voice events come later.
- npm currently reports dependency advisories; do not use `npm audit fix --force` without reviewing package changes.
- `docs/` is local-only and must not be pushed to GitHub.
- `projectstate.md` is the single source of truth for continuity and must be updated after major work.
- Voice Agent maps local Redis to host port `6380` to avoid conflicts with other local projects using `6379`.

## How To Resume

1. Read this file first.
2. Check `git status --short`.
3. Complete the active phase only.
4. Run backend compile and frontend build.
5. Ask the user to test locally before pushing.
