/**
 * @file PasswordStrength.jsx
 * @description Dynamic password strength meter & criteria checklist.
 */

import { useMemo } from 'react';
import { FiCheck, FiX } from 'react-icons/fi';

const PasswordStrength = ({ password = '' }) => {
  const criteria = useMemo(() => {
    return [
      { id: 'length', text: 'At least 8 characters', met: password.length >= 8 },
      { id: 'uppercase', text: 'At least one uppercase letter (A-Z)', met: /[A-Z]/.test(password) },
      { id: 'lowercase', text: 'At least one lowercase letter (a-z)', met: /[a-z]/.test(password) },
      { id: 'number', text: 'At least one number (0-9)', met: /[0-9]/.test(password) },
      { id: 'special', text: 'At least one special character (!@#$%^&*)', met: /[^A-Za-z0-9]/.test(password) },
    ];
  }, [password]);

  const score = useMemo(() => {
    if (!password) return 0;
    return criteria.filter((c) => c.met).length;
  }, [password, criteria]);

  const strengthInfo = useMemo(() => {
    if (!password) return { text: 'Empty', color: 'var(--color-neutral-300)', width: '0%', status: '' };
    if (score <= 2) return { text: 'Weak', color: 'var(--color-danger-500)', width: '25%', status: 'weak' };
    if (score === 3) return { text: 'Fair', color: 'var(--color-warning-500)', width: '50%', status: 'fair' };
    if (score === 4) return { text: 'Good', color: 'var(--color-primary-500)', width: '75%', status: 'good' };
    return { text: 'Strong', color: 'var(--color-success-500)', width: '100%', status: 'strong' };
  }, [password, score]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem', width: '100%' }}>
      {/* Strength Bar */}
      {password && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-neutral-500)' }}>
              Password Strength:
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: strengthInfo.color }}>
              {strengthInfo.text}
            </span>
          </div>
          <div
            style={{
              height: '6px',
              backgroundColor: 'var(--color-neutral-200)',
              borderRadius: '99px',
              overflow: 'hidden',
              width: '100%',
            }}
          >
            <div
              style={{
                height: '100%',
                width: strengthInfo.width,
                backgroundColor: strengthInfo.color,
                transition: 'all 0.3s ease',
              }}
            />
          </div>
        </div>
      )}

      {/* Criteria Checklist */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        {criteria.map((item) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.75rem',
              color: item.met ? 'var(--color-success-700)' : 'var(--color-neutral-500)',
              transition: 'color 0.2s ease',
            }}
          >
            {item.met ? (
              <FiCheck style={{ color: 'var(--color-success-500)', flexShrink: 0 }} />
            ) : (
              <FiX style={{ color: 'var(--color-neutral-300)', flexShrink: 0 }} />
            )}
            <span style={{ textDecoration: item.met ? 'none' : 'none' }}>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordStrength;
