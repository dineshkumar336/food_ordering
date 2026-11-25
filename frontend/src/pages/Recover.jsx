import { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import { recoverAccount } from '../services/api';

const input = 'block w-full px-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium';

const Recover = () => {
  const [form, setForm] = useState({ username: '', code: '', newPassword: '', confirm: '' });
  const [error, setError] = useState('');
  const [done, setDone] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.newPassword !== form.confirm) return setError('Passwords do not match');
    if (form.newPassword.length < 8) return setError('Password must be at least 8 characters');
    if (!/[A-Za-z]/.test(form.newPassword) || !/\d/.test(form.newPassword)) return setError('Password must contain at least one letter and one number');
    setBusy(true);
    try {
      const { data } = await recoverAccount({ username: form.username, code: form.code.trim(), newPassword: form.newPassword });
      setDone(data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reset the password');
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-center py-12 px-4">
      <div className="mx-auto w-full max-w-md bg-white rounded-3xl border border-stone-100 shadow-xl shadow-stone-200/50 p-8">
        <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mb-4"><KeyRound size={26} /></div>
        <h1 className="text-2xl font-extrabold text-stone-900">Reset your password</h1>
        <p className="mt-2 text-sm text-stone-500">
          Enter your username and the 6-digit code from your authenticator app. This only works for accounts that have two-step sign-in turned on.
        </p>

        {done ? (
          <div className="mt-6 space-y-4">
            <div className="bg-green-50 text-green-700 text-sm p-4 rounded-xl border border-green-100 font-medium">{done}</div>
            <Link to="/login" className="block text-center py-3.5 rounded-xl text-sm font-bold text-white bg-orange-600 hover:bg-orange-700">Go to sign in</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100 font-medium" role="alert">{error}</div>}
            <input type="text" required autoComplete="username" maxLength={64} value={form.username} onChange={set('username')} className={input} placeholder="Username" />
            <input type="text" required inputMode="numeric" autoComplete="one-time-code" maxLength={8} value={form.code} onChange={set('code')} className={input} placeholder="6-digit authenticator code" />
            <input type="password" required autoComplete="new-password" maxLength={128} value={form.newPassword} onChange={set('newPassword')} className={input} placeholder="New password" />
            <input type="password" required autoComplete="new-password" maxLength={128} value={form.confirm} onChange={set('confirm')} className={input} placeholder="Repeat the new password" />
            <button type="submit" disabled={busy} className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 transition-all disabled:opacity-70">Reset password</button>
            <p className="text-xs text-stone-400">No two-step sign-in on your account? There is no e-mail recovery, so password reset is not available for it.</p>
          </form>
        )}
        <Link to="/login" className="mt-6 block text-center text-sm font-semibold text-stone-500 hover:text-stone-700">Back to sign in</Link>
      </div>
    </div>
  );
};

export default Recover;
