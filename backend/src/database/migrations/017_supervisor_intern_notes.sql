-- Persistent supervisor notes attached to intern profiles.

CREATE TABLE IF NOT EXISTS supervisor_intern_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intern_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    supervisor_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(160) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(80) DEFAULT 'General',
    color VARCHAR(40) DEFAULT 'blue',
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_supervisor_intern_notes_intern ON supervisor_intern_notes(intern_user_id);
CREATE INDEX IF NOT EXISTS idx_supervisor_intern_notes_supervisor ON supervisor_intern_notes(supervisor_user_id);
