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
      await forgotFn(data.email);
      setSubmittedEmail(data.email);
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
          <Link to={ROUTES.RESET_PASSWORD} className="w-full no-underline">
            <Button size="lg" style={{ width: '100%' }}>
              Proceed to Reset Password (Mock)
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
          placeholder="e.g. alex@company.com"
          leftAddon={<FiMail className="text-neutral-400" />}
          error={errors.email?.message}
          disabled={authLoading}
          {...register('email', {
            required: 'Email address is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address format',
            },
          })}
        />

        <Button
          type="submit"
          size="lg"
          loading={authLoading}
          rightIcon={<FiSend />}
          style={{ width: '100%', marginTop: '0.5rem' }}
        >
          Send Recovery Link
        </Button>
      </form>

      <p className="text-center text-sm text-neutral-500 mt-6 mb-0">
        Remembered your details?{' '}
        <Link
          to={ROUTES.LOGIN}
          className="text-primary-600 hover:text-primary-700 font-semibold no-underline flex items-center justify-center gap-1 mt-1"
          onClick={clearError}
        >
          <FiArrowLeft size={14} /> Back to Sign In
        </Link>
      </p>
    </AuthCard>
  );
};

export default ForgotPassword;
