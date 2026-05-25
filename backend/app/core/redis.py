from app.core.config import Settings


def build_redis_url(settings: Settings) -> str:
    return settings.redis_url
