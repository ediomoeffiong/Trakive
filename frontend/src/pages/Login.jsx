import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import {
  RiMailLine,
  RiLockPasswordLine,
  RiEyeLine,
  RiEyeOffLine,
  RiArrowRightLine,
  RiShieldCheckLine,
  RiUser3Line,
  RiBuildingLine,
  RiTeamLine,
  RiBriefcaseLine,
} from 'react-icons/ri';
import toast from 'react-hot-toast';

import { useAppStore } from '../store/useAppStore';
import { ROUTES } from '../constants';
import { DEFAULT_MOCK_PASSWORD } from '../data/mockUsers';
import {
  AuthCard,
  AuthHeader,
  Input,
  Button,
  ErrorMessage,
} from '../components/ui';

import { getRoleDefaultRoute, orgEmailRegisterOptions } from '../utils';

const DEMO_ACCOUNTS = [
  {
    role: 'Intern',
    email: 'intern@thefifthlab.com',
    label: 'Intern',
    icon: RiUser3Line,
    dept: 'FifthLab',
  },
  {
    role: 'Supervisor',
    email: 'supervisor@thefifthlab.com',
    label: 'Supervisor',
    icon: RiBriefcaseLine,
    dept: 'FifthLab',
  },
  {
    role: 'HR Admin',
    email: 'hr@cwg-plc.com',
    label: 'HR Admin',
    icon: RiTeamLine,
    dept: 'HR',
  },
  {
    role: 'Dept Head',
    email: 'head@cwg-plc.com',
    label: 'Dept Head',
    icon: RiBuildingLine,
    dept: 'IT Dept',
  },
];

const isDev = !import.meta.env.PROD || import.meta.env.VITE_ENABLE_MOCK_AUTH === 'true';

