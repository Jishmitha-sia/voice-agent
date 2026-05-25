from uuid import uuid4

from fastapi import APIRouter
from livekit import api
from pydantic import BaseModel, Field

from app.core.config import get_settings

router = APIRouter()


class LiveKitTokenRequest(BaseModel):
    room_name: str | None = Field(default=None, min_length=1, max_length=80)
    participant_name: str | None = Field(default=None, min_length=1, max_length=80)


class LiveKitTokenResponse(BaseModel):
    token: str
    url: str
    room_name: str
    participant_name: str


@router.post("/token")
async def create_livekit_token(payload: LiveKitTokenRequest) -> LiveKitTokenResponse:
    settings = get_settings()
    room_name = payload.room_name or f"support-{uuid4().hex[:10]}"
    participant_name = payload.participant_name or f"customer-{uuid4().hex[:8]}"

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

    return LiveKitTokenResponse(
        token=token,
        url=settings.livekit_client_url,
        room_name=room_name,
        participant_name=participant_name,
    )
