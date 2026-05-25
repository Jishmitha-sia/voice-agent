from app.core.config import Settings


def build_database_url(settings: Settings) -> str:
    return settings.database_url
