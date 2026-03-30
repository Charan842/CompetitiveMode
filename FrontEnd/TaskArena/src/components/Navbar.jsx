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
    <nav className="topbar sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-3 text-white no-underline group"
        >
          <div className="w-10 h-10 rounded-2xl avatar-shell flex items-center justify-center text-red-400">
            <FiZap className="group-hover:rotate-12 transition-transform duration-300" />
          </div>
          <div>
            <p className="text-[10px] tracking-[0.35em] uppercase text-red-300/60 mb-0.5">Arena Protocol</p>
            <span className="display-title text-sm sm:text-lg">
              Task<span className="text-red-400">Arena</span>
            </span>
          </div>
        </Link>

        {user && (
          <>
            {/* Desktop */}
            <div className="hidden sm:flex items-center gap-4">
              <div className="hud-pill">
                <span className="text-emerald-400 font-bold">{user.totalWins}<span className="text-emerald-400/50 ml-0.5">W</span></span>
                <span className="text-red-900/60">|</span>
                <span className="text-red-400 font-bold">{user.totalLosses}<span className="text-red-400/50 ml-0.5">L</span></span>
                <span className="text-red-900/60">|</span>
                <span className="text-slate-300 font-bold">{user.totalDraws}<span className="text-slate-500 ml-0.5">D</span></span>
              </div>
              <div className="glass-panel rounded-full px-3 py-1.5 flex items-center gap-3">
                <div className="w-8 h-8 avatar-shell rounded-full flex items-center justify-center text-red-300 font-bold text-sm">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span className="text-slate-100 text-sm font-medium">{user.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="danger-button cursor-pointer p-2 rounded-xl"
                title="Logout"
              >
                <FiLogOut size={16} />
              </button>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="sm:hidden ghost-button transition-colors cursor-pointer p-2 rounded-xl"
            >
              {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </>
        )}
      </div>

      {/* Mobile menu */}
      {user && mobileOpen && (
        <div className="sm:hidden border-t border-red-900/30 bg-[#080202]/96 backdrop-blur-xl animate-[slideDown_0.2s_ease-out]">
          <div className="px-4 py-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 avatar-shell rounded-full flex items-center justify-center text-red-300 font-bold">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-white font-medium">{user.username}</p>
                <div className="flex items-center gap-2 text-xs mt-0.5">
                  <span className="text-emerald-400 font-bold">{user.totalWins}W</span>
                  <span className="text-red-400 font-bold">{user.totalLosses}L</span>
                  <span className="text-slate-400 font-bold">{user.totalDraws}D</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="danger-button w-full flex items-center justify-center gap-2 rounded-xl py-2.5 transition-colors cursor-pointer text-sm font-medium"
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
