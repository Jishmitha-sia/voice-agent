from datetime import datetime
from enum import StrEnum
from uuid import UUID

from pydantic import BaseModel, Field


class VoiceSessionStatus(StrEnum):
    CREATED = "created"
    TOKEN_ISSUED = "token_issued"
    CONNECTING = "connecting"
    ACTIVE = "active"
    ENDED = "ended"
    ERROR = "error"


class VoiceSession(BaseModel):
    id: UUID
    room_name: str
    participant_name: str
    status: VoiceSessionStatus
    metadata: dict = Field(default_factory=dict)
    created_at: datetime
    connected_at: datetime | None = None
    ended_at: datetime | None = None
    updated_at: datetime


class VoiceSessionResponse(BaseModel):
    session: VoiceSession
