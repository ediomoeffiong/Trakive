/**
 * @file ReviewEmptyStates.jsx
 * @description Encouraging empty state components for the Performance Reviews module.
 */

import { motion } from 'framer-motion';
import { RiFileTextLine, RiFileEditLine, RiFeedbackLine, RiFlagLine } from 'react-icons/ri';

const EmptyStateBase = ({ icon: Icon, iconColor, iconBg, title, message, action }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.4 }}
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      padding: '3rem 2rem',
      gap: '1rem',
    }}
  >
    <div
      style={{
        width: '5rem',
        height: '5rem',
        borderRadius: '1.25rem',
        background: iconBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '2.25rem',
        color: iconColor,
        marginBottom: '0.5rem',
      }}
    >
      <Icon />
    </div>
    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-neutral-800)', margin: 0 }}>
      {title}
    </h3>
    <p style={{ fontSize: '0.9rem', color: 'var(--color-neutral-500)', margin: 0, maxWidth: '26rem', lineHeight: 1.65 }}>
      {message}
    </p>
    {action && (
      <div style={{ marginTop: '0.5rem' }}>
        {action}
      </div>
    )}
  </motion.div>
);

export const NoReviewsEmpty = ({ action }) => (
  <EmptyStateBase
    icon={RiFileTextLine}
    iconColor="var(--color-primary-500)"
    iconBg="var(--color-primary-50)"
    title="No Reviews Yet"
    message="Your performance reviews will appear here once your supervisor schedules them. Keep up the great work — your first review is on its way!"
    action={action}
  />
);

export const NoSelfAssessmentEmpty = ({ action }) => (
  <EmptyStateBase
    icon={RiFileEditLine}
    iconColor="var(--color-warning-500)"
    iconBg="var(--color-warning-50)"
    title="Self-Assessment Not Submitted"
    message="Share your perspective before the supervisor evaluation. Your self-assessment helps create a complete picture of your performance this period."
    action={action}
  />
);

export const NoFeedbackEmpty = () => (
  <EmptyStateBase
    icon={RiFeedbackLine}
    iconColor="var(--color-success-500)"
    iconBg="var(--color-success-50)"
    title="Supervisor Feedback Pending"
    message="Your supervisor's feedback will appear here once the evaluation is complete. This usually happens within 2–3 business days of your review date."
  />
);

export const NoGoalsEmpty = () => (
  <EmptyStateBase
    icon={RiFlagLine}
    iconColor="var(--color-purple-500, #8b5cf6)"
    iconBg="var(--color-purple-50, #f5f3ff)"
    title="No Goals Set Yet"
    message="Development goals from your reviews will be tracked here. They help you focus your growth and measure progress over each review period."
  />
);
