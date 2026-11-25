import { useRef, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { mfaSetup, mfaEnable } from '../services/api';

const input = 'block w-full px-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium';

const MfaSetup = () => {
  const { user, loading: authLoading, applyToken, logout } = useAuth();
  const navigate = useNavigate();
  const [setup, setSetup] = useState(null);      // { secret, qr } once started
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const finished = useRef(false);            // set while we are about to go to the dashboard ourselves

  if (authLoading) return null;
  if (!user) return <Navigate to="/login" />;
  if (user.mfaEnabled && !finished.current) return <Navigate to="/security" />;

  const required = user.role === 'restaurant';
  const home = user.role === 'restaurant' ? '/restaurant/dashboard' : '/dashboard';

  const start = async () => {
    setError(''); setBusy(true);
    try {
      const { data } = await mfaSetup();
      setSetup(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not start the setup');
    } finally { setBusy(false); }
  };

  const finish = async (e) => {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      const { data } = await mfaEnable({ code: code.trim() });
      finished.current = true;
      await applyToken(data.token);         // swap the limited token for a full one
      navigate(home);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not turn on two-step sign-in');
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-center py-12 px-4">
      <div className="mx-auto w-full max-w-md bg-white rounded-3xl border border-stone-100 shadow-xl shadow-stone-200/50 p-8 text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mb-4"><ShieldCheck size={28} /></div>
        <h1 className="text-2xl font-extrabold text-stone-900">Set up two-step sign-in</h1>
        <p className="mt-2 text-sm text-stone-500">
          {required
            ? 'Restaurant accounts need an authenticator app before they can manage menus and orders.'
            : 'Add a second step to your sign-in with an authenticator app (Google Authenticator, Microsoft Authenticator, Authy).'}
        </p>

        {error && <div className="mt-5 bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100 font-medium" role="alert">{error}</div>}

        {!setup ? (
          <div className="mt-6 space-y-3">
            <button onClick={start} disabled={busy} className="w-full flex justify-center items-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 transition-all disabled:opacity-70">
              Start setup <ArrowRight size={18} />
            </button>
            {!required && <Link to={home} className="block text-sm font-semibold text-stone-500 hover:text-stone-700">Not now</Link>}
          </div>
        ) : (
          <form onSubmit={finish} className="mt-6 space-y-4">
            <p className="text-sm text-stone-600">Scan this QR code with your authenticator app, then type the 6-digit code it shows. Two-step sign-in only turns on after the code is checked.</p>
            <img src={setup.qr} alt="QR code for your authenticator app" className="mx-auto w-52 h-52 rounded-2xl border border-stone-200 p-2 bg-white" />
            <div>
              <p className="text-xs text-stone-500 mb-1">Can't scan? Enter this key by hand:</p>
              <code className="block break-all rounded-xl bg-stone-50 border border-dashed border-stone-300 px-3 py-2 text-sm font-bold tracking-widest text-stone-800">{setup.secret.match(/.{1,4}/g).join(' ')}</code>
            </div>
            <input type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={8} required value={code} onChange={(e) => setCode(e.target.value)} className={`${input} text-center text-xl tracking-[0.4em]`} placeholder="000000" />
            <button type="submit" disabled={busy} className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 transition-all disabled:opacity-70">Verify and turn on</button>
          </form>
        )}

        <button onClick={logout} className="mt-6 text-xs font-semibold text-stone-400 hover:text-stone-600">Sign out</button>
      </div>
    </div>
  );
};

export default MfaSetup;
