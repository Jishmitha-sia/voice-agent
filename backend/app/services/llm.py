from typing import Protocol

import httpx

from app.core.config import Settings


class ChatMessage(Protocol):
    role: str
    content: str


class LLMClient(Protocol):
    async def generate(self, messages: list[ChatMessage]) -> str:
        raise NotImplementedError


class LLMProviderError(RuntimeError):
    pass


class OllamaLLMClient:
    def __init__(self, settings: Settings) -> None:
        self.base_url = settings.ollama_base_url.rstrip("/")
        self.model = settings.llm_model

    async def generate(self, messages: list[ChatMessage]) -> str:
        payload = {
            "model": self.model,
            "messages": [
                {"role": message.role, "content": message.content}
                for message in messages
            ],
            "stream": False,
            "options": {
                "temperature": 0.3,
                "num_predict": 350,
            },
        }

        try:
            async with httpx.AsyncClient(timeout=45) as client:
                response = await client.post(f"{self.base_url}/api/chat", json=payload)
                response.raise_for_status()
        except httpx.HTTPError as exc:
            raise LLMProviderError(
                "Ollama is not reachable. Start Ollama and make sure the configured model is pulled."
            ) from exc

        data = response.json()
        content = data.get("message", {}).get("content")
        if not isinstance(content, str) or not content.strip():
            raise LLMProviderError("Ollama returned an empty response.")

        return content.strip()


def build_llm_client(settings: Settings) -> LLMClient:
    provider = settings.llm_provider.lower().strip()
    if provider == "ollama":
        return OllamaLLMClient(settings)

    raise LLMProviderError(f"Unsupported LLM provider: {settings.llm_provider}")
