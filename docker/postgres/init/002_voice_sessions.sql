CREATE TABLE IF NOT EXISTS voice_sessions (
    id UUID PRIMARY KEY,
    room_name TEXT NOT NULL UNIQUE,
    participant_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'created',
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    connected_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_voice_sessions_status ON voice_sessions(status);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_created_at ON voice_sessions(created_at DESC);
