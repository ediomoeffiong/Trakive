/**
 * @file PersonalInfoForm.jsx
 * @description Editable personal information form with location cascading dropdowns,
 * locked IT administrator fields, gender restrictions, and intern profile change request approval workflow.
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useProfileStore } from '../../store/useProfileStore';
import ContactITModal from './ContactITModal';
import {
  DEFAULT_COUNTRY,
  DEFAULT_STATE,
  DEFAULT_CITY,
  COUNTRIES,
  GENDERS,
  getStatesForCountry,
  getCitiesForState,
} from '../../data/locationData';

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

const formatDate = (value) => {
  if (!value) return '';
  try {
    return new Date(value).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return value;
  }
};

const FormField = ({ label, id, error, children, isLocked, onLockedClick }) => (
  <div style={{ position: 'relative' }}>
    <label htmlFor={id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.375rem' }}>
      <span>{label}</span>
      {isLocked && (
        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#6366f1', background: '#eef2ff', padding: '0.1rem 0.4rem', borderRadius: '0.25rem' }}>
          Locked (IT Admin)
        </span>
      )}
    </label>
    <div onClick={isLocked ? () => onLockedClick?.(label) : undefined} style={{ cursor: isLocked ? 'pointer' : 'default' }}>
      {children}
    </div>
    {error && (
      <p style={{ fontSize: '0.75rem', color: 'var(--color-danger-600)', marginTop: '0.25rem' }}>
        {error}
      </p>
    )}
  </div>
);

const PersonalInfoForm = () => {
  const { profile, updateProfile, submitProfileChangeRequest, savingProfile } = useProfileStore();
  const [editing, setEditing] = useState(false);
  const [itModalOpen, setItModalOpen] = useState(false);
  const [lockedFieldName, setLockedFieldName] = useState('');

  const isSupervisor = profile?.role === 'Supervisor' || profile?.role === 'Admin' || profile?.role === 'supervisor';

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      jobTitle: '',
      department: '',
      dateOfBirth: '',
      gender: 'Male',
      address: '',
      city: DEFAULT_CITY,
      state: DEFAULT_STATE,
      country: DEFAULT_COUNTRY,
      bio: '',
    },
  });

  const selectedCountry = watch('country') || DEFAULT_COUNTRY;
  const selectedState = watch('state') || DEFAULT_STATE;

  const availableStates = getStatesForCountry(selectedCountry);
  const availableCities = getCitiesForState(selectedState, selectedCountry);

  useEffect(() => {
    if (profile) {
      const countryVal = profile.country || DEFAULT_COUNTRY;
      const stateVal = profile.state || DEFAULT_STATE;
      const cityVal = profile.city || DEFAULT_CITY;

      reset({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        phone: profile.phone || '',
        jobTitle: profile.jobTitle || profile.role || '',
        department: profile.department || '',
        dateOfBirth: profile.dateOfBirth || '',
        gender: profile.gender === 'Female' ? 'Female' : 'Male',
        address: profile.address || '',
        city: cityVal,
        state: stateVal,
        country: countryVal,
        bio: profile.bio || '',
      });
    }
  }, [profile, reset, editing]);

  const handleCountryChange = (e) => {
    const newCountry = e.target.value;
    setValue('country', newCountry, { shouldDirty: true });
    const states = getStatesForCountry(newCountry);
    const defaultState = states[0] || '';
    setValue('state', defaultState, { shouldDirty: true });
    const cities = getCitiesForState(defaultState, newCountry);
    setValue('city', cities[0] || '', { shouldDirty: true });
  };

  const handleStateChange = (e) => {
    const newState = e.target.value;
    setValue('state', newState, { shouldDirty: true });
    const cities = getCitiesForState(newState, selectedCountry);
    setValue('city', cities[0] || '', { shouldDirty: true });
  };

  const handleOpenLockedModal = (fieldName) => {
    setLockedFieldName(fieldName);
    setItModalOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      if (isSupervisor) {
        // Direct update for supervisor
        await updateProfile({
          ...data,
          fullName: `${data.firstName} ${data.lastName}`.trim(),
        });
        toast.success('Profile updated successfully!');
        setEditing(false);
      } else {
        // Intern profile change request workflow requiring supervisor approval
        await submitProfileChangeRequest({
          ...data,
          fullName: `${data.firstName} ${data.lastName}`.trim(),
        });
        toast.success('Profile change request submitted to supervisor for approval! Track progress in Onboarding Tab.');
        setEditing(false);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to submit changes. Please try again.');
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

  const lockedInputStyle = {
    ...inputStyle,
    background: '#f8fafc',
    color: '#64748b',
    cursor: 'pointer',
    userSelect: 'none',
  };

  const inputErrorStyle = { ...inputStyle, borderColor: 'var(--color-danger-400)' };

  return (
    <div className="card p-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0 }}>Personal Information</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-neutral-500)', margin: 0 }}>
            Manage your personal details and identity information
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
            <Field label="Date of Birth" value={formatDate(profile?.dateOfBirth)} />
            <Field label="Gender" value={profile?.gender} />
            <Field label="Address" value={profile?.address} />
            <Field label="City" value={profile?.city || DEFAULT_CITY} />
            <Field label="State" value={profile?.state || DEFAULT_STATE} />
            <Field label="Country" value={profile?.country || DEFAULT_COUNTRY} />
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
            {!isSupervisor && (
              <div
                style={{
                  background: '#eff6ff',
                  border: '1.5px solid #bfdbfe',
                  borderRadius: '0.625rem',
                  padding: '0.75rem 1rem',
                  marginBottom: '1.25rem',
                  fontSize: '0.8125rem',
                  color: '#1e40af',
                }}
              >
                ℹ️ <strong>Intern Notice:</strong> Submitting changes will create a <strong>Profile Change Request</strong> sent to your supervisor for review and approval before updates take effect. View status in your <strong>Onboarding Tab</strong>.
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              {/* First Name & Last Name */}
              <FormField label="First Name" id="firstName" error={errors.firstName?.message}>
                <input id="firstName" style={errors.firstName ? inputErrorStyle : inputStyle} placeholder="First name" {...register('firstName', { required: 'First name is required' })} />
              </FormField>
              <FormField label="Last Name" id="lastName" error={errors.lastName?.message}>
                <input id="lastName" style={errors.lastName ? inputErrorStyle : inputStyle} placeholder="Last name" {...register('lastName', { required: 'Last name is required' })} />
              </FormField>

              {/* Locked Field: Email */}
              <FormField label="Email Address" id="email" isLocked onLockedClick={handleOpenLockedModal}>
                <input
                  id="email"
                  type="email"
                  readOnly
                  style={lockedInputStyle}
                  {...register('email')}
                  onClick={() => handleOpenLockedModal('Email Address')}
                />
              </FormField>

              {/* Phone Number */}
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

              {/* Locked Field: Job Title */}
              <FormField label="Job Title" id="jobTitle" isLocked onLockedClick={handleOpenLockedModal}>
                <input
                  id="jobTitle"
                  readOnly
                  style={lockedInputStyle}
                  {...register('jobTitle')}
                  onClick={() => handleOpenLockedModal('Job Title')}
                />
              </FormField>

              {/* Locked Field: Department */}
              <FormField label="Department" id="department" isLocked onLockedClick={handleOpenLockedModal}>
                <input
                  id="department"
                  readOnly
                  style={lockedInputStyle}
                  {...register('department')}
                  onClick={() => handleOpenLockedModal('Department')}
                />
              </FormField>

              {/* Date of Birth */}
              <FormField label="Date of Birth" id="dateOfBirth" error={errors.dateOfBirth?.message}>
                <input id="dateOfBirth" type="date" style={inputStyle} {...register('dateOfBirth', { required: 'Date of birth is required' })} />
              </FormField>

              {/* Gender Dropdown (Male / Female strictly) */}
              <FormField label="Gender" id="gender">
                <select id="gender" style={inputStyle} {...register('gender')}>
                  {GENDERS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </FormField>

              {/* Address */}
              <FormField label="Address" id="address">
                <input id="address" style={inputStyle} placeholder="Address line" {...register('address')} />
              </FormField>

              {/* Country Dropdown (Nigeria Default) */}
              <FormField label="Country" id="country">
                <select
                  id="country"
                  style={inputStyle}
                  value={selectedCountry}
                  onChange={handleCountryChange}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </FormField>

              {/* Cascading State Dropdown */}
              <FormField label="State / Province" id="state">
                <select
                  id="state"
                  style={inputStyle}
                  value={selectedState}
                  onChange={handleStateChange}
                >
                  {availableStates.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </FormField>

              {/* Cascading City Dropdown */}
              <FormField label="City" id="city">
                <select
                  id="city"
                  style={inputStyle}
                  {...register('city')}
                >
                  {availableCities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
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
                {savingProfile ? 'Submitting...' : isSupervisor ? 'Save Changes' : 'Submit Request to Supervisor'}
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
          Role: <strong>{profile?.role || 'Intern'}</strong> ({profile?.employeeId || 'ID pending'}). Job Title, Department, and Email Address can only be modified by system administrators.
        </p>
      </div>

      {/* IT Admin Locked Field Popup Modal */}
      <ContactITModal
        isOpen={itModalOpen}
        onClose={() => setItModalOpen(false)}
        fieldName={lockedFieldName}
      />
    </div>
  );
};

export default PersonalInfoForm;
