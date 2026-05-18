# Architecture

```text
Next.js Frontend
    |
LiveKit WebRTC Audio
    |
Pipecat Voice Pipeline
    |
VAD + Interruption Detection
    |
Faster-Whisper STT
    |
LangGraph Agent Brain
    |
RAG + Memory + Tools
    |
Ollama/vLLM LLM
    |
Streaming TTS
    |
LiveKit Audio Output
```

## Principles

- No hardcoded support replies.
- The model provider must be configurable.
- Support answers should be grounded in company knowledge and tool results.
- Long-running customer actions should be tools, not prompt text.
- Browser voice comes first; inbound phone support comes second; outbound comes later.
