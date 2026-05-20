from uuid import uuid4

from fastapi import APIRouter, HTTPException
from livekit import api
from pydantic import BaseModel, Field

from app.core.config import get_settings
from app.services.agent import ConversationMessage, CustomerSupportAgent
from app.services.llm import LLMProviderError, build_llm_client

router = APIRouter()
conversation_store: dict[str, list[ConversationMessage]] = {}


class LiveKitTokenRequest(BaseModel):
    room_name: str | None = Field(default=None, min_length=1, max_length=80)
    participant_name: str | None = Field(default=None, min_length=1, max_length=80)


class LiveKitTokenResponse(BaseModel):
    token: str
    url: str
    room_name: str
    participant_name: str


class ConversationTurn(BaseModel):
    role: str
    content: str


class ConversationMessageRequest(BaseModel):
    session_id: str | None = Field(default=None, min_length=1, max_length=120)
    message: str = Field(min_length=1, max_length=2000)


class ConversationMessageResponse(BaseModel):
    session_id: str
    reply: str
    messages: list[ConversationTurn]


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


@router.post("/livekit/token")
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


@router.post("/conversations/message")
async def create_conversation_message(
    payload: ConversationMessageRequest,
) -> ConversationMessageResponse:
    settings = get_settings()
    session_id = payload.session_id or f"support-session-{uuid4().hex[:12]}"
    history = conversation_store.setdefault(session_id, [])

    agent = CustomerSupportAgent(build_llm_client(settings))
    try:
        reply = await agent.respond(payload.message, history)
    except LLMProviderError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    history.extend(
        [
            ConversationMessage(role="user", content=payload.message),
            ConversationMessage(role="assistant", content=reply),
        ]
    )

    return ConversationMessageResponse(
        session_id=session_id,
        reply=reply,
        messages=[ConversationTurn(role=message.role, content=message.content) for message in history],
    )
