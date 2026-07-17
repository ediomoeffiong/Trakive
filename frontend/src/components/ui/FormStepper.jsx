/**
 * @file FormStepper.jsx
 * @description Stepper component to visualize progress in multi-step form sheets.
 */

import { motion } from 'framer-motion';

const FormStepper = ({ currentStep = 1, steps = [] }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        position: 'relative',
        marginBottom: '2rem',
        padding: '0 0.5rem',
      }}
    >
      {/* Connecting Progress Line Background */}
      <div
        style={{
          position: 'absolute',
          top: '18px',
          left: 0,
          right: 0,
          height: '4px',
          backgroundColor: 'var(--color-neutral-200)',
          zIndex: 1,
        }}
      />

      {/* Connecting Active Progress Line */}
      <motion.div
        initial={{ width: '0%' }}
        animate={{
          width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          top: '18px',
          left: 0,
          height: '4px',
          backgroundColor: 'var(--color-primary-600)',
          zIndex: 2,
        }}
      />

      {/* Step Nodes */}
      {steps.map((step, idx) => {
        const stepNum = idx + 1;
        const isActive = stepNum === currentStep;
        const isCompleted = stepNum < currentStep;

        return (
          <div
            key={step}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 3,
              position: 'relative',
              width: '80px',
            }}
          >
            <motion.div
              animate={{
                backgroundColor: isCompleted
                  ? 'var(--color-success-600)'
                  : isActive
                  ? 'var(--color-primary-600)'
                  : '#ffffff',
                borderColor: isCompleted
                  ? 'var(--color-success-600)'
                  : isActive
                  ? 'var(--color-primary-600)'
                  : 'var(--color-neutral-300)',
                color: isCompleted || isActive ? '#ffffff' : 'var(--color-neutral-500)',
              }}
              transition={{ duration: 0.2 }}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: '2px solid',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.875rem',
                boxShadow: isActive ? '0 0 0 4px rgb(37 99 235 / 0.15)' : 'none',
              }}
            >
              {isCompleted ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M13.333 4L5.9997 11.3333L2.66638 8"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                stepNum
              )}
            </motion.div>

            <span
              style={{
                marginTop: '0.5rem',
                fontSize: '0.75rem',
                fontWeight: isActive || isCompleted ? 600 : 500,
                color: isActive
                  ? 'var(--color-neutral-900)'
                  : isCompleted
                  ? 'var(--color-success-700)'
                  : 'var(--color-neutral-400)',
                textAlign: 'center',
                whiteSpace: 'nowrap',
              }}
            >
              {step}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default FormStepper;
