import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, LogIn, Lock, Mail, AlertCircle, Sparkles, User, Hospital, Truck, Shield } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'HOSPITAL') navigate('/hospital/dashboard');
      else if (user.role === 'AMBULANCE_DRIVER') navigate('/driver/dashboard');
      else if (user.role === 'ADMIN') navigate('/admin/dashboard');
      else navigate('/patient/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid login credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setLoading(true);
    try {
      const user = await login(demoEmail, demoPassword);
      if (user.role === 'HOSPITAL') navigate('/hospital/dashboard');
      else if (user.role === 'AMBULANCE_DRIVER') navigate('/driver/dashboard');
      else if (user.role === 'ADMIN') navigate('/admin/dashboard');
      else navigate('/patient/dashboard');
    } catch (err) {
      setError('Demo login failed. Make sure database is seeded.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        
        <Link to="/" className="flex justify-center items-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shadow-lg shadow-red-500/30">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <span className="font-extrabold text-2xl text-white tracking-wide">
            RESCOU <span className="text-red-500">24x7</span>
          </span>
        </Link>

        <h2 className="text-center text-2xl font-extrabold text-white">
          Emergency Health System Login
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400">
          Sign in to access your role-based emergency dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        
        {/* Quick Demo Login Presets */}
        <div className="mb-6 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Quick Demo Login Presets
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('patient@demo.com', 'password123')}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-left transition-colors flex items-center gap-2"
            >
              <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400"><User className="w-3.5 h-3.5" /></div>
              <div>
                <div className="text-xs font-bold text-white">Patient Demo</div>
                <div className="text-[10px] text-slate-400">Robert Chen</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('citygeneral@hospital.com', 'password123')}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-left transition-colors flex items-center gap-2"
            >
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400"><Hospital className="w-3.5 h-3.5" /></div>
              <div>
                <div className="text-xs font-bold text-white">Hospital Demo</div>
                <div className="text-[10px] text-slate-400">City General</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('driver1@ambulance.com', 'password123')}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-left transition-colors flex items-center gap-2"
            >
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400"><Truck className="w-3.5 h-3.5" /></div>
              <div>
                <div className="text-xs font-bold text-white">Driver Demo</div>
                <div className="text-[10px] text-slate-400">John Doe</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('admin@emergency.org', 'admin123')}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-left transition-colors flex items-center gap-2"
            >
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400"><Shield className="w-3.5 h-3.5" /></div>
              <div>
                <div className="text-xs font-bold text-white">Admin Demo</div>
                <div className="text-[10px] text-slate-400">SysAdmin</div>
              </div>
            </button>
          </div>
        </div>

        <div className="glass-card py-8 px-6 shadow-2xl rounded-2xl border border-slate-800">
          
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-red-400 hover:text-red-300">
              Register New Account
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Login;
