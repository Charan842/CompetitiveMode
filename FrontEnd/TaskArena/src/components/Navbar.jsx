import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiZap, FiMenu, FiX } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileOpen(false);
  };

  return (
    <nav className="bg-gray-900/95 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 text-xl font-bold text-white no-underline group"
        >
          <FiZap className="text-yellow-400 group-hover:rotate-12 transition-transform duration-300" />
          <span>
            Task<span className="text-yellow-400">Arena</span>
          </span>
        </Link>

        {user && (
          <>
            {/* Desktop */}
            <div className="hidden sm:flex items-center gap-4">
              <div className="flex items-center gap-1.5 bg-gray-800/80 rounded-full px-3 py-1.5 text-xs">
                <span className="text-green-400 font-bold">{user.totalWins}<span className="text-green-400/60 ml-0.5">W</span></span>
                <span className="text-gray-600">|</span>
                <span className="text-red-400 font-bold">{user.totalLosses}<span className="text-red-400/60 ml-0.5">L</span></span>
                <span className="text-gray-600">|</span>
                <span className="text-gray-400 font-bold">{user.totalDraws}<span className="text-gray-500 ml-0.5">D</span></span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center text-yellow-400 font-bold text-sm">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span className="text-gray-300 text-sm font-medium">{user.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-red-400 transition-colors cursor-pointer p-1.5 hover:bg-red-400/10 rounded-lg"
                title="Logout"
              >
                <FiLogOut size={16} />
              </button>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="sm:hidden text-gray-400 hover:text-white transition-colors cursor-pointer p-1"
            >
              {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </>
        )}
      </div>

      {/* Mobile menu */}
      {user && mobileOpen && (
        <div className="sm:hidden border-t border-gray-800 bg-gray-900/98 backdrop-blur-md animate-[slideDown_0.2s_ease-out]">
          <div className="px-4 py-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center text-yellow-400 font-bold">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-white font-medium">{user.username}</p>
                <div className="flex items-center gap-2 text-xs mt-0.5">
                  <span className="text-green-400 font-bold">{user.totalWins}W</span>
                  <span className="text-red-400 font-bold">{user.totalLosses}L</span>
                  <span className="text-gray-500 font-bold">{user.totalDraws}D</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 text-red-400 border border-red-400/30 hover:bg-red-400/10 rounded-lg py-2.5 transition-colors cursor-pointer text-sm font-medium"
            >
              <FiLogOut size={14} />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
