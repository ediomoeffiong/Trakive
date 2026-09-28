import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { RiAlertLine, RiCheckLine, RiEyeLine, RiEyeOffLine, RiShieldCheckLine, RiTimeLine } from 'react-icons/ri';
import { useSettingsStore } from '../../store/useSettingsStore';
import Input from '../ui/Input';
import Button from '../ui/Button';
import PasswordStrength from '../ui/PasswordStrength';
import { passwordRegisterOptions } from '../../utils/passwordPolicy';

const relative = (value) => {
  if (!value || Number.isNaN(new Date(value).getTime())) return 'Not available';
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)} days ago`;
  return new Date(value).toLocaleDateString();
};

const eventLabel = (type) => ({
  USER_LOGIN: 'Successful login', USER_LOGIN_FAILED: 'Failed login attempt',
  PASSWORD_CHANGED: 'Password changed', TWO_FACTOR_ENABLED: 'Two-factor authentication enabled',
  TWO_FACTOR_DISABLED: 'Two-factor authentication disabled', SESSION_REVOKED: 'Session revoked',
}[type] || String(type || 'Security activity').replaceAll('_', ' ').toLowerCase());

const deviceName = (ua = '') => {
  const browser = /edg/i.test(ua) ? 'Edge' : /chrome/i.test(ua) ? 'Chrome' : /firefox/i.test(ua) ? 'Firefox' : /safari/i.test(ua) ? 'Safari' : 'Browser';
  const os = /windows/i.test(ua) ? 'Windows' : /mac os|macintosh/i.test(ua) ? 'macOS' : /android/i.test(ua) ? 'Android' : /iphone|ipad/i.test(ua) ? 'iOS' : 'Unknown device';
  return `${browser} on ${os}`;
};

const Section = ({ title, description, children }) => (
  <section className="card" style={{ padding: '1.75rem', display: 'grid', gap: '1.25rem' }}>
    <div style={{ borderBottom: '1px solid var(--color-neutral-100)', paddingBottom: '1rem' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.25rem', color: 'var(--color-neutral-900)' }}>{title}</h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)', margin: 0 }}>{description}</p>
    </div>
    {children}
  </section>
);

const ChangePassword = () => {
  const { changePassword, changingPassword, settings } = useSettingsStore();
  const [visible, setVisible] = useState({});
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();
  const newPassword = watch('newPassword', '');
  const addon = (name) => <button type="button" onClick={() => setVisible((v) => ({ ...v, [name]: !v[name] }))}
    aria-label={visible[name] ? 'Hide password' : 'Show password'} style={{ border: 0, background: 'none', color: 'var(--color-neutral-400)', cursor: 'pointer', display: 'flex' }}>
    {visible[name] ? <RiEyeOffLine /> : <RiEyeLine />}</button>;
  const submit = async (data) => {
    try {
      await changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      reset(); toast.success('Password changed. Your other sessions have been signed out.');
    } catch (error) { toast.error(error.message); }
  };
  return <Section title="Password" description="Change your password using your current credentials.">
    <div style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-500)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <RiTimeLine /> Last changed: {relative(settings.security.lastPasswordChange)}
    </div>
    <form onSubmit={handleSubmit(submit)} style={{ display: 'grid', gap: '1rem' }}>
      <Input id="currentPassword" label="Current password" type={visible.current ? 'text' : 'password'} rightAddon={addon('current')}
        error={errors.currentPassword?.message} {...register('currentPassword', { required: 'Current password is required' })} />
      <Input id="newPassword" label="New password" type={visible.new ? 'text' : 'password'} rightAddon={addon('new')}
        error={errors.newPassword?.message} {...register('newPassword', passwordRegisterOptions)} />
      <PasswordStrength password={newPassword} />
      <Input id="confirmPassword" label="Confirm new password" type={visible.confirm ? 'text' : 'password'} rightAddon={addon('confirm')}
        error={errors.confirmPassword?.message} {...register('confirmPassword', { required: 'Confirm your new password', validate: (v) => v === newPassword || 'Passwords do not match' })} />
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}><Button type="submit" loading={changingPassword}>Update password</Button></div>
    </form>
  </Section>;
};

const TwoFactor = () => {
  const { settings, saving, beginTwoFactorSetup, confirmTwoFactorSetup, disableTwoFactor } = useSettingsStore();
  const [setup, setSetup] = useState(null);
  const [code, setCode] = useState('');
  const enabled = settings.security.twoFactorEnabled;
  const start = async () => { try { setSetup(await beginTwoFactorSetup()); setCode(''); } catch (error) { toast.error(error.message); } };
  const confirm = async () => { try { await confirmTwoFactorSetup(code); setSetup(null); setCode(''); toast.success('Two-factor authentication enabled.'); } catch (error) { toast.error(error.message); } };
  const disable = async () => { try { await disableTwoFactor(code); setCode(''); toast.success('Two-factor authentication disabled.'); } catch (error) { toast.error(error.message); } };
  const codeInput = (id) => <Input id={id} label="Authentication code" value={code}
    onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" />;
  return <Section title="Two-factor authentication" description="Require a time-based code from an authenticator app when you sign in.">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <RiShieldCheckLine size={26} style={{ color: enabled ? 'var(--color-success-600)' : 'var(--color-neutral-400)' }} />
        <div><strong>{enabled ? 'Protected with an authenticator app' : 'Not enabled'}</strong>
          <p style={{ margin: '0.2rem 0 0', color: 'var(--color-neutral-500)', fontSize: '0.8125rem' }}>
            {enabled ? `Enabled ${relative(settings.security.twoFactorEnabledAt)}` : 'Works with any standards-based TOTP authenticator app.'}
          </p>
        </div>
      </div>
      {!enabled && !setup && <Button type="button" onClick={start} loading={saving}>Set up authenticator</Button>}
    </div>
    {setup && <div style={{ padding: '1rem', border: '1px solid var(--color-primary-200)', borderRadius: '0.75rem', display: 'grid', gap: '1rem' }}>
      <p style={{ margin: 0, fontSize: '0.875rem' }}>Scan the QR code, or enter the setup key manually, then verify the current 6-digit code.</p>
      <img src={setup.qrCodeDataUrl} alt="Authenticator setup QR code" width="200" height="200" style={{ maxWidth: '100%' }} />
      <code style={{ overflowWrap: 'anywhere', padding: '0.75rem', background: 'var(--color-neutral-50)', borderRadius: '0.5rem' }}>{setup.secret}</code>
      {codeInput('twoFactorConfirm')}
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
        <Button type="button" variant="secondary" onClick={() => { setSetup(null); setCode(''); }}>Cancel</Button>
        <Button type="button" onClick={confirm} loading={saving} disabled={code.length !== 6}>Verify and enable</Button>
      </div>
    </div>}
    {enabled && <div style={{ padding: '1rem', border: '1px solid var(--color-neutral-200)', borderRadius: '0.75rem', display: 'grid', gap: '0.75rem' }}>
      <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-neutral-600)' }}>Enter a current authenticator code to disable this protection.</p>
      {codeInput('twoFactorDisable')}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}><Button type="button" variant="danger" onClick={disable} loading={saving} disabled={code.length !== 6}>Disable two-factor</Button></div>
    </div>}
  </Section>;
};

const SecurityEvents = () => {
  const { securityEvents, loadingSecurityEvents, fetchSecurityEvents, error } = useSettingsStore();
  useEffect(() => { fetchSecurityEvents(1).catch(() => {}); }, [fetchSecurityEvents]);
  return <Section title="Recent security activity" description="Account security events recorded by Trakive.">
    {loadingSecurityEvents && <p style={{ color: 'var(--color-neutral-500)' }}>Loading security activity…</p>}
    {!loadingSecurityEvents && error && securityEvents.length === 0 && <p style={{ color: 'var(--color-danger-600)' }}>{error}</p>}
    {!loadingSecurityEvents && !error && securityEvents.length === 0 && <p style={{ color: 'var(--color-neutral-500)' }}>No security activity has been recorded yet.</p>}
    {securityEvents.map((event) => {
      const danger = event.type === 'USER_LOGIN_FAILED';
      return <div key={event.id} style={{ display: 'flex', gap: '0.875rem', padding: '0.875rem', border: '1px solid var(--color-neutral-100)', borderRadius: '0.75rem' }}>
        <div style={{ color: danger ? 'var(--color-danger-600)' : 'var(--color-primary-600)' }}>{danger ? <RiAlertLine size={20} /> : <RiCheckLine size={20} />}</div>
        <div><strong style={{ fontSize: '0.875rem' }}>{eventLabel(event.type)}</strong>
          <p style={{ margin: '0.2rem 0', fontSize: '0.8125rem', color: 'var(--color-neutral-500)' }}>{deviceName(event.userAgent)} · {event.ip}</p>
          <small style={{ color: 'var(--color-neutral-400)' }}>{relative(event.timestamp)}</small>
        </div>
      </div>;
    })}
  </Section>;
};

const SecuritySettingsForm = () => <div style={{ display: 'grid', gap: '1.5rem' }}>
  <ChangePassword /><TwoFactor /><SecurityEvents />
</div>;

export default SecuritySettingsForm;