const Login = () => {
  const navigate = useNavigate();
  const loginFn = useAppStore((state) => state.login);
  const authError = useAppStore((state) => state.error);
  const authLoading = useAppStore((state) => state.isLoading);
  const clearError = useAppStore((state) => state.clearError);

  const [showPassword, setShowPassword] = useState(false);
  const [selectedDemoRole, setSelectedDemoRole] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const emailValue = watch('email');

  const handleSelectDemo = (account) => {
    clearError();
    setSelectedDemoRole(account.role);
    setValue('email', account.email, { shouldValidate: true });
    setValue('password', DEFAULT_MOCK_PASSWORD, { shouldValidate: true });
    toast.success(`Demo credentials loaded for ${account.label}`);
  };

  const handleApplyDomain = (domain) => {
    const current = (emailValue || '').split('@')[0];
    if (current) {
      setValue('email', `${current}@${domain}`, { shouldValidate: true });
    } else {
      setValue('email', `@${domain}`, { shouldValidate: true });
    }
  };

  const onSubmit = async (data) => {
    try {
      const response = await loginFn({ email: data.email, password: data.password });
      toast.success(`Welcome back, ${response.user.name}!`);
      const defaultRoute = getRoleDefaultRoute(response.user.role);
      navigate(defaultRoute);
    } catch (err) {
      // Store error state handles display.
    }
  };

  return (
    <AuthCard>
      {/* Header */}
      <AuthHeader
        title="Welcome back"
        subtitle="Sign in to your CWG PLC & FifthLab workspace."
      />

      {/* Demo Accounts Quick-Select (Only visible in development/mock environments) */}
      {isDev && (
        <div
          style={{
            marginBottom: '1.25rem',
            padding: '0.75rem',
            borderRadius: '0.75rem',
            backgroundColor: '#f0fbfd',
            border: '1px solid #cffafe',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.5rem',
            }}
          >
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#0077b6',
              }}
            >
              Quick Demo Logins
            </span>
            <span
              style={{
                fontSize: '0.65rem',
                color: '#0891b2',
                fontWeight: 500,
              }}
            >
              Click to auto-fill
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0.375rem',
            }}
          >
            {DEMO_ACCOUNTS.map((account) => {
              const Icon = account.icon;
              const isSelected = selectedDemoRole === account.role;
              return (
                <button
                  key={account.role}
                  type="button"
                  onClick={() => handleSelectDemo(account)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.45rem 0.25rem',
                    borderRadius: '0.5rem',
                    border: isSelected ? '1.5px solid #00b4d8' : '1px solid #e0f2fe',
                    backgroundColor: isSelected ? '#00b4d8' : '#ffffff',
                    color: isSelected ? '#ffffff' : '#0369a1',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    gap: '0.2rem',
                  }}
                  title={`${account.label} (${account.email})`}
                >
                  <Icon size={14} style={{ color: isSelected ? '#ffffff' : '#0096c7' }} />
                  <span style={{ fontSize: '0.68rem', fontWeight: 600, lineHeight: 1 }}>
                    {account.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {authError && <ErrorMessage message={authError} />}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        {/* Email Field */}
        <div>
          <Input
            id="login-email"
            label="Work Email"
            type="email"
            placeholder="name@cwg-plc.com or name@thefifthlab.com"
            leftAddon={<RiMailLine style={{ color: '#0096c7' }} />}
            error={errors.email?.message}
            disabled={authLoading}
            {...register('email', orgEmailRegisterOptions)}
          />

          {/* Quick Domain Autocomplete chips if typing without domain */}
          {emailValue && !emailValue.includes('@') && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                marginTop: '0.35rem',
                fontSize: '0.72rem',
              }}
            >
              <span style={{ color: '#64748b' }}>Domain:</span>
              <button
                type="button"
                onClick={() => handleApplyDomain('thefifthlab.com')}
                style={{
                  padding: '0.15rem 0.45rem',
                  borderRadius: '0.375rem',
                  backgroundColor: '#ecfeff',
                  border: '1px solid #a5f3fc',
                  color: '#0891b2',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.72rem',
                }}
              >
                @thefifthlab.com
              </button>
              <button
                type="button"
                onClick={() => handleApplyDomain('cwg-plc.com')}
                style={{
                  padding: '0.15rem 0.45rem',
                  borderRadius: '0.375rem',
                  backgroundColor: '#ecfeff',
                  border: '1px solid #a5f3fc',
                  color: '#0891b2',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.72rem',
                }}
              >
                @cwg-plc.com
              </button>
            </div>
          )}
        </div>

        {/* Password Field */}
        <div className="relative">
          <Input
            id="login-password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            leftAddon={<RiLockPasswordLine style={{ color: '#0096c7' }} />}
            rightAddon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="cursor-pointer p-1 focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  background: 'none',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#0096c7',
                }}
              >
                {showPassword ? (
                  <RiEyeOffLine size={17} style={{ color: '#0077b6' }} />
                ) : (
                  <RiEyeLine size={17} style={{ color: '#64748b' }} />
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

        {/* Remember Me & Forgot Password */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            marginTop: '0.125rem',
            fontSize: '0.85rem',
          }}
        >
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              userSelect: 'none',
              color: '#475569',
              fontWeight: 500,
            }}
          >
            <input
              type="checkbox"
              style={{
                width: '1rem',
                height: '1rem',
                borderRadius: '0.25rem',
                accentColor: '#00b4d8',
                cursor: 'pointer',
              }}
              {...register('rememberMe')}
            />
            Remember me
          </label>
          <Link
            to={ROUTES.FORGOT_PASSWORD}
            style={{
              color: '#0096c7',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#0077b6')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#0096c7')}
            onClick={clearError}
          >
            Forgot Password?
          </Link>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          size="lg"
          loading={authLoading}
          rightIcon={<RiArrowRightLine size={18} />}
          style={{
            width: '100%',
            marginTop: '0.75rem',
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
          Sign In
        </Button>
      </form>

      {/* Footer Registration Link */}
      <p
        style={{
          marginTop: '1.25rem',
          marginBottom: 0,
          textAlign: 'center',
          fontSize: '0.875rem',
          color: '#64748b',
        }}
      >
        New to Trakive?{' '}
        <Link
          to={ROUTES.REGISTER}
          style={{
            color: '#0096c7',
            fontWeight: 700,
            textDecoration: 'none',
            transition: 'color 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#0077b6')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#0096c7')}
          onClick={clearError}
        >
          Create an Account
        </Link>
      </p>
    </AuthCard>
  );
};

export default Login;


