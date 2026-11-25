import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, KeyRound, History } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { changePassword, mfaDisable, getActivity } from '../services/api';

const input = 'block w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium';
const card = 'bg-white rounded-3xl border border-stone-100 shadow-xl shadow-stone-200/40 p-6 sm:p-8';

// Plain-language names for the log entries (the server sends technical codes)
const LABELS = {
  'user.register': 'Account created',
  'login.success': 'Signed in',
  'login.failure': 'Failed sign-in attempt',
  'account.locked': 'Account locked after too many wrong tries',
  'logout': 'Signed out everywhere',
  'mfa.setup_started': 'Started two-step sign-in setup',
  'mfa.enabled': 'Two-step sign-in turned on',
  'mfa.enable_failed': 'Wrong code during two-step sign-in setup',
  'mfa.disabled': 'Two-step sign-in turned off',
  'mfa.disable_failed': 'Failed attempt to turn off two-step sign-in',
  'password.change': 'Password changed',
  'password.change_failed': 'Failed password change (wrong current password)',
  'password.reset_with_mfa': 'Password reset with the authenticator app',
  'access.denied': 'Blocked from a page you may not use',
  'order.status_change': 'Order status changed',
};

const Security = () => {
  const { user, applyToken } = useAuth();
  const [activity, setActivity] = useState([]);
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwMsg, setPwMsg] = useState({ ok: '', err: '' });
  const [off, setOff] = useState({ password: '', code: '' });
  const [offMsg, setOffMsg] = useState('');

  const loadActivity = () => getActivity().then(({ data }) => setActivity(data.items || [])).catch(() => {});
  useEffect(() => { loadActivity(); }, []);

  const submitPassword = async (e) => {
    e.preventDefault();
    setPwMsg({ ok: '', err: '' });
    if (pw.newPassword !== pw.confirm) return setPwMsg({ ok: '', err: 'Passwords do not match' });
    if (pw.newPassword.length < 8) return setPwMsg({ ok: '', err: 'Password must be at least 8 characters' });
    if (!/[A-Za-z]/.test(pw.newPassword) || !/\d/.test(pw.newPassword)) return setPwMsg({ ok: '', err: 'Password must contain at least one letter and one number' });
    try {
      const { data } = await changePassword({ currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      await applyToken(data.token);          // all other sessions are signed out; this one gets a new token
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
      setPwMsg({ ok: 'Password changed. Your other sessions were signed out.', err: '' });
      loadActivity();
    } catch (err) {
      setPwMsg({ ok: '', err: err.response?.data?.message || 'Could not change the password' });
    }
  };

  const turnOff = async (e) => {
    e.preventDefault();
    setOffMsg('');
    try {
      const { data } = await mfaDisable({ password: off.password, code: off.code.trim() });
      await applyToken(data.token);
      setOff({ password: '', code: '' });
      loadActivity();
    } catch (err) {
      setOffMsg(err.response?.data?.message || 'Could not turn off two-step sign-in');
    }
  };

  const required = user.role === 'restaurant';

  return (
    <div className="min-h-screen bg-stone-50 py-10 px-4">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-3xl font-extrabold text-stone-900">Security</h1>

        {/* Two-step sign-in */}
        <section className={card}>
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${user.mfaEnabled ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-600'}`}>
              {user.mfaEnabled ? <ShieldCheck size={24} /> : <ShieldAlert size={24} />}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-stone-900">Two-step sign-in is {user.mfaEnabled ? 'on' : 'off'}</h2>
              <p className="text-sm text-stone-500 mt-1">
                {user.mfaEnabled
                  ? 'Signing in needs your password and a code from your authenticator app.'
                  : 'Add a code from an authenticator app to protect your account even if your password leaks.'}
              </p>
              {required && user.mfaEnabled && <p className="text-sm text-stone-500 mt-2">Restaurant accounts must keep this on.</p>}

              {!user.mfaEnabled && (
                <Link to="/mfa-setup" className="inline-block mt-4 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-orange-600 hover:bg-orange-700">Turn on</Link>
              )}

              {user.mfaEnabled && !required && (
                <form onSubmit={turnOff} className="mt-4 space-y-3 max-w-sm">
                  {offMsg && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100 font-medium" role="alert">{offMsg}</div>}
                  <input type="password" required autoComplete="current-password" maxLength={128} value={off.password} onChange={(e) => setOff({ ...off, password: e.target.value })} className={input} placeholder="Your password" />
                  <input type="text" required inputMode="numeric" autoComplete="one-time-code" maxLength={8} value={off.code} onChange={(e) => setOff({ ...off, code: e.target.value })} className={input} placeholder="6-digit code" />
                  <button type="submit" className="px-5 py-2.5 rounded-xl text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100">Turn off</button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* Change password */}
        <section className={card}>
          <div className="flex items-center gap-3 mb-4"><KeyRound className="text-orange-600" size={22} /><h2 className="text-lg font-bold text-stone-900">Change password</h2></div>
          <form onSubmit={submitPassword} className="space-y-3 max-w-sm">
            {pwMsg.err && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100 font-medium" role="alert">{pwMsg.err}</div>}
            {pwMsg.ok && <div className="bg-green-50 text-green-700 text-sm p-3 rounded-xl border border-green-100 font-medium" role="status">{pwMsg.ok}</div>}
            <input type="password" required autoComplete="current-password" maxLength={128} value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} className={input} placeholder="Current password" />
            <input type="password" required autoComplete="new-password" maxLength={128} value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} className={input} placeholder="New password (8+ characters, a letter and a number)" />
            <input type="password" required autoComplete="new-password" maxLength={128} value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} className={input} placeholder="Repeat the new password" />
            <button type="submit" className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-orange-600 hover:bg-orange-700">Change password</button>
          </form>
        </section>

        {/* Recent activity */}
        <section className={card}>
          <div className="flex items-center gap-3 mb-4"><History className="text-orange-600" size={22} /><h2 className="text-lg font-bold text-stone-900">Recent security activity</h2></div>
          {activity.length === 0 ? (
            <p className="text-sm text-stone-500">Nothing yet.</p>
          ) : (
            <ul className="divide-y divide-stone-100">
              {activity.map((a) => (
                <li key={a.id} className="py-3 flex items-start justify-between gap-4">
                  <div>
                    <p className={`text-sm font-semibold ${a.success ? 'text-stone-800' : 'text-red-600'}`}>{LABELS[a.action] || a.action}</p>
                    <p className="text-xs text-stone-400 mt-0.5">{new Date(a.timestamp).toLocaleString()}{a.ip ? ` · ${a.ip}` : ''}</p>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full ${a.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{a.success ? 'OK' : 'Failed'}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};

export default Security;
