/**
 * @file index.js
 * @description Barrel export for all Trakive UI components.
 * Import from '@/components/ui' anywhere in the app.
 */

// ── Primitives ────────────────────────────────────────────────────────────────
export { default as Button }           from './Button';
export { default as Card }             from './Card';
export { default as Badge }            from './Badge';
export { default as Input }            from './Input';
export { default as Avatar }           from './Avatar';

// ── Form Controls ─────────────────────────────────────────────────────────────
export { default as Checkbox }         from './Checkbox';
export { default as Radio }            from './Radio';
export { default as Switch }           from './Switch';

// ── Feedback ──────────────────────────────────────────────────────────────────
export { default as Alert }            from './Alert';
export { default as Spinner }          from './Spinner';
export { default as Skeleton }         from './Skeleton';
export { default as ProgressBar }      from './ProgressBar';
export { default as CircularProgress } from './CircularProgress';
export { default as LoadingScreen }    from './LoadingScreen';
export { default as EmptyState }       from './EmptyState';

// ── Overlay / Portals ─────────────────────────────────────────────────────────
export { default as Modal }            from './Modal';
export { default as Drawer }           from './Drawer';
export { default as Tooltip }          from './Tooltip';
export { default as Dropdown }         from './Dropdown';

// ── Layout ────────────────────────────────────────────────────────────────────
export { default as Divider }          from './Divider';
export { default as Breadcrumb }       from './Breadcrumb';
export { default as Pagination }       from './Pagination';
export { default as Accordion }        from './Accordion';

// ── Auth Specific Components ──────────────────────────────────────────────────
export { default as AuthCard }         from './AuthCard';
export { default as AuthHeader }       from './AuthHeader';
export { default as PasswordStrength } from './PasswordStrength';
export { default as FormStepper }      from './FormStepper';
export { default as SuccessMessage }   from './SuccessMessage';
export { default as ErrorMessage }     from './ErrorMessage';
export { default as DividerWithText }  from './DividerWithText';
export { default as SocialProofCard }  from './SocialProofCard';
