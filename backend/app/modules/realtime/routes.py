import logging
from uuid import UUID

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.modules.sessions.models import VoiceSessionStatus
from app.modules.sessions.repository import VoiceSessionRepository

router = APIRouter()
logger = logging.getLogger(__name__)


@router.websocket("/ws/{session_id}")
async def realtime_status_socket(websocket: WebSocket, session_id: UUID) -> None:
    await websocket.accept()
    repository = VoiceSessionRepository(websocket.app.state.db_pool)
    session = await repository.update_status(session_id, VoiceSessionStatus.CONNECTING, {"websocket": "connected"})
    if session is None:
        await websocket.send_json({"type": "error", "message": "Voice session not found."})
        await websocket.close(code=1008)
        return

    logger.info("voice_session_websocket_connected session_id=%s room=%s", session.id, session.room_name)
    await websocket.send_json(
        {
            "type": "session.connected",
            "session": session.model_dump(mode="json"),
        }
    )

    try:
        while True:
            data = await websocket.receive_json()
            event_type = data.get("type")

            if event_type == "voice.active":
                session = await repository.update_status(session_id, VoiceSessionStatus.ACTIVE, {"livekit": "connected"})
                await websocket.send_json({"type": "session.updated", "session": session.model_dump(mode="json")})
            elif event_type == "voice.ended":
                session = await repository.update_status(session_id, VoiceSessionStatus.ENDED, {"ended_by": "browser"})
                await websocket.send_json({"type": "session.updated", "session": session.model_dump(mode="json")})
            elif event_type == "ping":
                await websocket.send_json({"type": "pong"})
            else:
                await websocket.send_json({"type": "event.ack", "received": data})
    except WebSocketDisconnect:
        await repository.update_status(session_id, VoiceSessionStatus.ENDED, {"websocket": "disconnected"})
        logger.info("voice_session_websocket_disconnected session_id=%s", session_id)
        return
