import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiZap, FiUser, FiMail, FiLock, FiArrowRight } from 'react-icons/fi';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(username, email, password);
      toast.success('Account created! Let the games begin!');
      navigate('/');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fadeInUp">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-yellow-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-float">
            <FiZap className="text-yellow-400" size={30} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
            Task<span className="text-yellow-400">Arena</span>
          </h1>
          <p className="text-gray-500 text-sm">Create your arena account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 sm:p-8 space-y-5 shadow-xl shadow-black/20">
          <div>
            <label className="block text-gray-400 text-xs sm:text-sm mb-1.5 font-medium">Username</label>
            <div className="relative group">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-yellow-400 transition-colors" size={15} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="arena_warrior"
                required
                minLength={3}
                className="w-full bg-gray-900 border border-gray-600 rounded-xl pl-10 pr-4 py-2.5 sm:py-3 text-white text-sm focus:outline-none focus:border-yellow-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 text-xs sm:text-sm mb-1.5 font-medium">Email</label>
            <div className="relative group">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-yellow-400 transition-colors" size={15} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-gray-900 border border-gray-600 rounded-xl pl-10 pr-4 py-2.5 sm:py-3 text-white text-sm focus:outline-none focus:border-yellow-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 text-xs sm:text-sm mb-1.5 font-medium">Password</label>
            <div className="relative group">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-yellow-400 transition-colors" size={15} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full bg-gray-900 border border-gray-600 rounded-xl pl-10 pr-4 py-2.5 sm:py-3 text-white text-sm focus:outline-none focus:border-yellow-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold py-2.5 sm:py-3 rounded-xl transition-all disabled:opacity-50 cursor-pointer hover:shadow-lg hover:shadow-yellow-500/20 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-900 border-t-transparent" />
                Creating Account...
              </>
            ) : (
              <>
                Create Account
                <FiArrowRight size={16} />
              </>
            )}
          </button>

          <p className="text-center text-gray-500 text-xs sm:text-sm pt-1">
            Already have an account?{' '}
            <Link to="/login" className="text-yellow-400 hover:text-yellow-300 hover:underline font-medium transition-colors">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
