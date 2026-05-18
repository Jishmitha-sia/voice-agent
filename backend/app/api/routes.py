from fastapi import APIRouter

from app.core.config import get_settings

router = APIRouter()


@router.get("/config")
async def public_config() -> dict[str, str]:
    settings = get_settings()
    return {
        "appName": settings.app_name,
        "environment": settings.app_env,
        "llmProvider": settings.llm_provider,
        "llmModel": settings.llm_model,
        "sttProvider": settings.stt_provider,
        "ttsProvider": settings.tts_provider,
    }
