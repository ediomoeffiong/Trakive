import {
  FiAward,
  FiCheckCircle,
  FiFileText,
  FiTrendingUp,
  FiUsers,
} from 'react-icons/fi';
import { useProfileStore } from '../../store/useProfileStore';

const Metric = ({ label, value, sub, icon: Icon, tone = 'neutral' }) => (
  <div className={`profile-glance-metric profile-glance-${tone}`}>
    <span className="profile-glance-icon" aria-hidden="true">
      <Icon />
    </span>
    <span className="profile-glance-copy">
      <strong>{value ?? '-'}</strong>
      <span>{label}</span>
      {sub ? <small>{sub}</small> : null}
    </span>
  </div>
);

const ProfileAtAGlance = () => {
  const { profile, internship, skills, documents, achievements, assignedInterns } =
    useProfileStore();

  if (!profile) return null;

  const isSupervisor = profile.role === 'Supervisor';

  const metrics = isSupervisor
    ? [
        {
          label: 'Assigned Interns',
          value: assignedInterns?.stats?.totalAssigned ?? 0,
          icon: FiUsers,
          tone: 'primary',
        },
        {
          label: 'Pending Reviews',
          value: assignedInterns?.stats?.pendingReviews ?? 0,
          icon: FiCheckCircle,
          tone: (assignedInterns?.stats?.pendingReviews ?? 0) > 0 ? 'warning' : 'neutral',
        },
        {
          label: 'Documents',
          value: documents?.length ?? 0,
          icon: FiFileText,
          tone: 'neutral',
        },
      ]
    : [
        {
          label: 'Skills',
          value: skills?.length ?? 0,
          icon: FiTrendingUp,
          tone: 'primary',
        },
        {
          label: 'Documents',
          value: documents?.length ?? 0,
          icon: FiFileText,
          tone: 'neutral',
        },
        {
          label: 'Achievements',
          value: achievements?.length ?? 0,
          icon: FiAward,
          tone: (achievements?.length ?? 0) > 0 ? 'warning' : 'neutral',
        },
        {
          label: 'Progress',
          value: `${internship?.completionPercentage ?? 0}%`,
          icon: FiCheckCircle,
          tone: (internship?.completionPercentage ?? 0) >= 80 ? 'success' : 'primary',
          sub: internship?.status ?? null,
        },
      ];

  return (
    <div className="profile-glance-strip" aria-label="Profile at a glance">
      {metrics.map((metric) => (
        <Metric key={metric.label} {...metric} />
      ))}
    </div>
  );
};

export default ProfileAtAGlance;
