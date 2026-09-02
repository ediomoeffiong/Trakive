import { motion } from 'framer-motion';
import {
  FiAward,
  FiBriefcase,
  FiClock,
  FiFileText,
  FiMapPin,
  FiUser,
} from 'react-icons/fi';
import { useProfileStore } from '../../store/useProfileStore';
import ProfileCompletionCard from './ProfileCompletionCard';
import ProfileEmptyState from './ProfileEmptyState';

const formatDate = (str) => {
  if (!str) return null;
  try {
    return new Date(str).toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return str;
  }
};

const timeAgo = (str) => {
  if (!str) return '';
  const diff = Date.now() - new Date(str).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  return formatDate(str);
};

const formatBytes = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const SectionHeading = ({ title, action, onAction }) => (
  <div className="profile-card-heading">
    <h3>{title}</h3>
    {action ? (
      <button className="profile-card-action" type="button" onClick={onAction}>
        {action}
      </button>
    ) : null}
  </div>
);

const InfoRow = ({ label, value, placeholder = 'Not provided' }) => {
  const display = value || null;

  return (
    <div className="profile-info-row">
      <span>{label}</span>
      <strong className={display ? undefined : 'is-empty'}>
        {display ?? placeholder}
      </strong>
    </div>
  );
};

const OverviewCard = ({ title, action, onAction, children, icon: Icon }) => (
  <section className="card profile-overview-card">
    <div className="profile-overview-card-inner">
      <div className="profile-section-title-row">
        {Icon ? (
          <span className="profile-section-icon" aria-hidden="true">
            <Icon />
          </span>
        ) : null}
        <SectionHeading title={title} action={action} onAction={onAction} />
      </div>
      {children}
    </div>
  </section>
);

const SkillChip = ({ skill }) => (
  <div
    className="profile-skill-chip"
    style={{
      '--skill-color': skill.color,
      '--skill-fill': `${skill.percentage}%`,
    }}
  >
    <div>
      <span>{skill.name}</span>
      <strong>{skill.percentage}%</strong>
    </div>
    <span className="profile-skill-track" aria-hidden="true">
      <span />
    </span>
  </div>
);

const ListItem = ({ icon, iconBg, title, description, meta, badge, badgeColor }) => (
  <div className="profile-list-item">
    <span
      className="profile-list-icon"
      style={{ background: iconBg || 'var(--color-neutral-100)' }}
      aria-hidden="true"
    >
      {icon}
    </span>
    <span className="profile-list-copy">
      <strong>{title}</strong>
      {description ? <small>{description}</small> : null}
    </span>
    {badge ? (
      <span
        className="profile-list-badge"
        style={{
          color: badgeColor || 'var(--color-primary-700)',
          background: `${badgeColor || '#2563eb'}14`,
        }}
      >
        {badge}
      </span>
    ) : (
      <span className="profile-list-meta">{meta}</span>
    )}
  </div>
);

