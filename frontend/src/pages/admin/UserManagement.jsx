/**
 * @file UserManagement.jsx
 * @description HR Admin — System user directory with role tabs, activate/deactivate toggle, and password reset.
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  RiSearchLine, RiUserLine, RiShieldUserLine, RiAdminLine,
  RiBuildingLine, RiCheckLine, RiCloseLine, RiLockPasswordLine,
  RiToggleLine, RiToggleFill,
} from 'react-icons/ri';
import useHRStore from '../../store/useHRStore';
import Avatar from '../../components/ui/Avatar';

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.32 } }) };

const STATUS_STYLES = {
  active:   { bg: '#dcfce7', color: '#166534', label: 'Active' },
  inactive: { bg: '#fee2e2', color: '#991b1b', label: 'Inactive' },
  pending:  { bg: '#fef9c3', color: '#854d0e', label: 'Pending' },
};

const ROLE_ICONS = {
  'Intern':              RiUserLine,
  'Supervisor':          RiShieldUserLine,
  'HR Administrator':    RiAdminLine,
  'Department Head':     RiBuildingLine,
};

const ROLE_COLORS = {
  'Intern':              { bg: '#eff6ff', color: '#1d4ed8' },
  'Supervisor':          { bg: '#eef2ff', color: '#4338ca' },
  'HR Administrator':    { bg: '#ecfeff', color: '#0e7490' },
  'Department Head':     { bg: '#f5f3ff', color: '#6d28d9' },
};

const ROLE_TABS = [
  { key: 'all',               label: 'All Users',      icon: RiUserLine },
  { key: 'Intern',            label: 'Interns',        icon: RiUserLine },
  { key: 'Supervisor',        label: 'Supervisors',    icon: RiShieldUserLine },
  { key: 'HR Administrator',  label: 'HR Admins',      icon: RiAdminLine },
  { key: 'Department Head',   label: 'Dept Heads',     icon: RiBuildingLine },
];

// ── Confirm Modal ─────────────────────────────────────────────────────────────
function ConfirmModal({ title, description, confirmLabel, onClose, onConfirm, danger }) {
  const [loading, setLoading] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        style={{ background: '#fff', borderRadius: '1rem', padding: '1.5rem', width: '100%', maxWidth: '400px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>{title}</h3>
        <p style={{ margin: '0 0 1.25rem', fontSize: '0.875rem', color: 'var(--color-neutral-600)' }}>{description}</p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: '0.5rem 1rem' }}>Cancel</button>
          <button
            onClick={async () => { setLoading(true); await onConfirm(); setLoading(false); onClose(); }}
            disabled={loading}
            style={{
              padding: '0.5rem 1.25rem', borderRadius: '0.625rem', border: 'none',
              background: danger ? '#dc2626' : 'linear-gradient(135deg, #6366f1, #0ea5e9)',
              color: '#fff', fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Processing…' : confirmLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const UserManagement = () => {
  const { users, userLoading, userFilters, loadUsers, setUserFilters, toggleUser, sendPasswordReset } = useHRStore();
  const [toggleTarget, setToggleTarget] = useState(null);
  const [resetTarget, setResetTarget] = useState(null);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleSearch = (e) => {
    setUserFilters({ search: e.target.value });
    loadUsers({ search: e.target.value });
  };

  const handleRoleFilter = (role) => {
    setUserFilters({ role });
    loadUsers({ role });
  };

  const handleToggle = async () => {
    const ok = await toggleUser(toggleTarget.id);
    if (ok) toast.success(`User ${toggleTarget.status === 'active' ? 'deactivated' : 'activated'}.`);
    else toast.error('Failed to update user status.');
  };

  const handleReset = async () => {
    const ok = await sendPasswordReset(resetTarget.id);
    if (ok) toast.success(`Password reset email sent to ${resetTarget.email}.`);
    else toast.error('Failed to send reset email.');
  };

  const roleCounts = {};
  ROLE_TABS.forEach(tab => {
    roleCounts[tab.key] = tab.key === 'all' ? users.length : users.filter(u => u.role === tab.key).length;
  });

  // Get total from all loaded users for tab counts
  const allUsersForCount = useHRStore.getState().users;

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '2rem' }}>
        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>User Management</h2>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'var(--color-neutral-500)' }}>
            Manage roles, activation status, and access control for all portal users.
          </p>
        </motion.div>

        {/* Role Tabs */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {ROLE_TABS.map(tab => {
            const TabIcon = tab.icon;
            const isActive = userFilters.role === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => handleRoleFilter(tab.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.5rem 0.875rem', borderRadius: '0.625rem',
                  border: `1px solid ${isActive ? '#6366f1' : 'var(--color-neutral-200)'}`,
                  background: isActive ? '#eef2ff' : 'var(--color-neutral-50)',
                  color: isActive ? '#4338ca' : 'var(--color-neutral-600)',
                  cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600,
                  transition: 'all 0.15s',
                }}
              >
                <TabIcon style={{ fontSize: '0.9375rem' }} />
                {tab.label}
                <span style={{
                  padding: '0.1rem 0.4rem', borderRadius: '99px', fontSize: '0.6875rem', fontWeight: 700,
                  background: isActive ? '#c7d2fe' : 'var(--color-neutral-200)',
                  color: isActive ? '#4338ca' : 'var(--color-neutral-600)',
                }}>
                  {roleCounts[tab.key] ?? 0}
                </span>
              </button>
            );
          })}
        </motion.div>

        {/* Search */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" style={{ position: 'relative', maxWidth: '480px' }}>
          <RiSearchLine style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-neutral-400)' }} />
          <input
            type="search"
            placeholder="Search by name or email…"
            className="input-field"
            style={{ paddingLeft: '2.25rem', width: '100%' }}
            value={userFilters.search}
            onChange={handleSearch}
          />
        </motion.div>

        {/* Table */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible"
          style={{ background: '#fff', borderRadius: '1rem', border: '1px solid var(--color-neutral-200)', overflow: 'hidden' }}
        >
          {userLoading ? (
            <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[...Array(6)].map((_, i) => <div key={i} style={{ height: '52px', borderRadius: '0.5rem', background: 'var(--color-neutral-100)', animation: 'pulse 1.5s ease-in-out infinite' }} />)}
            </div>
          ) : users.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <RiUserLine style={{ fontSize: '2.5rem', color: 'var(--color-neutral-300)' }} />
              <p style={{ marginTop: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-400)' }}>No users found</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-neutral-100)', background: 'var(--color-neutral-50)' }}>
                    {['User', 'Role', 'Department', 'Status', 'Last Active', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '0.875rem 1rem', textAlign: h === 'Actions' ? 'right' : 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-500)', letterSpacing: '0.04em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, idx) => {
                    const ss = STATUS_STYLES[user.status] || STATUS_STYLES.pending;
                    const rc = ROLE_COLORS[user.role] || ROLE_COLORS['Intern'];
                    const RoleIcon = ROLE_ICONS[user.role] || RiUserLine;
                    return (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.025 }}
                        style={{ borderBottom: '1px solid var(--color-neutral-100)', transition: 'background 0.12s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-neutral-50)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; }}
                      >
                        <td style={{ padding: '0.875rem 1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Avatar name={user.name} size="sm" />
                            <div>
                              <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>{user.name}</p>
                              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-400)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                            padding: '0.2rem 0.625rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700,
                            background: rc.bg, color: rc.color,
                          }}>
                            <RoleIcon style={{ fontSize: '0.8125rem' }} />
                            {user.role}
                          </span>
                        </td>
                        <td style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', color: 'var(--color-neutral-600)' }}>
                          {user.department}
                        </td>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          <span style={{ padding: '0.2rem 0.6rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700, background: ss.bg, color: ss.color }}>
                            {ss.label}
                          </span>
                        </td>
                        <td style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', color: 'var(--color-neutral-500)' }}>
                          {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'Never'}
                        </td>
                        <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => setToggleTarget(user)}
                              title={user.status === 'active' ? 'Deactivate user' : 'Activate user'}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '0.35rem',
                                padding: '0.35rem 0.625rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                                border: `1px solid ${user.status === 'active' ? '#fecaca' : '#bbf7d0'}`,
                                background: user.status === 'active' ? '#fff5f5' : '#f0fdf4',
                                color: user.status === 'active' ? '#dc2626' : '#16a34a',
                              }}
                            >
                              {user.status === 'active' ? <RiCloseLine /> : <RiCheckLine />}
                              {user.status === 'active' ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => setResetTarget(user)}
                              title="Send password reset"
                              style={{
                                display: 'flex', alignItems: 'center', gap: '0.35rem',
                                padding: '0.35rem 0.625rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                                border: '1px solid var(--color-neutral-200)',
                                background: 'var(--color-neutral-50)',
                                color: 'var(--color-neutral-600)',
                              }}
                            >
                              <RiLockPasswordLine />
                              Reset
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      {/* Confirm modals */}
      <AnimatePresence>
        {toggleTarget && (
          <ConfirmModal
            title={toggleTarget.status === 'active' ? 'Deactivate User' : 'Activate User'}
            description={`Are you sure you want to ${toggleTarget.status === 'active' ? 'deactivate' : 'activate'} ${toggleTarget.name}? ${toggleTarget.status === 'active' ? 'They will lose access to the portal.' : 'They will regain access to the portal.'}`}
            confirmLabel={toggleTarget.status === 'active' ? 'Deactivate' : 'Activate'}
            danger={toggleTarget.status === 'active'}
            onClose={() => setToggleTarget(null)}
            onConfirm={handleToggle}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {resetTarget && (
          <ConfirmModal
            title="Reset Password"
            description={`Send a password reset email to ${resetTarget.name} at ${resetTarget.email}?`}
            confirmLabel="Send Reset Email"
            onClose={() => setResetTarget(null)}
            onConfirm={handleReset}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default UserManagement;
