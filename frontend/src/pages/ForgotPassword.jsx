/**
 * @file ForgotPassword.jsx
 * @description Collects the user's email to simulate sending reset instructions.
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { FiMail, FiArrowLeft, FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';

import { useAppStore } from '../store/useAppStore';
import { ROUTES } from '../constants';
import { orgEmailRegisterOptions } from '../utils';
import {
  AuthCard,
  AuthHeader,
  Input,
  Button,
  ErrorMessage,
  SuccessMessage,
} from '../components/ui';

const ForgotPassword = () => {
  const forgotFn = useAppStore((state) => state.forgotPassword);
  const authError = useAppStore((state) => state.error);
  const authLoading = useAppStore((state) => state.isLoading);
  const clearError = useAppStore((state) => state.clearError);

  const [submittedEmail, setSubmittedEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
  });

  const onSubmit = async (data) => {
    try {
      const response = await forgotFn(data.email);
      setSubmittedEmail(data.email);
      setResetToken(response?.resetToken || '');
      setIsSuccess(true);
      toast.success('Instructions sent to your email!');
    } catch (err) {
      // Handled in store error state
    }
  };

  if (isSuccess) {
    return (
      <AuthCard>
        <SuccessMessage
          title="Reset link sent"
          message={`We have sent secure password reset instructions and a verification link to ${submittedEmail}. Please check your inbox.`}
        >
          <Link
            to={`${ROUTES.RESET_PASSWORD}?email=${encodeURIComponent(submittedEmail)}${resetToken ? `&token=${encodeURIComponent(resetToken)}` : ''}`}
            className="w-full no-underline"
          >
            <Button size="lg" style={{ width: '100%' }}>
              Proceed to Reset Password
            </Button>
          </Link>
          <Link
            to={ROUTES.LOGIN}
            className="text-neutral-500 hover:text-neutral-700 text-sm font-semibold text-center mt-2 no-underline flex items-center justify-center gap-2"
          >
            <FiArrowLeft /> Back to Login
          </Link>
        </SuccessMessage>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <AuthHeader
        title="Forgot Password?"
        subtitle="No worries, it happens. Enter your email below to receive a secure recovery link."
      />

      {authError && <ErrorMessage message={authError} />}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <Input
          id="forgot-email"
          label="Work Email"
          type="email"
          placeholder="name@cwg-plc.com or name@thefifthlab.com"
          leftAddon={<FiMail style={{ color: '#0096c7' }} />}
          error={errors.email?.message}
          disabled={authLoading}
          {...register('email', orgEmailRegisterOptions)}
        />

        <Button
          type="submit"
          size="lg"
          loading={authLoading}
          rightIcon={<FiSend />}
          style={{
            width: '100%',
            marginTop: '0.5rem',
            background: 'linear-gradient(135deg, #00b4d8 0%, #0096c7 100%)',
            border: 'none',
            boxShadow: '0 4px 14px rgba(0, 180, 216, 0.35)',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.95rem',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.625rem',
          }}
        >
          Send Recovery Link
        </Button>
      </form>

      <p
        style={{
          marginTop: '1.25rem',
          marginBottom: 0,
          textAlign: 'center',
          fontSize: '0.875rem',
          color: '#64748b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.375rem',
          flexWrap: 'wrap',
        }}
      >
        <span>Remembered your details?</span>
        <Link
          to={ROUTES.LOGIN}
          style={{
            color: '#0096c7',
            fontWeight: 700,
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            transition: 'color 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#0077b6')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#0096c7')}
          onClick={clearError}
        >
          <FiArrowLeft size={14} /> Back to Sign In
        </Link>
      </p>
    </AuthCard>
  );
};

export default ForgotPassword;
