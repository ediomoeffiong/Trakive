import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FiArrowLeft, FiEye, FiEyeOff, FiLock, FiMail } from 'react-icons/fi';
import toast from 'react-hot-toast';

import { useAppStore } from '../store/useAppStore';
import { ROUTES } from '../constants';
import { orgEmailRegisterOptions } from '../utils';
import { passwordRegisterOptions } from '../utils/passwordPolicy';
import { AuthCard, AuthHeader, Button, ErrorMessage, Input, PasswordStrength } from '../components/ui';

const ActivateAccount = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const activateExisting = useAppStore((state) => state.activateExisting);
  const authError = useAppStore((state) => state.error);
  const authLoading = useAppStore((state) => state.isLoading);
  const clearError = useAppStore((state) => state.clearError);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    mode: 'onChange',
    defaultValues: {
      email: searchParams.get('email') || '',
      password: '',
      confirmPassword: '',
    },
  });
  const password = watch('password');

  const onSubmit = async (values) => {
    try {
      const response = await activateExisting({ email: values.email, password: values.password });
      toast.success(response.message);
      navigate(`${ROUTES.VERIFY_EMAIL}?email=${encodeURIComponent(values.email)}&activation=1`);
    } catch {
      // Store error state handles display.
    }
  };

  return (
    <AuthCard>
      <AuthHeader
        title="Activate your existing account"
        subtitle="Keep your current Trakive profile, role, and records. Create a production password and verify your work email once."
      />

      {authError && <ErrorMessage message={authError} />}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <Input
          id="activation-email"
          label="Existing work email"
          type="email"
          placeholder="name@cwg-plc.com or name@thefifthlab.com"
          leftAddon={<FiMail style={{ color: '#0096c7' }} />}
          error={errors.email?.message}
          disabled={authLoading}
          {...register('email', orgEmailRegisterOptions)}
        />

        <Input
          id="activation-password"
          label="New production password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Create a strong password"
          leftAddon={<FiLock style={{ color: '#0096c7' }} />}
          rightAddon={(
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              style={{ border: 0, background: 'none', display: 'flex', color: '#64748b', cursor: 'pointer' }}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          )}
          error={errors.password?.message}
          disabled={authLoading}
          {...register('password', passwordRegisterOptions)}
        />

        <PasswordStrength password={password || ''} />

        <Input
          id="activation-confirm-password"
          label="Confirm password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Enter the password again"
          leftAddon={<FiLock style={{ color: '#0096c7' }} />}
          error={errors.confirmPassword?.message}
          disabled={authLoading}
          {...register('confirmPassword', {
            required: 'Please confirm your password',
            validate: (value) => value === password || 'Passwords do not match',
          })}
        />

        <Button type="submit" size="lg" loading={authLoading} style={{ width: '100%' }}>
          Send activation email
        </Button>
      </form>

      <p style={{ margin: '1rem 0 0', textAlign: 'center', fontSize: '0.85rem' }}>
        <Link to={ROUTES.LOGIN} onClick={clearError} style={{ color: '#64748b', fontWeight: 600, textDecoration: 'none' }}>
          <FiArrowLeft style={{ verticalAlign: 'middle', marginRight: '0.35rem' }} /> Back to sign in
        </Link>
      </p>
    </AuthCard>
  );
};

export default ActivateAccount;
