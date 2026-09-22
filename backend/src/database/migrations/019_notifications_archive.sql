-- Allow users to hide notifications without destroying the underlying record.

ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_notifications_archived_at ON notifications(archived_at);
