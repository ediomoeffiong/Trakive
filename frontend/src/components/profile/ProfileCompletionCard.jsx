import { motion } from 'framer-motion';
import { FiArrowRight, FiCheck, FiCircle } from 'react-icons/fi';

const getTone = (percentage) => {
  if (percentage >= 80) return 'success';
  if (percentage >= 50) return 'warning';
  return 'danger';
};

const ProfileCompletionCard = ({ completion, onActionClick }) => {
  const { percentage = 0, missingItems = [], items = [] } = completion ?? {};
  const tone = getTone(percentage);
  const circumference = 2 * Math.PI * 34;
  const dashOffset = circumference - (circumference * percentage) / 100;
  const nextItem = missingItems[0];

  return (
    <section className="card profile-completion-card">
      <div className="profile-completion-card-inner">
        <div className="profile-completion-card-header">
          <div>
            <h3>Profile Completion</h3>
            <p>
              {missingItems.length === 0
                ? 'Your profile is complete.'
                : `${missingItems.length} item${missingItems.length > 1 ? 's' : ''} remaining`}
            </p>
          </div>
          <span className={`profile-completion-pill profile-completion-pill-${tone}`}>
            {percentage}%
          </span>
        </div>

        <div className="profile-completion-body">
          <div className="profile-completion-ring-wrap" aria-hidden="true">
            <svg width={84} height={84} viewBox="0 0 84 84">
              <circle
                cx={42}
                cy={42}
                r={34}
                fill="none"
                stroke="var(--color-neutral-100)"
                strokeWidth={8}
              />
              <motion.circle
                cx={42}
                cy={42}
                r={34}
                fill="none"
                stroke="currentColor"
                strokeWidth={8}
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: dashOffset }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.15 }}
                style={{ transformOrigin: '42px 42px', transform: 'rotate(-90deg)' }}
              />
            </svg>
            <strong>{percentage}%</strong>
          </div>

          <div className="profile-completion-checklist">
            {items.map((item) => (
              <div
                key={item.key}
                className={`profile-completion-item ${item.done ? 'is-done' : 'is-open'}`}
              >
                <span aria-hidden="true">{item.done ? <FiCheck /> : <FiCircle />}</span>
                <p>{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {nextItem ? (
          <div className="profile-completion-next">
            <div>
              <span>Suggested next step</span>
              <p>{nextItem.label}</p>
            </div>
            <button
              className="btn btn-primary btn-sm"
              type="button"
              onClick={() => onActionClick?.(nextItem.key)}
            >
              Go
              <FiArrowRight aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default ProfileCompletionCard;
