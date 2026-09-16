-- Migration 011: Project links
-- Allows interns/supervisors to attach the primary URL for a project.

ALTER TABLE projects
    ADD COLUMN IF NOT EXISTS project_link_url TEXT;
