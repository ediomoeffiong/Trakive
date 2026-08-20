/**
 * @file ReportsShortcut.jsx
 * @description HR Admin — Reports & Analytics hub with HR KPI widgets and links to report tools.
 */

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  RiBarChartBoxLine, RiFileChartLine, RiSaveLine, RiDownloadLine,
  RiArrowRightSLine, RiGroupLine, RiShieldUserLine, RiCheckboxCircleLine,
} from 'react-icons/ri';
import { ROUTES } from '../../constants';

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.38 } }) };

const reportLinks = [
  {
    title: 'Analytics Dashboard',
    description: 'Overview charts, KPI trends, and real-time performance data across all departments.',
    icon: RiBarChartBoxLine,
    to: ROUTES.ADMIN_REPORTS,
    gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    shadow: 'rgba(99,102,241,0.3)',
  },
  {
    title: 'Report Builder',
    description: 'Build custom reports by selecting metrics, filters, and date ranges.',
    icon: RiFileChartLine,
    to: ROUTES.ADMIN_REPORTS_BUILDER,
    gradient: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
    shadow: 'rgba(14,165,233,0.3)',
  },
  {
    title: 'Saved Reports',
    description: 'Access and re-run previously generated and saved report templates.',
    icon: RiSaveLine,
    to: ROUTES.ADMIN_REPORTS_SAVED,
    gradient: 'linear-gradient(135deg, #10b981, #34d399)',
    shadow: 'rgba(16,185,129,0.3)',
  },
  {
    title: 'Export Center',
    description: 'Download reports as PDF, Excel, or CSV for offline use and presentations.',
    icon: RiDownloadLine,
    to: ROUTES.ADMIN_REPORTS_EXPORT,
    gradient: 'linear-gradient(135deg, #f59e0b, #f97316)',
    shadow: 'rgba(245,158,11,0.3)',
  },
];

const hrKpiWidgets = [
  {
    label: 'Overall Completion Rate',
    value: '94.2%',
    sub: 'Across all active batches',
    icon: RiCheckboxCircleLine,
    color: '#10b981',
    bg: '#ecfdf5',
    border: '#a7f3d0',
  },
  {
    label: 'Avg. Interns per Supervisor',
    value: '5.4',
    sub: 'Optimal range: 4–8',
    icon: RiShieldUserLine,
    color: '#6366f1',
    bg: '#eef2ff',
    border: '#c7d2fe',
  },
  {
    label: 'Total Active Interns',
    value: '148',
    sub: '4 active cohorts',
    icon: RiGroupLine,
    color: '#0ea5e9',
    bg: '#e0f2fe',
    border: '#bae6fd',
  },
  {
    label: 'Pending Actions',
    value: '12',
    sub: 'Approvals require attention',
    icon: RiBarChartBoxLine,
    color: '#f59e0b',
    bg: '#fffbeb',
    border: '#fde68a',
  },
];

const ReportsShortcut = () => {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '2rem' }}>
      {/* Header */}
      <motion.div variants={fadeUp} custom={0} initial="hidden" animate="visible">
        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
          Reports & Analytics
        </h2>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'var(--color-neutral-500)' }}>
          HR-specific KPIs and quick access to all reporting tools
        </p>
      </motion.div>

      {/* HR KPI Widgets */}
      <div>
        <motion.p
          variants={fadeUp} custom={1} initial="hidden" animate="visible"
          style={{ margin: '0 0 0.875rem', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-neutral-500)', textTransform: 'uppercase', letterSpacing: '0.06em' }}
        >
          HR Key Metrics
        </motion.p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
          {hrKpiWidgets.map((widget, idx) => {
            const WIcon = widget.icon;
            return (
              <motion.div
                key={widget.label}
                custom={idx + 2}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                whileHover={{ y: -2, boxShadow: '0 8px 24px rgb(0 0 0 / 0.09)' }}
                style={{
                  background: '#fff', borderRadius: '1rem', padding: '1.25rem',
                  border: `1px solid ${widget.border}`, boxShadow: '0 1px 4px rgb(0 0 0 / 0.04)',
                  display: 'flex', flexDirection: 'column', gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-500)' }}>{widget.label}</span>
                  <span style={{ width: '34px', height: '34px', borderRadius: '0.5rem', background: widget.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <WIcon style={{ fontSize: '1.125rem', color: widget.color }} />
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '2rem', fontWeight: 800, color: widget.color, lineHeight: 1 }}>{widget.value}</p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>{widget.sub}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Report Tool Cards */}
      <div>
        <motion.p
          variants={fadeUp} custom={6} initial="hidden" animate="visible"
          style={{ margin: '0 0 0.875rem', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-neutral-500)', textTransform: 'uppercase', letterSpacing: '0.06em' }}
        >
          Reporting Tools
        </motion.p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
          {reportLinks.map((link, idx) => {
            const LinkIcon = link.icon;
            return (
              <motion.div
                key={link.title}
                custom={idx + 7}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                whileHover={{ y: -3, boxShadow: `0 12px 32px ${link.shadow}` }}
                onClick={() => navigate(link.to)}
                style={{
                  background: '#fff', borderRadius: '1rem', padding: '1.5rem',
                  border: '1px solid var(--color-neutral-200)', cursor: 'pointer',
                  boxShadow: '0 1px 4px rgb(0 0 0 / 0.04)', transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '0.875rem',
                    background: link.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 4px 12px ${link.shadow}`,
                  }}>
                    <LinkIcon style={{ fontSize: '1.375rem', color: '#fff' }} />
                  </div>
                  <RiArrowRightSLine style={{ fontSize: '1.375rem', color: 'var(--color-neutral-300)' }} />
                </div>
                <h3 style={{ margin: '0 0 0.4rem', fontSize: '1rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
                  {link.title}
                </h3>
                <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-neutral-500)', lineHeight: 1.5 }}>
                  {link.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ReportsShortcut;
