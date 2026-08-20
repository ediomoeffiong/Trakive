-- Day 2: Seed System for Roles, Permissions, and Mappings

-- 1. Insert System Roles
INSERT INTO roles (name, description, is_system) VALUES
('super_admin', 'System Super Administrator with full platform control', true),
('org_admin', 'Organization Administrator with full organization control', true),
('department_head', 'Department Head managing departmental teams and interns', true),
('supervisor', 'Supervisor assigned to guide and assess specific interns', true),
('intern', 'Intern participating in internship programs', true)
ON CONFLICT (name) DO NOTHING;

-- 2. Insert Permissions
INSERT INTO permissions (name, module, description) VALUES
-- Organization permissions
('organizations:read', 'organizations', 'View organization details'),
('organizations:write', 'organizations', 'Update organization details'),
('organizations:delete', 'organizations', 'Delete organization'),

-- Department permissions
('departments:read', 'departments', 'View departments'),
('departments:write', 'departments', 'Create/edit departments'),
('departments:delete', 'departments', 'Delete departments'),

-- User permissions
('users:read', 'users', 'View user profiles'),
('users:write', 'users', 'Create and edit users'),
('users:delete', 'users', 'Delete or deactivate users'),

-- Role & Permission management
('roles:read', 'roles', 'View roles and permissions'),
('roles:write', 'roles', 'Manage roles and permissions'),

-- Internship management
('internships:read', 'internships', 'View internships'),
('internships:create', 'internships', 'Create new internship programs'),
('internships:update', 'internships', 'Update internship programs'),
('internships:delete', 'internships', 'Delete internship programs'),
('internships:apply', 'internships', 'Apply for internship programs'),

-- Task management
('tasks:read', 'tasks', 'View assigned or created tasks'),
('tasks:create', 'tasks', 'Create and assign tasks'),
('tasks:update', 'tasks', 'Update tasks'),
('tasks:delete', 'tasks', 'Delete tasks'),
('tasks:submit', 'tasks', 'Submit work for a task'),
('tasks:review', 'tasks', 'Review and grade task submissions'),
('tasks:comment', 'tasks', 'Comment on tasks'),

-- Attendance management
('attendance:read', 'attendance', 'View attendance logs'),
('attendance:checkin', 'attendance', 'Record check-in/check-out'),
('attendance:verify', 'attendance', 'Verify or adjust attendance records'),
('attendance:export', 'attendance', 'Export attendance reports'),

-- Leave requests
('leave:read', 'leave', 'View leave requests'),
('leave:apply', 'leave', 'Apply for leave'),
('leave:approve', 'leave', 'Approve or reject leave requests'),

-- Notifications
('notifications:read', 'notifications', 'View personal notifications'),
('notifications:write', 'notifications', 'Send notifications'),

-- Messaging / Conversations
('conversations:read', 'conversations', 'View messaging channels'),
('conversations:write', 'conversations', 'Send messages'),

-- Documents
('documents:read', 'documents', 'View uploaded documents'),
('documents:upload', 'documents', 'Upload documents'),
('documents:delete', 'documents', 'Delete documents'),

-- Performance Reports
('reports:read', 'reports', 'View performance reports'),
('reports:create', 'reports', 'Generate performance evaluation reports'),
('reports:publish', 'reports', 'Publish performance reports'),

-- Audit Logs
('audit:read', 'audit', 'View system audit logs')
ON CONFLICT (name) DO NOTHING;

-- 3. Map Permissions to Roles

-- super_admin gets all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'super_admin'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- org_admin permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.name IN (
    'organizations:read', 'organizations:write',
    'departments:read', 'departments:write', 'departments:delete',
    'users:read', 'users:write', 'users:delete',
    'roles:read',
    'internships:read', 'internships:create', 'internships:update', 'internships:delete',
    'tasks:read', 'tasks:create', 'tasks:update', 'tasks:delete', 'tasks:review', 'tasks:comment',
    'attendance:read', 'attendance:verify', 'attendance:export',
    'leave:read', 'leave:approve',
    'notifications:read', 'notifications:write',
    'conversations:read', 'conversations:write',
    'documents:read', 'documents:upload', 'documents:delete',
    'reports:read', 'reports:create', 'reports:publish',
    'audit:read'
)
WHERE r.name = 'org_admin'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- department_head permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.name IN (
    'organizations:read',
    'departments:read',
    'users:read',
    'internships:read', 'internships:create', 'internships:update',
    'tasks:read', 'tasks:create', 'tasks:update', 'tasks:review', 'tasks:comment',
    'attendance:read', 'attendance:verify', 'attendance:export',
    'leave:read', 'leave:approve',
    'notifications:read', 'notifications:write',
    'conversations:read', 'conversations:write',
    'documents:read', 'documents:upload',
    'reports:read', 'reports:create', 'reports:publish'
)
WHERE r.name = 'department_head'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- supervisor permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.name IN (
    'organizations:read',
    'departments:read',
    'users:read',
    'internships:read',
    'tasks:read', 'tasks:create', 'tasks:update', 'tasks:review', 'tasks:comment',
    'attendance:read', 'attendance:verify',
    'leave:read', 'leave:approve',
    'notifications:read', 'notifications:write',
    'conversations:read', 'conversations:write',
    'documents:read', 'documents:upload',
    'reports:read', 'reports:create'
)
WHERE r.name = 'supervisor'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- intern permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.name IN (
    'organizations:read',
    'departments:read',
    'users:read',
    'internships:read', 'internships:apply',
    'tasks:read', 'tasks:submit', 'tasks:comment',
    'attendance:read', 'attendance:checkin',
    'leave:read', 'leave:apply',
    'notifications:read',
    'conversations:read', 'conversations:write',
    'documents:read', 'documents:upload',
    'reports:read'
)
WHERE r.name = 'intern'
ON CONFLICT (role_id, permission_id) DO NOTHING;
