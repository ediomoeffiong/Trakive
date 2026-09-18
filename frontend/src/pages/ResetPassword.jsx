/**
 * @file ResetPassword.jsx
 * @description Page to reset user password with strength checking and matching validations.
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useSearchParams } from 'react-router-dom';
import { FiLock, FiArrowLeft, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

import { useAppStore } from '../store/useAppStore';
import { ROUTES } from '../constants';
import { passwordRegisterOptions } from '../utils/passwordPolicy';
import {
  AuthCard,
  AuthHeader,
  Input,
  Button,
  ErrorMessage,
  PasswordStrength,
  SuccessMessage,
} from '../components/ui';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const resetFn = useAppStore((state) => state.resetPassword);
  const authError = useAppStore((state) => state.error);
  const authLoading = useAppStore((state) => state.isLoading);
  const clearError = useAppStore((state) => state.clearError);

  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
  });

  const passwordVal = watch('password');
  const resetEmail = searchParams.get('email') || '';
  const resetToken = searchParams.get('token') || '';

  const onSubmit = async (data) => {
    try {
      await resetFn({ password: data.password, email: resetEmail, token: resetToken });
      setIsSuccess(true);
      toast.success('Password updated successfully!');
    } catch (err) {
      // Handled in store error state
    }
  };

  if (isSuccess) {
    return (
      <AuthCard>
        <SuccessMessage
          title="Password Updated"
          message="Your account credentials have been successfully secured. You can now use your new password to access Trakive."
        >
          <Link to={ROUTES.LOGIN} className="w-full no-underline">
            <Button size="lg" style={{ width: '100%' }}>
              Sign In to Workspace
            </Button>
          </Link>
        </SuccessMessage>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <AuthHeader
        title="Set New Password"
        subtitle="Please create a robust password that meets safety specifications for account validation."
      />

      {authError && <ErrorMessage message={authError} />}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        {/* New Password */}
        <Input
          id="reset-password"
          label="New Password"
          type="password"
          placeholder="••••••••"
          leftAddon={<FiLock className="text-neutral-400" />}
          error={errors.password?.message}
          disabled={authLoading}
          {...register('password', passwordRegisterOptions)}
        />

        {/* Confirm Password */}
        <Input
          id="reset-confirm"
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          leftAddon={<FiLock className="text-neutral-400" />}
          error={errors.confirmPassword?.message}
          disabled={authLoading}
          {...register('confirmPassword', {
            required: 'Please confirm your new password',
            validate: (val) => val === passwordVal || 'Passwords do not match',
          })}
        />

        {/* Dynamic Strength Indicators */}
        <PasswordStrength password={passwordVal} />

        <Button
          type="submit"
          size="lg"
          loading={authLoading}
          rightIcon={<FiCheck />}
          style={{ width: '100%', marginTop: '0.75rem' }}
        >
          Reset Password
        </Button>
      </form>

      <p className="text-center text-sm text-neutral-500 mt-6 mb-0">
        <Link
          to={ROUTES.LOGIN}
          className="text-neutral-500 hover:text-neutral-700 font-semibold no-underline flex items-center justify-center gap-2"
          onClick={clearError}
        >
          <FiArrowLeft /> Back to Login
        </Link>
      </p>
    </AuthCard>
  );
};

export default ResetPassword;
