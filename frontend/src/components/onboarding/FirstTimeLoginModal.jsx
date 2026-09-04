import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  RiSparklingLine,
  RiCheckboxMultipleLine,
  RiUser3Line,
  RiArrowRightLine,
  RiCloseLine,
  RiCheckboxCircleLine
} from 'react-icons/ri';
import { useAppStore } from '../../store/useAppStore';
import { ROUTES } from '../../constants';

export const FirstTimeLoginModal = () => {
  const navigate = useNavigate();
  const user = useAppStore((state) => state.user);
  const dismissFirstLoginPrompt = useAppStore((state) => state.dismissFirstLoginPrompt);

  if (!user || !user.isFirstLogin) {
    return null;
  }

  const firstName = user.name ? user.name.split(' ')[0] : 'Intern';
  const hasOnboardingDone = Boolean(user.hasCompletedOnboarding);
  const hasProfileDone = Boolean(user.profileCompleted);

  const handleGoToOnboarding = () => {
    dismissFirstLoginPrompt();
    navigate(ROUTES.ONBOARDING);
  };

  const handleGoToProfile = () => {
    dismissFirstLoginPrompt();
    navigate(ROUTES.PROFILE);
  };

  const handleDismiss = () => {
    dismissFirstLoginPrompt();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(6px)' }}
          onClick={handleDismiss}
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ type: 'spring', damping: 24, stiffness: 300 }}
          style={{
            position: 'relative',
            zIndex: 10,
            width: '100%',
            maxWidth: '520px',
            borderRadius: '1.25rem',
            background: '#ffffff',
            padding: '1.75rem',
            boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
            border: '1px solid var(--color-neutral-100)',
            color: 'var(--color-neutral-900)'
          }}
        >
          {/* Close button */}
          <button
            onClick={handleDismiss}
            style={{
              position: 'absolute', top: '1.25rem', right: '1.25rem',
              width: '2rem', height: '2rem', borderRadius: '50%',
              border: 'none', background: 'var(--color-neutral-100)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--color-neutral-500)'
            }}
            aria-label="Close modal"
          >
            <RiCloseLine style={{ fontSize: '1.25rem' }} />
          </button>

          {/* Icon Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1rem' }}>
            <div style={{
              width: '3rem', height: '3rem', borderRadius: '0.875rem',
              background: 'var(--color-primary-50)', border: '1px solid var(--color-primary-100)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <RiSparklingLine style={{ fontSize: '1.5rem', color: 'var(--color-primary-600)' }} />
            </div>
            <div>
              <span style={{
                fontSize: '0.675rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em',
                color: 'var(--color-primary-700)', background: 'var(--color-primary-100)',
                padding: '0.15rem 0.5rem', borderRadius: '99px', display: 'inline-block'
              }}>
                Welcome to Trakive 👋
              </span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0.25rem 0 0 0', color: 'var(--color-neutral-900)' }}>
                Hi {firstName}, let's get you set up!
              </h2>
            </div>
          </div>

          <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-600)', lineHeight: 1.6, margin: '0 0 1.25rem 0' }}>
            Your account is ready. To get full access to Trakive features and prepare for your assigned tasks, please finish your onboarding checklist and complete your profile details.
          </p>

          {/* Action Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '1.25rem' }}>
            {/* Onboarding Action Card */}
            <div style={{
              padding: '1rem', borderRadius: '0.875rem',
              border: `1px solid ${hasOnboardingDone ? 'var(--color-success-200)' : 'var(--color-neutral-200)'}`,
              background: hasOnboardingDone ? 'var(--color-success-50)' : 'var(--color-neutral-50)'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div style={{
                  width: '2.25rem', height: '2.25rem', borderRadius: '0.625rem',
                  background: hasOnboardingDone ? '#dcfce7' : '#e0e7ff',
                  color: hasOnboardingDone ? '#15803d' : '#4338ca',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  {hasOnboardingDone ? <RiCheckboxCircleLine style={{ fontSize: '1.1rem' }} /> : <RiCheckboxMultipleLine style={{ fontSize: '1.1rem' }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0, color: 'var(--color-neutral-900)' }}>
                      Finish Onboarding Checklist
                    </h3>
                    {hasOnboardingDone && (
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#15803d', background: '#dcfce7', padding: '0.1rem 0.4rem', borderRadius: '99px' }}>
                        Completed
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--color-neutral-500)', margin: '0.25rem 0 0 0', lineHeight: 1.4 }}>
                    Submit identity documents, NDA agreements, and review company handbook & policies.
                  </p>
                </div>
              </div>
              <button
                onClick={handleGoToOnboarding}
                style={{
                  marginTop: '0.75rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
                  padding: '0.5rem 0.875rem', borderRadius: '0.625rem',
                  background: 'var(--color-primary-600)', color: '#ffffff',
                  fontWeight: 600, fontSize: '0.78rem', border: 'none', cursor: 'pointer'
                }}
              >
                {hasOnboardingDone ? 'Review Onboarding' : 'Complete Onboarding Checklist'} <RiArrowRightLine />
              </button>
            </div>

            {/* Profile Action Card */}
            <div style={{
              padding: '1rem', borderRadius: '0.875rem',
              border: `1px solid ${hasProfileDone ? 'var(--color-success-200)' : 'var(--color-neutral-200)'}`,
              background: hasProfileDone ? 'var(--color-success-50)' : 'var(--color-neutral-50)'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div style={{
                  width: '2.25rem', height: '2.25rem', borderRadius: '0.625rem',
                  background: hasProfileDone ? '#dcfce7' : '#fef3c7',
                  color: hasProfileDone ? '#15803d' : '#b45309',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  {hasProfileDone ? <RiCheckboxCircleLine style={{ fontSize: '1.1rem' }} /> : <RiUser3Line style={{ fontSize: '1.1rem' }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0, color: 'var(--color-neutral-900)' }}>
                      Complete Profile Details
                    </h3>
                    {hasProfileDone && (
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#15803d', background: '#dcfce7', padding: '0.1rem 0.4rem', borderRadius: '99px' }}>
                        Completed
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--color-neutral-500)', margin: '0.25rem 0 0 0', lineHeight: 1.4 }}>
                    Add your contact information, bio, institution, skills, and profile photo.
                  </p>
                </div>
              </div>
              <button
                onClick={handleGoToProfile}
                style={{
                  marginTop: '0.75rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
                  padding: '0.5rem 0.875rem', borderRadius: '0.625rem',
                  background: 'var(--color-neutral-900)', color: '#ffffff',
                  fontWeight: 600, fontSize: '0.78rem', border: 'none', cursor: 'pointer'
                }}
              >
                {hasProfileDone ? 'Update Profile Settings' : 'Complete Profile Details'} <RiArrowRightLine />
              </button>
            </div>
          </div>

          {/* Dismiss CTA */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--color-neutral-100)' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-neutral-400)' }}>
              You can access these anytime from navigation.
            </span>
            <button
              onClick={handleDismiss}
              style={{
                fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-neutral-500)',
                background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem 0.5rem'
              }}
            >
              Remind Me Later
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default FirstTimeLoginModal;
