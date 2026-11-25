import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Store, Lock, Eye, EyeOff, UserCircle, Phone, ArrowRight, AtSign } from 'lucide-react';

const Register = () => {
  const [role, setRole] = useState('user');
  const [formData, setFormData] = useState({
    name: '', username: '', password: '', confirmPassword: '', phone: '',
    restaurantName: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    // Same rules as the server (the server is the one that enforces them)
    if (!/^[A-Za-z0-9_.-]{3,32}$/.test(formData.username)) {
      return setError('Username must be 3 to 32 characters: letters, numbers, dot, dash or underscore');
    }
    if (formData.password.length < 8) {
      return setError('Password must be at least 8 characters');
    }
    if (!/[A-Za-z]/.test(formData.password) || !/\d/.test(formData.password)) {
      return setError('Password must contain at least one letter and one number');
    }

    setLoading(true);
    try {
      const data = { name: formData.name, username: formData.username, password: formData.password, phone: formData.phone, role };
      if (role === 'restaurant') data.restaurantName = formData.restaurantName;

      const response = await register(data);
      if (response && response.success) {
        // No e-mail step: sign in right away. Restaurant owners continue to two-step sign-in setup.
        const result = await login({ username: formData.username, password: formData.password, role });
        navigate(result.scope === 'mfa_setup' ? '/mfa-setup' : role === 'restaurant' ? '/restaurant/dashboard' : '/dashboard');
      } else {
        setError('Registration failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { id: 'user', label: 'Customer', icon: User },
    { id: 'restaurant', label: 'Restaurant', icon: Store }
  ];

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[500px] h-[500px] rounded-full bg-orange-100/50 blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] rounded-full bg-yellow-100/50 blur-3xl -z-10" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md animate-fade-in-up">
        <h2 className="mt-6 text-center text-4xl font-extrabold text-stone-900 tracking-tight">
          Create Account
        </h2>
        <p className="mt-2 text-center text-sm text-stone-500">
          Join BiteBay today
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="bg-white py-8 px-4 shadow-2xl shadow-stone-200/50 sm:rounded-3xl sm:px-10 border border-stone-100">
          
          {/* Role Selector */}
          <div className="flex p-1 bg-stone-100 rounded-2xl mb-8">
            {roles.map((r) => {
              const Icon = r.icon;
              const isActive = role === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-xl transition-all ${
                    isActive 
                      ? 'bg-white text-orange-600 shadow-sm border border-stone-200/50' 
                      : 'text-stone-500 hover:text-stone-700 hover:bg-stone-200/50'
                  }`}
                >
                  <Icon size={16} /> <span className="hidden sm:inline">{r.label}</span>
                </button>
              );
            })}
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl border border-red-100 flex items-center gap-2 font-medium animate-fade-in-up">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600" /> {error}
              </div>
            )}

            {role === 'restaurant' && (
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">Restaurant Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400"><Store size={18} /></div>
                  <input type="text" required value={formData.restaurantName} onChange={e => setFormData({...formData, restaurantName: e.target.value})} className="block w-full pl-11 pr-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium" placeholder="Your Restaurant Name" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400"><UserCircle size={18} /></div>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="block w-full pl-11 pr-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium" placeholder="John Doe" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400"><AtSign size={18} /></div>
                <input type="text" required autoComplete="username" maxLength={32} value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="block w-full pl-11 pr-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium" placeholder="3 to 32 characters, no spaces" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400"><Phone size={18} /></div>
                <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="block w-full pl-11 pr-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium" placeholder="+91 98765 43210" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400"><Lock size={18} /></div>
                <input type={showPassword ? 'text' : 'password'} required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="block w-full pl-11 pr-12 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium" placeholder="Min. 8 characters, with a letter and a number" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-stone-400 hover:text-orange-500 transition-colors focus:outline-none">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400"><Lock size={18} /></div>
                <input type={showPassword ? 'text' : 'password'} required value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} className="block w-full pl-11 pr-12 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium" placeholder="Re-enter password" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-orange-600/20 text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5 mt-2"
            >
              {loading ? (
                <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
              ) : (
                <>Create {roles.find(r => r.id === role)?.label} Account <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-stone-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-orange-600 hover:text-orange-500">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
