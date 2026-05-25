from uuid import uuid4

import logging

from fastapi import APIRouter, Request
from livekit import api
from pydantic import BaseModel, Field

from app.core.config import get_settings
from app.modules.sessions.models import VoiceSessionStatus
from app.modules.sessions.repository import VoiceSessionRepository

router = APIRouter()
logger = logging.getLogger(__name__)


class LiveKitTokenRequest(BaseModel):
    room_name: str | None = Field(default=None, min_length=1, max_length=80)
    participant_name: str | None = Field(default=None, min_length=1, max_length=80)


class LiveKitTokenResponse(BaseModel):
    session_id: str
    token: str
    url: str
    room_name: str
    participant_name: str
    status: str


@router.post("/token")
async def create_livekit_token(request: Request, payload: LiveKitTokenRequest) -> LiveKitTokenResponse:
    settings = get_settings()
    room_name = payload.room_name or f"support-{uuid4().hex[:10]}"
    participant_name = payload.participant_name or f"customer-{uuid4().hex[:8]}"
    repository = VoiceSessionRepository(request.app.state.db_pool)
    session = await repository.create(
        room_name=room_name,
        participant_name=participant_name,
        metadata={"source": "browser"},
    )

    token = (
        api.AccessToken(settings.livekit_api_key, settings.livekit_api_secret)
        .with_identity(participant_name)
        .with_name(participant_name)
        .with_grants(
            api.VideoGrants(
                room_join=True,
                room=room_name,
                can_publish=True,
                can_subscribe=True,
                can_publish_data=True,
            )
        )
        .to_jwt()
    )
    session = await repository.update_status(session.id, VoiceSessionStatus.TOKEN_ISSUED)
    logger.info("voice_session_token_issued session_id=%s room=%s participant=%s", session.id, room_name, participant_name)

    return LiveKitTokenResponse(
        session_id=str(session.id),
        token=token,
        url=settings.livekit_client_url,
        room_name=room_name,
        participant_name=participant_name,
        status=session.status.value,
    )
