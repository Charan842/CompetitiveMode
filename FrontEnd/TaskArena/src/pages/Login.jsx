import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiZap, FiMail, FiLock, FiArrowRight } from 'react-icons/fi';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'radial-gradient(circle at top left, rgba(255,40,40,0.09), transparent 30%), radial-gradient(circle at bottom right, rgba(180,10,10,0.06), transparent 28%), #080303' }}>
      <div className="w-full max-w-md animate-fadeInUp">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-float shadow-lg shadow-red-500/10">
            <FiZap className="text-red-400" size={30} />
          </div>
          <h1 className="display-title text-2xl sm:text-3xl text-white mb-1">
            Task<span className="text-red-400">Arena</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">Sign in to compete</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-panel-strong rounded-2xl p-6 sm:p-8 space-y-5">
          <div>
            <label className="block text-slate-400 text-xs sm:text-sm mb-1.5 font-medium">Email</label>
            <div className="relative group">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-red-400 transition-colors" size={15} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="futuristic-input w-full rounded-xl pl-10 pr-4 py-2.5 sm:py-3 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 text-xs sm:text-sm mb-1.5 font-medium">Password</label>
            <div className="relative group">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-red-400 transition-colors" size={15} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="futuristic-input w-full rounded-xl pl-10 pr-4 py-2.5 sm:py-3 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="neon-button w-full py-2.5 sm:py-3 rounded-xl transition-all disabled:opacity-50 cursor-pointer hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 text-sm font-bold"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <FiArrowRight size={16} />
              </>
            )}
          </button>

          <p className="text-center text-slate-500 text-xs sm:text-sm pt-1">
            Don't have an account?{' '}
            <Link to="/signup" className="text-red-400 hover:text-red-300 hover:underline font-medium transition-colors">
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
