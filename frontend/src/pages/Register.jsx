import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiPhone, FiLock, FiCalendar, FiArrowRight, FiArrowLeft, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

import { useAppStore } from '../store/useAppStore';
import { ROUTES } from '../constants';
import {
  AuthCard,
  AuthHeader,
  Input,
  Button,
  FormStepper,
  ErrorMessage,
  PasswordStrength,
} from '../components/ui';

const Register = () => {
  const navigate = useNavigate();
  const registerFn = useAppStore((state) => state.register);
  const authError = useAppStore((state) => state.error);
  const authLoading = useAppStore((state) => state.isLoading);
  const clearError = useAppStore((state) => state.clearError);

  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      department: '',
      startDate: '',
      endDate: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  });

  const passwordVal = watch('password');

  const handleNext = async () => {
    clearError();
    let fieldsToValidate = [];

    if (step === 1) {
      fieldsToValidate = ['name', 'email', 'phone'];
    } else if (step === 2) {
      fieldsToValidate = ['department', 'startDate', 'endDate'];
    }

    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) {
      setStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrev = () => {
    clearError();
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const onSubmit = async (data) => {
    try {
      const response = await registerFn({
        name: data.name,
        email: data.email,
        department: data.department,
        password: data.password,
      });
      toast.success(response.message || 'Registration successful!');
      navigate(`${ROUTES.VERIFY_EMAIL}?email=${encodeURIComponent(data.email)}`);
    } catch (err) {
      // Store error state handles display.
    }
  };

  return (
    <AuthCard>
      <FormStepper currentStep={step} steps={['Personal', 'Details', 'Security']} />

      <AuthHeader
        title={
          step === 1
            ? 'Personal Details'
            : step === 2
              ? 'Internship Details'
              : 'Security Settings'
        }
        subtitle={
          step === 1
            ? 'Provide your contact information to set up your intern profile.'
            : step === 2
              ? 'Add your assigned department and internship duration.'
              : 'Create a password to keep your dashboard and records secure.'
        }
      />

      {authError && <ErrorMessage message={authError} />}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <Input
              id="reg-name"
              label="Full Name"
              type="text"
              placeholder="e.g. Covenant Effiong"
              leftAddon={<FiUser className="text-neutral-400" />}
              error={errors.name?.message}
              {...register('name', {
                required: 'Full name is required',
                minLength: { value: 3, message: 'Name must be at least 3 characters' },
              })}
            />

            <Input
              id="reg-email"
              label="Work Email"
              type="email"
              placeholder="e.g. covenant@company.com"
              leftAddon={<FiMail className="text-neutral-400" />}
              error={errors.email?.message}
              {...register('email', {
                required: 'Email address is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address format',
                },
              })}
            />

            <Input
              id="reg-phone"
              label="Phone Number"
              type="tel"
              placeholder="e.g. +1 555-0199"
              leftAddon={<FiPhone className="text-neutral-400" />}
              error={errors.phone?.message}
              {...register('phone', {
                required: 'Phone number is required',
                pattern: {
                  value: /^\+?[0-9\s\-()]{7,18}$/,
                  message: 'Please enter a valid phone number',
                },
              })}
            />
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label
                htmlFor="reg-dept"
                style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-neutral-700)' }}
              >
                Department
              </label>
              <select
                id="reg-dept"
                className={`input-field ${errors.department ? 'error' : ''}`}
                style={{ appearance: 'none', backgroundImage: 'none' }}
                {...register('department', { required: 'Please select a department' })}
              >
                <option value="">Select your department...</option>
                <option value="Engineering">Engineering</option>
                <option value="Product & Design">Product & Design</option>
                <option value="People Operations">People Operations</option>
                <option value="Marketing & Sales">Marketing & Sales</option>
                <option value="Finance">Finance</option>
              </select>
              {errors.department && (
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-danger-600)', margin: 0 }}>
                  {errors.department.message}
                </p>
              )}
            </div>

            <Input
              id="reg-start"
              label="Internship Start Date"
              type="date"
              leftAddon={<FiCalendar className="text-neutral-400" />}
              error={errors.startDate?.message}
              {...register('startDate', { required: 'Start date is required' })}
            />

            <Input
              id="reg-end"
              label="Internship End Date"
              type="date"
              leftAddon={<FiCalendar className="text-neutral-400" />}
              error={errors.endDate?.message}
              {...register('endDate', {
                required: 'End date is required',
                validate: (val, formValues) => {
                  if (new Date(val) <= new Date(formValues.startDate)) {
                    return 'End date must be after start date';
                  }
                  return true;
                },
              })}
            />
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-4">
            <Input
              id="reg-password"
              label="Create Password"
              type="password"
              placeholder="••••••••"
              leftAddon={<FiLock className="text-neutral-400" />}
              error={errors.password?.message}
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Password must be at least 8 characters' },
                validate: {
                  upper: (v) => /[A-Z]/.test(v) || 'Must contain at least 1 uppercase letter',
                  lower: (v) => /[a-z]/.test(v) || 'Must contain at least 1 lowercase letter',
                  number: (v) => /[0-9]/.test(v) || 'Must contain at least 1 number',
                  special: (v) => /[^A-Za-z0-9]/.test(v) || 'Must contain at least 1 special character',
                },
              })}
            />

            <Input
              id="reg-confirm"
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              leftAddon={<FiLock className="text-neutral-400" />}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (val) => val === passwordVal || 'Passwords do not match',
              })}
            />

            <PasswordStrength password={passwordVal} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.5rem' }}>
              <label className="flex cursor-pointer select-none items-start gap-2.5 text-xs text-neutral-600">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  {...register('acceptTerms', { required: 'You must accept the terms and privacy policy' })}
                />
                <span>
                  I accept the Trakive{' '}
                  <Link to="#" className="font-semibold text-primary-600 no-underline hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="#" className="font-semibold text-primary-600 no-underline hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
              {errors.acceptTerms && (
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-danger-600)', margin: '0.25rem 0 0 1.5rem' }}>
                  {errors.acceptTerms.message}
                </p>
              )}
            </div>
          </div>
        )}

        <div style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem' }}>
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={handlePrev}
              leftIcon={<FiArrowLeft />}
              disabled={authLoading}
              style={{ flex: 1 }}
            >
              Back
            </Button>
          )}

          {step < totalSteps ? (
            <Button
              type="button"
              onClick={handleNext}
              rightIcon={<FiArrowRight />}
              style={{ flex: 1 }}
            >
              Continue
            </Button>
          ) : (
            <Button
              type="submit"
              loading={authLoading}
              rightIcon={<FiCheck />}
              style={{ flex: 1 }}
            >
              Register
            </Button>
          )}
        </div>
      </form>

      <p className="mb-0 mt-6 text-center text-sm text-neutral-500">
        Already have an account?{' '}
        <Link
          to={ROUTES.LOGIN}
          className="font-semibold text-primary-600 no-underline hover:text-primary-700"
          onClick={clearError}
        >
          Sign In
        </Link>
      </p>
    </AuthCard>
  );
};

export default Register;
