import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { RiMailLine, RiLockPasswordLine, RiEyeLine, RiEyeOffLine } from 'react-icons/ri';
import toast from 'react-hot-toast';

import { useAppStore } from '../store/useAppStore';
import { ROUTES } from '../constants';
import { mockUsers, DEFAULT_MOCK_PASSWORD } from '../data/mockUsers';
import {
  AuthCard,
  AuthHeader,
  Input,
  Button,
  ErrorMessage,
  DividerWithText,
} from '../components/ui';

const Login = () => {
  const navigate = useNavigate();
  const loginFn = useAppStore((state) => state.login);
  const authError = useAppStore((state) => state.error);
  const authLoading = useAppStore((state) => state.isLoading);
  const clearError = useAppStore((state) => state.clearError);

  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data) => {
    try {
      const response = await loginFn({ email: data.email, password: data.password });
      toast.success(`Welcome back, ${response.user.name}!`);
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      // Store error state handles display.
    }
  };

  const handleQuickLogin = (email) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', DEFAULT_MOCK_PASSWORD, { shouldValidate: true });
    clearError();
    handleSubmit(onSubmit)();
  };

  return (
    <AuthCard>
      <AuthHeader
        title="Welcome back"
        subtitle="Sign in to continue tracking tasks, goals, and onboarding milestones."
      />

      {authError && <ErrorMessage message={authError} />}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <Input
          id="login-email"
          label="Work Email"
          type="email"
          placeholder="e.g. alex@company.com"
          leftAddon={<RiMailLine className="text-neutral-400" />}
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

        <div className="relative">
          <Input
            id="login-password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            leftAddon={<RiLockPasswordLine className="text-neutral-400" />}
            rightAddon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="cursor-pointer p-1 focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <RiEyeOffLine className="text-neutral-500 hover:text-neutral-800" />
                ) : (
                  <RiEyeLine className="text-neutral-500 hover:text-neutral-800" />
                )}
              </button>
            }
            error={errors.password?.message}
            disabled={authLoading}
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters long',
              },
            })}
          />
        </div>

        <div className="mt-1 flex items-center justify-between gap-4 text-xs sm:text-sm">
          <label className="flex cursor-pointer select-none items-center gap-2 text-neutral-600">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
              {...register('rememberMe')}
            />
            Remember Me
          </label>
          <Link
            to={ROUTES.FORGOT_PASSWORD}
            className="font-semibold text-primary-600 no-underline hover:text-primary-700"
            onClick={clearError}
          >
            Forgot Password?
          </Link>
        </div>

        <Button
          type="submit"
          size="lg"
          loading={authLoading}
          style={{ width: '100%', marginTop: '0.75rem' }}
        >
          Sign In
        </Button>
      </form>

      <DividerWithText>Quick test accounts</DividerWithText>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {mockUsers.map((mUser) => (
          <button
            key={mUser.id}
            type="button"
            onClick={() => handleQuickLogin(mUser.email)}
            disabled={authLoading}
            className="flex min-h-14 cursor-pointer flex-col items-start justify-center rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-left transition duration-200 hover:border-primary-300 hover:bg-primary-50 disabled:opacity-50"
          >
            <span className="block text-xs font-bold leading-tight text-neutral-800">
              {mUser.name}
            </span>
            <span className="mt-1 block text-[10px] leading-tight text-neutral-500">
              {mUser.role} ({mUser.department.split(' ')[0]})
            </span>
          </button>
        ))}
      </div>

      <p className="mb-0 mt-6 text-center text-sm text-neutral-500">
        New to Trakive?{' '}
        <Link
          to={ROUTES.REGISTER}
          className="font-semibold text-primary-600 no-underline hover:text-primary-700"
          onClick={clearError}
        >
          Create an Account
        </Link>
      </p>
    </AuthCard>
  );
};

export default Login;