const ProfessionalOverview = ({ completion, setActiveTab }) => {
  const {
    profile,
    skills,
    internship,
    achievements,
    activities,
    documents,
    setAvatarModalOpen,
  } = useProfileStore();

  const locationStr = [profile?.city, profile?.state, profile?.country]
    .filter(Boolean)
    .join(', ');
  const internshipDuration =
    internship?.startDate && internship?.endDate
      ? `${formatDate(internship.startDate)} - ${formatDate(internship.endDate)}`
      : null;

  const topSkills = skills.slice(0, 6);
  const recentAchievements = achievements.slice(0, 3);
  const recentActivity = activities.slice(0, 4);
  const recentDocuments = documents.slice(0, 3);
  const internshipProgress = internship?.completionPercentage ?? 0;

  return (
    <div className="profile-overview-shell">
      <div className="overview-grid profile-overview-grid">
        <div className="profile-overview-stack">
          <OverviewCard title="About" action="Edit" onAction={() => setActiveTab('personal')} icon={FiUser}>
            {profile?.bio ? (
              <p className="profile-about-text">{profile.bio}</p>
            ) : (
              <div className="profile-empty-panel">
                <p>No bio added yet.</p>
                <button type="button" onClick={() => setActiveTab('personal')}>
                  Add a short bio
                </button>
              </div>
            )}

            <div className="profile-card-divider" />

            <SectionHeading title="Professional Identity" />
            <div className="profile-info-list">
              <InfoRow label="Role" value={profile?.jobTitle || profile?.role} />
              <InfoRow label="Department" value={profile?.department} />
              <InfoRow label="Organization" value={profile?.organization} />
              <InfoRow label="Location" value={locationStr} />
              <InfoRow label="Supervisor" value={profile?.supervisorName} />
              <InfoRow label="Status" value={profile?.status} />
              <InfoRow label="Employee ID" value={profile?.employeeId} />
            </div>

            <div className="profile-card-divider" />

            <SectionHeading title="Contact" action="Edit" onAction={() => setActiveTab('personal')} />
            <div className="profile-info-list">
              <InfoRow label="Email" value={profile?.email} placeholder="No email set" />
              <InfoRow label="Phone" value={profile?.phone} placeholder="No phone added" />
              <InfoRow
                label="Date of Birth"
                value={profile?.dateOfBirth ? formatDate(profile.dateOfBirth) : null}
              />
            </div>

            <p className="profile-locked-note">
              Role, department, supervisor and employee ID are controlled by HR. Contact HR
              Administration to request changes.
            </p>
          </OverviewCard>

          <ProfileCompletionCard
            completion={completion}
            onActionClick={(key) => {
              const tabMap = {
                avatar: () => setAvatarModalOpen(true),
                personal_info: () => setActiveTab('personal'),
                bio: () => setActiveTab('personal'),
                skills: () => setActiveTab('skills'),
                documents: () => setActiveTab('documents'),
                id_document: () => setActiveTab('documents'),
              };
              tabMap[key]?.();
            }}
          />
        </div>

        <div className="profile-overview-stack">
          <OverviewCard
            title="Internship / Employment"
            action="View details"
            onAction={() => setActiveTab('internship')}
            icon={FiBriefcase}
          >
            <div className="profile-info-list">
              <InfoRow label="Department" value={internship?.department ?? profile?.department} />
              <InfoRow label="Supervisor" value={internship?.supervisor?.name} />
              <InfoRow label="Duration" value={internshipDuration} placeholder="Dates not set" />
              <InfoRow label="Start" value={formatDate(internship?.startDate)} />
              <InfoRow label="End" value={formatDate(internship?.endDate)} />
              <InfoRow label="Location" value={internship?.workLocation} />
            </div>

            {internshipProgress > 0 ? (
              <div className="profile-inline-progress">
                <div>
                  <span>Progress</span>
                  <strong>{internshipProgress}%</strong>
                </div>
                <span className="profile-inline-progress-track">
                  <motion.span
                    initial={{ width: 0 }}
                    animate={{ width: `${internshipProgress}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </span>
              </div>
            ) : null}
          </OverviewCard>

          {topSkills.length > 0 ? (
            <OverviewCard
              title="Top Skills"
              action={skills.length > 6 ? `+${skills.length - 6} more` : 'Manage'}
              onAction={() => setActiveTab('skills')}
              icon={FiAward}
            >
              <div className="skills-overview-grid">
                {topSkills.map((skill) => (
                  <SkillChip key={skill.id} skill={skill} />
                ))}
              </div>
            </OverviewCard>
          ) : null}

          {recentAchievements.length > 0 ? (
            <OverviewCard
              title="Recent Achievements"
              action="View all"
              onAction={() => setActiveTab('achievements')}
              icon={FiAward}
            >
              <div className="profile-list">
                {recentAchievements.map((achievement) => (
                  <ListItem
                    key={achievement.id}
                    icon={achievement.icon}
                    iconBg={achievement.bgColor}
                    title={achievement.title}
                    description={achievement.category}
                    badge={achievement.badge ?? achievement.category}
                    badgeColor={achievement.color}
                  />
                ))}
              </div>
            </OverviewCard>
          ) : null}

          {recentActivity.length > 0 ? (
            <OverviewCard
              title="Recent Activity"
              action="View all"
              onAction={() => setActiveTab('activity')}
              icon={FiClock}
            >
              <div className="profile-list">
                {recentActivity.map((activity) => (
                  <ListItem
                    key={activity.id}
                    icon={activity.icon}
                    iconBg={activity.iconBg}
                    title={activity.title}
                    description={activity.description}
                    meta={timeAgo(activity.timestamp)}
                  />
                ))}
              </div>
            </OverviewCard>
          ) : null}

          {recentDocuments.length > 0 ? (
            <OverviewCard
              title="Recent Documents"
              action="View all"
              onAction={() => setActiveTab('documents')}
              icon={FiFileText}
            >
              <div className="profile-list">
                {recentDocuments.map((doc) => (
                  <ListItem
                    key={doc.id}
                    icon="PDF"
                    iconBg="var(--color-primary-50)"
                    title={doc.displayName ?? doc.name}
                    description={formatBytes(doc.size)}
                    badge={doc.status}
                    badgeColor={doc.statusColor ?? '#10b981'}
                  />
                ))}
              </div>
            </OverviewCard>
          ) : null}
        </div>
      </div>

      {!profile?.bio &&
        skills.length === 0 &&
        achievements.length === 0 &&
        documents.length === 0 &&
        activities.length === 0 && (
          <ProfileEmptyState
            icon={<FiMapPin />}
            title="Your profile is just getting started"
            description="Complete your personal information, add skills, and upload your CV to build a strong professional profile."
            actionLabel="Complete profile"
            onAction={() => setActiveTab('personal')}
          />
        )}
    </div>
  );
};

export default ProfessionalOverview;
