/**
 * @file PersonalInfoForm.jsx
 * @description Editable personal information form.
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useProfileStore } from '../../store/useProfileStore';

const GENDERS = ['', 'Male', 'Female', 'Non-binary', 'Prefer not to say'];

const Field = ({ label, value }) => (
  <div
    style={{
      background: 'var(--color-neutral-50)',
      border: '1px solid var(--color-neutral-200)',
      borderRadius: '0.625rem',
      padding: '0.75rem 1rem',
    }}
  >
    <p style={{ fontSize: '0.73rem', color: 'var(--color-neutral-500)', fontWeight: 700, marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
      {label}
    </p>
    <p style={{ fontSize: '0.9rem', color: 'var(--color-neutral-800)', fontWeight: 500 }}>
      {value || '-'}
    </p>
  </div>
);

const FormField = ({ label, id, error, children }) => (
  <div>
    <label htmlFor={id} style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.375rem' }}>
      {label}
    </label>
    {children}
    {error && (
      <p style={{ fontSize: '0.75rem', color: 'var(--color-danger-600)', marginTop: '0.25rem' }}>
        {error}
      </p>
    )}
  </div>
);

const PersonalInfoForm = () => {
  const { profile, updateProfile, savingProfile } = useProfileStore();
  const [editing, setEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm();

  useEffect(() => {
    if (profile) {
      reset({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        phone: profile.phone || '',
        jobTitle: profile.jobTitle || '',
        department: profile.department || '',
        dateOfBirth: profile.dateOfBirth || '',
        gender: profile.gender || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        country: profile.country || '',
        bio: profile.bio || '',
      });
    }
  }, [profile, reset, editing]);

  const onSubmit = async (data) => {
    try {
      await updateProfile({
        ...data,
        fullName: `${data.firstName} ${data.lastName}`.trim(),
      });
      toast.success('Profile information updated successfully!');
      setEditing(false);
    } catch {
      toast.error('Failed to save changes. Please try again.');
    }
  };

  const handleCancel = () => {
    reset();
    setEditing(false);
  };

  const inputStyle = {
    width: '100%',
    padding: '0.625rem 0.875rem',
    border: '1.5px solid var(--color-neutral-200)',
    borderRadius: '0.625rem',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
    background: '#fff',
    color: 'var(--color-neutral-800)',
    outline: 'none',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  };

  const inputErrorStyle = { ...inputStyle, borderColor: 'var(--color-danger-400)' };

  return (
    <div className="card p-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0 }}>Personal Information</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-neutral-500)', margin: 0 }}>
            Manage your personal details and professional identity
          </p>
        </div>
        {!editing && (
          <button className="btn btn-outline btn-sm" onClick={() => setEditing(true)} id="edit-personal-info-btn">
            Edit Profile
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!editing ? (
          <motion.div
            key="view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}
          >
            <Field label="First Name" value={profile?.firstName} />
            <Field label="Last Name" value={profile?.lastName} />
            <Field label="Email" value={profile?.email} />
            <Field label="Phone" value={profile?.phone} />
            <Field label="Job Title" value={profile?.jobTitle || profile?.role} />
            <Field label="Department" value={profile?.department} />
            <Field label="Date of Birth" value={profile?.dateOfBirth} />
            <Field label="Gender" value={profile?.gender} />
            <Field label="Address" value={profile?.address} />
            <Field label="City" value={profile?.city} />
            <Field label="State" value={profile?.state} />
            <Field label="Country" value={profile?.country} />
            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Bio" value={profile?.bio} />
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="edit"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit(onSubmit)}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <FormField label="First Name" id="firstName" error={errors.firstName?.message}>
                <input id="firstName" style={errors.firstName ? inputErrorStyle : inputStyle} placeholder="First name" {...register('firstName', { required: 'First name is required' })} />
              </FormField>
              <FormField label="Last Name" id="lastName" error={errors.lastName?.message}>
                <input id="lastName" style={errors.lastName ? inputErrorStyle : inputStyle} placeholder="Last name" {...register('lastName', { required: 'Last name is required' })} />
              </FormField>
              <FormField label="Email Address" id="email" error={errors.email?.message}>
                <input
                  id="email"
                  type="email"
                  style={errors.email ? inputErrorStyle : inputStyle}
                  placeholder="you@example.com"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' },
                  })}
                />
              </FormField>
              <FormField label="Phone Number" id="phone" error={errors.phone?.message}>
                <input
                  id="phone"
                  type="tel"
                  style={errors.phone ? inputErrorStyle : inputStyle}
                  placeholder="+234 800 000 0000"
                  {...register('phone', {
                    pattern: { value: /^[+\d\s\-()]{7,20}$/, message: 'Invalid phone number' },
                  })}
                />
              </FormField>
              <FormField label="Job Title" id="jobTitle" error={errors.jobTitle?.message}>
                <input id="jobTitle" style={inputStyle} placeholder="Job title" {...register('jobTitle')} />
              </FormField>
              <FormField label="Department" id="department" error={errors.department?.message}>
                <input id="department" style={inputStyle} placeholder="Department" {...register('department')} />
              </FormField>
              <FormField label="Date of Birth" id="dateOfBirth" error={errors.dateOfBirth?.message}>
                <input id="dateOfBirth" type="date" style={inputStyle} {...register('dateOfBirth')} />
              </FormField>
              <FormField label="Gender (optional)" id="gender">
                <select id="gender" style={inputStyle} {...register('gender')}>
                  {GENDERS.map((g) => (
                    <option key={g} value={g}>{g || 'Prefer not to say'}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Address" id="address">
                <input id="address" style={inputStyle} placeholder="Address line" {...register('address')} />
              </FormField>
              <FormField label="City" id="city">
                <input id="city" style={inputStyle} placeholder="City" {...register('city')} />
              </FormField>
              <FormField label="State / Province" id="state">
                <input id="state" style={inputStyle} placeholder="State" {...register('state')} />
              </FormField>
              <FormField label="Country" id="country" error={errors.country?.message}>
                <input id="country" style={inputStyle} placeholder="Country" {...register('country')} />
              </FormField>
            </div>

            <FormField label="Professional Bio" id="bio" error={errors.bio?.message}>
              <textarea
                id="bio"
                rows={3}
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                placeholder="Tell us about your background and focus..."
                {...register('bio', {
                  maxLength: { value: 500, message: 'Bio must be 500 characters or fewer' },
                })}
              />
            </FormField>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleCancel} disabled={savingProfile}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary btn-sm" disabled={savingProfile || !isDirty} id="save-personal-info-btn">
                {savingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div
        style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '0.625rem',
          padding: '1rem 1.25rem',
        }}
      >
        <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: '#334155' }}>
          System Role & Administrative Permissions Locked
        </p>
        <p style={{ margin: '0.2rem 0 0', fontSize: '0.8125rem', color: '#64748b' }}>
          Role: <strong>{profile?.role || 'Intern'}</strong> ({profile?.employeeId || 'ID pending'}). Self-service editing of roles and system access permissions is locked for security. Contact HR Administration to request role modification.
        </p>
      </div>
    </div>
  );
};

export default PersonalInfoForm;
