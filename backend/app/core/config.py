from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_env: str = "development"
    app_name: str = "Voice Agent"
    cors_origins: str = "http://localhost:3000"

    livekit_url: str = "ws://localhost:7880"
    livekit_client_url: str = "ws://127.0.0.1:7880"
    livekit_api_key: str = "devkey"
    livekit_api_secret: str = "devsecret-devsecret-devsecret-32chars"

    database_url: str = "postgresql://voice_agent:voice_agent@localhost:5432/voice_agent"
    redis_url: str = "redis://localhost:6379/0"

    jwt_secret_key: str = "dev-jwt-secret-change-me"
    jwt_algorithm: str = "HS256"
    jwt_access_token_minutes: int = 15
    jwt_refresh_token_days: int = 30

    llm_provider: str = "ollama"
    ollama_base_url: str = "http://localhost:11434"
    llm_model: str = "qwen3:8b"
    stt_provider: str = "faster-whisper"
    tts_provider: str = "piper"

    model_config = SettingsConfigDict(
        env_file=("../.env", ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
