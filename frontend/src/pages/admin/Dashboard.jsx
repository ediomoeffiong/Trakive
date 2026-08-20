/**
 * @file Dashboard.jsx
 * @description HR Administrator Dashboard — KPI cards, charts, pending approvals, activity feed.
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import toast from 'react-hot-toast';
import {
  RiGroupLine, RiShieldUserLine, RiBuildingLine, RiTimeLine,
  RiPieChartLine, RiFoldersLine, RiArrowUpLine, RiArrowDownLine,
  RiAddLine, RiMegaphoneLine, RiUserSettingsLine, RiCheckLine,
  RiArrowRightSLine,
} from 'react-icons/ri';
import useHRStore from '../../store/useHRStore';
import { ROUTES } from '../../constants';

// ── Fade animation variant ─────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4, ease: 'easeOut' } }),
};

// ── Icon map ───────────────────────────────────────────────────────────────────
const ICON_MAP = {
  group: RiGroupLine,
  'shield-user': RiShieldUserLine,
  building: RiBuildingLine,
  time: RiTimeLine,
  'chart-pie': RiPieChartLine,
  layers: RiFoldersLine,
};

const COLOR_MAP = {
  blue:    { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe', icon: '#3b82f6' },
  indigo:  { bg: '#eef2ff', text: '#4338ca', border: '#c7d2fe', icon: '#6366f1' },
  purple:  { bg: '#f5f3ff', text: '#7c3aed', border: '#ddd6fe', icon: '#8b5cf6' },
  amber:   { bg: '#fffbeb', text: '#92400e', border: '#fde68a', icon: '#f59e0b' },
  emerald: { bg: '#ecfdf5', text: '#065f46', border: '#a7f3d0', icon: '#10b981' },
  cyan:    { bg: '#ecfeff', text: '#155e75', border: '#a5f3fc', icon: '#06b6d4' },
};

const PRIORITY_COLORS = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };
const ACTIVITY_ICONS = {
  announcement:     RiMegaphoneLine,
  batch_created:    RiFoldersLine,
  supervisor_added: RiShieldUserLine,
  intern_assigned:  RiGroupLine,
  user_deactivated: RiUserSettingsLine,
  department_updated: RiBuildingLine,
};

function formatTime(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ── KPI Card ───────────────────────────────────────────────────────────────────
function KPICard({ card, index }) {
  const Icon = ICON_MAP[card.icon] || RiGroupLine;
  const colors = COLOR_MAP[card.color] || COLOR_MAP.blue;
  const isIncrease = card.changeType === 'increase';
  const isDecrease = card.changeType === 'decrease';

  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      style={{
        background: '#fff',
        borderRadius: '1rem',
        padding: '1.25rem',
        border: '1px solid var(--color-neutral-200)',
        boxShadow: '0 1px 4px rgb(0 0 0 / 0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        transition: 'box-shadow 0.2s, transform 0.2s',
        cursor: 'default',
      }}
      whileHover={{ y: -2, boxShadow: '0 6px 20px rgb(0 0 0 / 0.08)' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-500)' }}>
          {card.label}
        </span>
        <span style={{
          width: '36px', height: '36px', borderRadius: '0.625rem',
          background: colors.bg, border: `1px solid ${colors.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon style={{ fontSize: '1.125rem', color: colors.icon }} />
        </span>
      </div>

      <div style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--color-neutral-900)', lineHeight: 1 }}>
        {card.value}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        {isIncrease && <RiArrowUpLine style={{ color: '#10b981', fontSize: '0.875rem' }} />}
        {isDecrease && <RiArrowDownLine style={{ color: '#ef4444', fontSize: '0.875rem' }} />}
        <span style={{
          fontSize: '0.75rem', fontWeight: 600,
          color: isIncrease ? '#10b981' : isDecrease ? '#ef4444' : 'var(--color-neutral-400)',
        }}>
          {isIncrease ? `+${card.change}` : isDecrease ? card.change : '—'}
        </span>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>
          {card.changeLabel}
        </span>
      </div>
    </motion.div>
  );
}

// ── Skeleton loader ────────────────────────────────────────────────────────────
function KPISkeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{ height: '130px', borderRadius: '1rem', background: 'var(--color-neutral-100)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      ))}
    </div>
  );
}

// ── Pending Approvals ──────────────────────────────────────────────────────────
function PendingApprovals({ items }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {items.map((item) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.875rem',
            padding: '0.75rem 1rem', borderRadius: '0.75rem',
            border: '1px solid var(--color-neutral-200)', background: '#fafafa',
          }}
        >
          <span style={{
            width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
            background: PRIORITY_COLORS[item.priority],
            boxShadow: `0 0 0 3px ${PRIORITY_COLORS[item.priority]}30`,
          }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-800)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {item.intern}
            </p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
              {item.type} · {item.step}
            </p>
          </div>
          <span style={{
            fontSize: '0.6875rem', fontWeight: 600, padding: '0.2rem 0.5rem',
            borderRadius: '99px', background: `${PRIORITY_COLORS[item.priority]}15`,
            color: PRIORITY_COLORS[item.priority],
          }}>
            {item.priority}
          </span>
          <button
            style={{
              width: '28px', height: '28px', borderRadius: '50%', border: 'none',
              background: '#dcfce7', color: '#16a34a', cursor: 'pointer', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            title="Mark resolved"
            aria-label="Mark resolved"
          >
            <RiCheckLine style={{ fontSize: '0.875rem' }} />
          </button>
        </motion.div>
      ))}
    </div>
  );
}

// ── Activity Feed ──────────────────────────────────────────────────────────────
function ActivityFeed({ items }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      {items.map((item, idx) => {
        const Icon = ACTIVITY_ICONS[item.type] || RiGroupLine;
        return (
          <div
            key={item.id}
            style={{
              display: 'flex', gap: '0.875rem', alignItems: 'flex-start',
              paddingBottom: idx < items.length - 1 ? '1rem' : 0,
              paddingTop: idx > 0 ? '1rem' : 0,
              borderBottom: idx < items.length - 1 ? '1px solid var(--color-neutral-100)' : 'none',
            }}
          >
            <span style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'var(--color-neutral-100)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Icon style={{ fontSize: '1rem', color: 'var(--color-neutral-600)' }} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-800)' }}>
                {item.title}
              </p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>
                {item.actor} · {formatTime(item.time)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Quick Actions ──────────────────────────────────────────────────────────────
const quickActions = [
  { label: 'New Announcement', icon: RiMegaphoneLine, to: ROUTES.ADMIN_ANNOUNCEMENTS, color: '#6366f1' },
  { label: 'Add Supervisor',   icon: RiShieldUserLine, to: ROUTES.ADMIN_SUPERVISORS,  color: '#0ea5e9' },
  { label: 'Create Batch',     icon: RiFoldersLine,    to: ROUTES.ADMIN_BATCHES,       color: '#10b981' },
  { label: 'Manage Users',     icon: RiUserSettingsLine, to: ROUTES.ADMIN_USERS,       color: '#f59e0b' },
];

// ── Main Dashboard ─────────────────────────────────────────────────────────────
const HRDashboard = () => {
  const navigate = useNavigate();
  const {
    dashboard, dashboardLoading, dashboardError, loadDashboard,
  } = useHRStore();

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (dashboardError) {
    toast.error(dashboardError);
  }

  const kpis              = dashboard?.kpis || [];
  const deptDistribution  = dashboard?.deptDistribution || [];
  const batchTrend        = dashboard?.batchTrend || [];
  const pendingApprovals  = dashboard?.pendingApprovals || [];
  const recentActivity    = dashboard?.recentActivity || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', paddingBottom: '2rem' }}>

      {/* ── Page header ── */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
            Welcome back, HR Admin 👋
          </h2>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'var(--color-neutral-500)' }}>
            Here's your organization overview for today.
          </p>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {quickActions.map((qa) => {
            const QIcon = qa.icon;
            return (
              <button
                key={qa.label}
                onClick={() => navigate(qa.to)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.45rem 0.875rem', borderRadius: '0.625rem',
                  border: `1px solid ${qa.color}30`, background: `${qa.color}10`,
                  color: qa.color, cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = `${qa.color}20`; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = `${qa.color}10`; }}
              >
                <QIcon style={{ fontSize: '1rem' }} />
                {qa.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* ── KPI Cards ── */}
      {dashboardLoading ? (
        <KPISkeleton />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {kpis.map((card, i) => (
            <KPICard key={card.id} card={card} index={i} />
          ))}
        </div>
      )}

      {/* ── Charts Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {/* Dept Distribution Chart */}
        <motion.div
          variants={fadeUp} custom={1} initial="hidden" animate="visible"
          style={{
            background: '#fff', borderRadius: '1rem', padding: '1.25rem',
            border: '1px solid var(--color-neutral-200)',
            boxShadow: '0 1px 4px rgb(0 0 0 / 0.04)',
          }}
        >
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
              Interns by Department
            </h3>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>
              Current cohort distribution
            </p>
          </div>
          {dashboardLoading ? (
            <div style={{ height: '220px', background: 'var(--color-neutral-100)', borderRadius: '0.5rem', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={deptDistribution} barSize={28} margin={{ top: 4, right: 0, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-neutral-100)" />
                <XAxis dataKey="department" tick={{ fontSize: 11, fill: 'var(--color-neutral-500)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-neutral-400)' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '0.5rem', fontSize: '0.8125rem', border: '1px solid var(--color-neutral-200)', boxShadow: '0 4px 12px rgb(0 0 0/0.08)' }}
                  cursor={{ fill: 'rgba(99,102,241,0.06)' }}
                />
                <Bar dataKey="interns" name="Interns" radius={[6, 6, 0, 0]}>
                  {deptDistribution.map((entry) => (
                    <Cell key={entry.department} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Batch Trend Chart */}
        <motion.div
          variants={fadeUp} custom={2} initial="hidden" animate="visible"
          style={{
            background: '#fff', borderRadius: '1rem', padding: '1.25rem',
            border: '1px solid var(--color-neutral-200)',
            boxShadow: '0 1px 4px rgb(0 0 0 / 0.04)',
          }}
        >
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
              Intern Cohort Growth
            </h3>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>
              Active vs. completed interns per month
            </p>
          </div>
          {dashboardLoading ? (
            <div style={{ height: '220px', background: 'var(--color-neutral-100)', borderRadius: '0.5rem', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={batchTrend} margin={{ top: 4, right: 0, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-neutral-100)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--color-neutral-500)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-neutral-400)' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '0.5rem', fontSize: '0.8125rem', border: '1px solid var(--color-neutral-200)', boxShadow: '0 4px 12px rgb(0 0 0/0.08)' }}
                />
                <Line type="monotone" dataKey="active" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4, fill: '#6366f1' }} name="Active" />
                <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: '#10b981' }} name="Completed" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* ── Bottom Row: Pending Approvals + Activity Feed ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
        {/* Pending Approvals */}
        <motion.div
          variants={fadeUp} custom={3} initial="hidden" animate="visible"
          style={{
            background: '#fff', borderRadius: '1rem', padding: '1.25rem',
            border: '1px solid var(--color-neutral-200)',
            boxShadow: '0 1px 4px rgb(0 0 0 / 0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                Pending Approvals
              </h3>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>
                {pendingApprovals.length} items require attention
              </p>
            </div>
            <button
              onClick={() => navigate(ROUTES.ADMIN_INTERNS)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.25rem',
                fontSize: '0.75rem', fontWeight: 600, color: '#6366f1',
                background: 'none', border: 'none', cursor: 'pointer',
              }}
            >
              View All <RiArrowRightSLine />
            </button>
          </div>
          {dashboardLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[1,2,3].map(i => <div key={i} style={{ height: '60px', borderRadius: '0.75rem', background: 'var(--color-neutral-100)', animation: 'pulse 1.5s ease-in-out infinite' }} />)}
            </div>
          ) : (
            <PendingApprovals items={pendingApprovals.slice(0, 5)} />
          )}
        </motion.div>

        {/* Activity Feed */}
        <motion.div
          variants={fadeUp} custom={4} initial="hidden" animate="visible"
          style={{
            background: '#fff', borderRadius: '1rem', padding: '1.25rem',
            border: '1px solid var(--color-neutral-200)',
            boxShadow: '0 1px 4px rgb(0 0 0 / 0.04)',
          }}
        >
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
              Recent Activity
            </h3>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>
              Organization-wide actions
            </p>
          </div>
          {dashboardLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[1,2,3].map(i => <div key={i} style={{ height: '48px', borderRadius: '0.5rem', background: 'var(--color-neutral-100)', animation: 'pulse 1.5s ease-in-out infinite' }} />)}
            </div>
          ) : (
            <ActivityFeed items={recentActivity} />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default HRDashboard;
