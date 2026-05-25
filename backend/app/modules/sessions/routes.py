from uuid import UUID

from fastapi import APIRouter, HTTPException, Request

from app.modules.sessions.models import VoiceSessionResponse
from app.modules.sessions.repository import VoiceSessionRepository

router = APIRouter()


@router.get("/{session_id}")
async def get_voice_session(request: Request, session_id: UUID) -> VoiceSessionResponse:
    repository = VoiceSessionRepository(request.app.state.db_pool)
    session = await repository.get(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Voice session not found")

    return VoiceSessionResponse(session=session)
