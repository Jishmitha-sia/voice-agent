import json
from uuid import UUID, uuid4

from asyncpg import Pool, Record

from app.modules.sessions.models import VoiceSession, VoiceSessionStatus


def _record_to_session(record: Record) -> VoiceSession:
    metadata = record["metadata"]
    if isinstance(metadata, str):
        metadata = json.loads(metadata)

    return VoiceSession(
        id=record["id"],
        room_name=record["room_name"],
        participant_name=record["participant_name"],
        status=VoiceSessionStatus(record["status"]),
        metadata=dict(metadata),
        created_at=record["created_at"],
        connected_at=record["connected_at"],
        ended_at=record["ended_at"],
        updated_at=record["updated_at"],
    )


class VoiceSessionRepository:
    def __init__(self, pool: Pool) -> None:
        self.pool = pool

    async def create(self, room_name: str, participant_name: str, metadata: dict | None = None) -> VoiceSession:
        session_id = uuid4()
        record = await self.pool.fetchrow(
            """
            INSERT INTO voice_sessions (id, room_name, participant_name, status, metadata)
            VALUES ($1, $2, $3, $4, $5::jsonb)
            RETURNING *
            """,
            session_id,
            room_name,
            participant_name,
            VoiceSessionStatus.CREATED.value,
            json.dumps(metadata or {}),
        )
        return _record_to_session(record)

    async def get(self, session_id: UUID) -> VoiceSession | None:
        record = await self.pool.fetchrow("SELECT * FROM voice_sessions WHERE id = $1", session_id)
        return _record_to_session(record) if record else None

    async def update_status(
        self,
        session_id: UUID,
        status: VoiceSessionStatus,
        metadata: dict | None = None,
    ) -> VoiceSession | None:
        record = await self.pool.fetchrow(
            """
            UPDATE voice_sessions
            SET
                status = $2,
                metadata = metadata || $3::jsonb,
                connected_at = CASE WHEN $2 = 'active' AND connected_at IS NULL THEN NOW() ELSE connected_at END,
                ended_at = CASE WHEN $2 = 'ended' AND ended_at IS NULL THEN NOW() ELSE ended_at END,
                updated_at = NOW()
            WHERE id = $1
            RETURNING *
            """,
            session_id,
            status.value,
            json.dumps(metadata or {}),
        )
        return _record_to_session(record) if record else None
