/**
 * @file SelfAssessmentForm.jsx
 * @description React Hook Form–based self-assessment form with rating sliders,
 * textarea fields, validation, and animated success state.
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { RiCheckboxCircleLine, RiSendPlane2Line, RiLoader4Line } from 'react-icons/ri';
import { selfAssessmentDefaults } from '../../data/selfAssessmentTemplate';

// ── Rating Slider ──────────────────────────────────────────────────────────────

const RATING_LABELS = ['', 'Poor', 'Below Avg', 'Fair', 'Fair+', 'Average', 'Good', 'Very Good', 'Great', 'Excellent', 'Outstanding'];

const RatingInput = ({ id, label, description, register, watch, error }) => {
  const value = watch(id);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
        <label htmlFor={id} style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-800)' }}>
          {label}
        </label>
        <span
          style={{
            fontSize: '0.8125rem',
            fontWeight: 700,
            color: value >= 8 ? 'var(--color-success-600)' : value >= 6 ? 'var(--color-primary-600)' : 'var(--color-warning-600)',
          }}
        >
          {value} / 10 — {RATING_LABELS[value]}
        </span>
      </div>
      {description && (
        <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', margin: '0 0 0.5rem' }}>{description}</p>
      )}
      <input
        id={id}
        type="range"
        min={1}
        max={10}
        step={1}
        {...register(id, { required: 'Rating is required', valueAsNumber: true })}
        style={{
          width: '100%',
          accentColor: 'var(--color-primary-600)',
          cursor: 'pointer',
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--color-neutral-400)', marginTop: '0.15rem' }}>
        <span>1 — Poor</span>
        <span>10 — Outstanding</span>
      </div>
      {error && (
        <p style={{ fontSize: '0.75rem', color: 'var(--color-danger-500)', margin: '0.25rem 0 0' }}>{error.message}</p>
      )}
    </div>
  );
};

// ── Textarea Field ─────────────────────────────────────────────────────────────

const TextareaField = ({ id, label, description, placeholder, register, error, minLength }) => (
  <div>
    <label htmlFor={id} style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-800)', marginBottom: '0.375rem' }}>
      {label}
    </label>
    {description && (
      <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', margin: '0 0 0.5rem' }}>{description}</p>
    )}
    <textarea
      id={id}
      placeholder={placeholder}
      rows={4}
      {...register(id, {
        required: `${label} is required`,
        minLength: minLength ? { value: minLength, message: `Please write at least ${minLength} characters` } : undefined,
      })}
      style={{
        width: '100%',
        padding: '0.75rem',
        borderRadius: '0.625rem',
        border: error ? '1.5px solid var(--color-danger-500)' : '1.5px solid var(--color-border)',
        fontSize: '0.875rem',
        color: 'var(--color-neutral-800)',
        background: 'var(--color-background)',
        resize: 'vertical',
        fontFamily: 'inherit',
        lineHeight: 1.6,
        outline: 'none',
        transition: 'border-color 0.15s ease',
        boxSizing: 'border-box',
      }}
      onFocus={(e) => { if (!error) e.currentTarget.style.borderColor = 'var(--color-primary-500)'; }}
      onBlur={(e) => { if (!error) e.currentTarget.style.borderColor = 'var(--color-border)'; }}
    />
    {error && (
      <p style={{ fontSize: '0.75rem', color: 'var(--color-danger-500)', margin: '0.25rem 0 0' }}>{error.message}</p>
    )}
  </div>
);

// ── Success State ─────────────────────────────────────────────────────────────

const SuccessState = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.4, type: 'spring', stiffness: 300, damping: 25 }}
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      padding: '3rem 2rem',
      gap: '1rem',
    }}
  >
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 20 }}
      style={{
        width: '5rem',
        height: '5rem',
        borderRadius: '50%',
        background: 'var(--color-success-50)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '2.5rem',
        color: 'var(--color-success-500)',
      }}
    >
      <RiCheckboxCircleLine />
    </motion.div>
    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-neutral-900)', margin: 0 }}>
      Self-Assessment Submitted!
    </h3>
    <p style={{ fontSize: '0.9rem', color: 'var(--color-neutral-500)', maxWidth: '24rem', lineHeight: 1.65, margin: 0 }}>
      Your self-assessment has been recorded. Your supervisor will review it alongside their evaluation. Great job taking this step in your growth!
    </p>
    <div
      style={{
        fontSize: '0.8125rem',
        color: 'var(--color-success-700)',
        background: 'var(--color-success-50)',
        border: '1px solid var(--color-success-200)',
        padding: '0.625rem 1.25rem',
        borderRadius: '0.625rem',
        marginTop: '0.5rem',
      }}
    >
      ✓ Submitted successfully — review status updated to Scheduled
    </div>
  </motion.div>
);

// ── Main Component ─────────────────────────────────────────────────────────────

const SelfAssessmentForm = ({ reviewId, onSubmit, submitting, submitted }) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: selfAssessmentDefaults });

  const handleFormSubmit = (data) => {
    onSubmit(reviewId, data);
  };

  if (submitted) return <SuccessState />;

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit(handleFormSubmit)}
      noValidate
      style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}
    >
      {/* Intro */}
      <div
        style={{
          padding: '1rem 1.25rem',
          borderRadius: '0.75rem',
          background: 'var(--color-primary-50)',
          border: '1px solid var(--color-primary-100)',
          fontSize: '0.8125rem',
          color: 'var(--color-primary-700)',
          lineHeight: 1.6,
        }}
      >
        📝 <strong>Before your supervisor's evaluation,</strong> share your own perspective on your performance this period.
        Your self-assessment is a key part of the review process.
      </div>

      {/* Rating section */}
      <div>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-neutral-700)', margin: '0 0 1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Self-Ratings
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <RatingInput
            id="productivityRating"
            label="Productivity"
            description="How effectively did you complete your assigned tasks this period?"
            register={register}
            watch={watch}
            error={errors.productivityRating}
          />
          <RatingInput
            id="communicationRating"
            label="Communication"
            description="How well did you communicate with your team and stakeholders?"
            register={register}
            watch={watch}
            error={errors.communicationRating}
          />
          <RatingInput
            id="teamworkRating"
            label="Teamwork"
            description="How effectively did you collaborate with team members?"
            register={register}
            watch={watch}
            error={errors.teamworkRating}
          />
          <RatingInput
            id="initiativeRating"
            label="Initiative"
            description="How proactively did you go beyond your assigned responsibilities?"
            register={register}
            watch={watch}
            error={errors.initiativeRating}
          />
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid var(--color-border)' }} />

      {/* Narrative section */}
      <div>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-neutral-700)', margin: '0 0 1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Reflection
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <TextareaField
            id="overallReflection"
            label="Overall Reflection"
            description="Share your overall thoughts on your performance this period."
            placeholder="Reflect on your overall experience, growth, and areas of focus..."
            register={register}
            error={errors.overallReflection}
            minLength={50}
          />
          <TextareaField
            id="achievements"
            label="Key Achievements"
            description="List your most significant accomplishments this period."
            placeholder="- Achievement 1&#10;- Achievement 2&#10;- Achievement 3"
            register={register}
            error={errors.achievements}
          />
          <TextareaField
            id="challenges"
            label="Challenges Faced"
            description="What were the main challenges you encountered and how did you address them?"
            placeholder="Describe the challenges and how you responded to them..."
            register={register}
            error={errors.challenges}
          />
          <TextareaField
            id="nextGoals"
            label="Goals for Next Period"
            description="What specific goals do you want to focus on in the next review period?"
            placeholder="- Goal 1: ...&#10;- Goal 2: ...&#10;- Goal 3: ..."
            register={register}
            error={errors.nextGoals}
          />
        </div>
      </div>

      {/* Submit */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
        <button
          type="submit"
          disabled={submitting}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.75rem',
            borderRadius: '0.625rem',
            background: submitting ? 'var(--color-neutral-300)' : 'var(--color-primary-600)',
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.9rem',
            border: 'none',
            cursor: submitting ? 'not-allowed' : 'pointer',
            transition: 'background 0.15s ease, transform 0.1s ease',
          }}
          onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.background = 'var(--color-primary-700)'; }}
          onMouseLeave={(e) => { if (!submitting) e.currentTarget.style.background = 'var(--color-primary-600)'; }}
        >
          {submitting ? (
            <>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{ display: 'inline-flex' }}
              >
                <RiLoader4Line />
              </motion.span>
              Submitting...
            </>
          ) : (
            <>
              <RiSendPlane2Line />
              Submit Self-Assessment
            </>
          )}
        </button>
      </div>
    </motion.form>
  );
};

export default SelfAssessmentForm;
