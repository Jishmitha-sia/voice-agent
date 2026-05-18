# Roadmap

## Phase 1: Clean Foundation

- Monorepo structure
- FastAPI backend
- Next.js frontend
- Docker Compose for PostgreSQL, Redis, ChromaDB, and LiveKit
- Environment template

## Phase 2: Browser Voice MVP

- LiveKit room join flow
- Microphone capture
- Transcript UI
- Pipecat pipeline skeleton
- STT, LLM, and TTS provider interfaces

## Phase 3: Customer Support Intelligence

- Redis session memory
- PostgreSQL conversations and tickets
- RAG ingestion for FAQs, policies, and product docs
- Tool calling for ticket creation, order lookup, and escalation
- Dynamic responses grounded in retrieved support knowledge

## Phase 4: Realtime Quality

- VAD
- Barge-in/interruption handling
- Streaming LLM responses
- Sentence-level TTS
- Latency metrics

## Phase 5: Inbound Phone Agent

- LiveKit SIP integration
- SIP provider setup through Twilio, Telnyx, or similar
- Call routing
- Recording and transcript storage
- Human handoff

## Phase 6: Production Hardening

- Auth and tenant isolation
- Monitoring and tracing
- Rate limits
- Secrets management
- Load testing
- GPU deployment guide
- Backup and retention policy
