-- Day 7: Schema Enhancements for Notifications, Documents & Messaging

-- 1. Documents Enhancements: Add entity_type and entity_id columns for entity associations
ALTER TABLE documents ADD COLUMN IF NOT EXISTS entity_type VARCHAR(50);
ALTER TABLE documents ADD COLUMN IF NOT EXISTS entity_id UUID;

-- 2. Messages Enhancements: Add deleted_at for soft-delete support
ALTER TABLE messages ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- 3. Indexes for fast query lookups and filtering
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_documents_entity ON documents(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_documents_owner_cat ON documents(owner_id, category);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conv_participants_user ON conversation_participants(user_id);
