/**
 * @file VerifyEmail.jsx
 * @description Informs users that a verification email was sent, with a resend countdown timer.
 */

import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiArrowLeft, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';

import { useAppStore } from '../store/useAppStore';
import { ROUTES } from '../constants';
import { AuthCard, AuthHeader, Button, ErrorMessage } from '../components/ui';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const targetEmail = searchParams.get('email') || 'your-email@company.com';

  const resendFn = useAppStore((state) => state.resendVerificationEmail);
  const authError = useAppStore((state) => state.error);
  const authLoading = useAppStore((state) => state.isLoading);
  const clearError = useAppStore((state) => state.clearError);

  const [countdown, setCountdown] = useState(60);

  // Countdown clock tick
  useEffect(() => {
    if (countdown === 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const handleResend = async () => {
    try {
      await resendFn(targetEmail);
      toast.success('Verification link resent successfully!');
      setCountdown(60); // Reset countdown
    } catch (err) {
      // Handled in store error state
    }
  };

  return (
    <AuthCard>
      {/* Dynamic Animated Icon container */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
        <motion.div
          animate={{
            y: [0, -6, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '20px',
            backgroundColor: 'var(--color-primary-50)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 25px rgb(37 99 235 / 0.1)',
          }}
        >
          <FiMail size={36} style={{ color: 'var(--color-primary-600)' }} />
        </motion.div>
      </div>

      <AuthHeader
        title="Check your inbox"
        subtitle={`We've sent a secure verification email containing confirmation instructions to: ${targetEmail}`}
      />

      {authError && <ErrorMessage message={authError} />}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
        <Button
          onClick={handleResend}
          disabled={countdown > 0 || authLoading}
          loading={authLoading}
          variant={countdown > 0 ? 'outline' : 'primary'}
          leftIcon={<FiRefreshCw className={authLoading ? 'animate-spin' : ''} />}
          style={{ width: '100%' }}
        >
          {countdown > 0 ? `Resend Verification (${countdown}s)` : 'Resend Verification'}
        </Button>

        <p
          style={{
            textAlign: 'center',
            fontSize: '0.8125rem',
            color: 'var(--color-neutral-400)',
            margin: 0,
          }}
        >
          Can't find the email? Check your spam folder or trigger a new secure link using the resend action.
        </p>

        {/* Back to Login link */}
        <p className="text-center text-sm text-neutral-500 mt-4 mb-0">
          <Link
            to={ROUTES.LOGIN}
            className="text-neutral-500 hover:text-neutral-700 font-semibold no-underline flex items-center justify-center gap-2"
            onClick={clearError}
          >
            <FiArrowLeft /> Back to Login
          </Link>
        </p>
      </div>
    </AuthCard>
  );
};

export default VerifyEmail;
