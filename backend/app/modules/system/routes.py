from fastapi import APIRouter

from app.core.config import get_settings

router = APIRouter()


@router.get("/config")
async def public_config() -> dict[str, str]:
    settings = get_settings()
    return {
        "appName": settings.app_name,
        "environment": settings.app_env,
        "livekitUrl": settings.livekit_client_url,
    }
