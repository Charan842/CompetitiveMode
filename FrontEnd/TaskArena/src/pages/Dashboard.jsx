import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMyMatches, createMatch, searchUsers } from '../services/matchService';
import { Link } from 'react-router-dom';
import PlayerStats from '../components/PlayerStats';
import PageTransition from '../components/PageTransition';
import AnimatedCard from '../components/AnimatedCard';
import { MatchSkeleton, StatsSkeleton } from '../components/Skeleton';
import toast from 'react-hot-toast';
import { FiPlus, FiSearch, FiUsers, FiChevronRight, FiZap, FiX } from 'react-icons/fi';

const Dashboard = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewMatch, setShowNewMatch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const { data } = await getMyMatches();
      setMatches(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (q) => {
    setSearchQuery(q);
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const { data } = await searchUsers(q);
      setSearchResults(data);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleCreateMatch = async (opponentId) => {
    try {
      await createMatch(opponentId);
      toast.success('Match created! Let the battle begin!');
      setShowNewMatch(false);
      setSearchQuery('');
      setSearchResults([]);
      fetchMatches();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const getOpponent = (match) => match.players.find((p) => p._id !== user._id);

  return (
    <PageTransition>
      <div className="app-shell">
        <div className="page-content max-w-5xl mx-auto px-4 py-6 sm:py-8">
          {/* Header */}
          <div className="glass-panel-strong rounded-[28px] p-5 sm:p-7 mb-6 sm:mb-8 scan-line">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <span className="eyebrow mb-4">Command Center</span>
                <h1 className="display-title text-2xl sm:text-4xl text-white">Battle Dashboard</h1>
                <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-xl">
                  Monitor rivalries, launch fresh matches, and keep your challenge queue moving.
                </p>
              </div>
              <div className="flex gap-3 flex-wrap">
                <div className="metric-tile px-4 py-3 min-w-[130px]">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-200/60">Matches</p>
                  <p className="text-2xl font-bold text-white mt-1">{matches.length}</p>
                </div>
                <div className="metric-tile px-4 py-3 min-w-[130px]">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-200/60">Wins</p>
                  <p className="text-2xl font-bold text-emerald-300 mt-1">{user?.totalWins || 0}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-6">
              <p className="text-slate-500 text-xs sm:text-sm">Welcome back, {user?.username}</p>
              <button
                onClick={() => setShowNewMatch(!showNewMatch)}
                className={`flex items-center gap-2 font-semibold px-3 sm:px-4 py-2 rounded-xl transition-all cursor-pointer text-sm ${
                  showNewMatch
                    ? 'ghost-button'
                    : 'neon-button'
                }`}
              >
                {showNewMatch ? <FiX size={16} /> : <FiPlus size={16} />}
                <span className="hidden sm:inline">{showNewMatch ? 'Close Panel' : 'New Match'}</span>
              </button>
            </div>
          </div>

          {/* New Match Panel */}
          {showNewMatch && (
            <AnimatedCard className="mb-6">
              <div className="glass-panel rounded-[24px] p-4 sm:p-5">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <FiSearch className="text-cyan-300" size={16} />
                  Find an opponent
                </h3>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search by username..."
                    autoFocus
                    className="futuristic-input w-full rounded-xl pl-10 pr-4 py-2.5 text-white text-sm"
                  />
                </div>
                {searching && (
                  <div className="flex items-center gap-2 mt-3 text-slate-400 text-sm">
                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-t border-cyan-300" />
                    Searching...
                  </div>
                )}
                {!searching && searchQuery.length >= 2 && searchResults.length === 0 && (
                  <p className="text-slate-500 text-sm mt-3">No users found. Try another username.</p>
                )}
                {searchResults.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {searchResults.map((u, i) => (
                      <AnimatedCard key={u._id} delay={i * 80}>
                        <div className="metric-tile flex items-center justify-between rounded-2xl p-3 hover:border-cyan-400/20 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 avatar-shell rounded-full flex items-center justify-center text-cyan-200 font-bold text-sm">
                              {u.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-white font-medium text-sm">{u.username}</p>
                              <p className="text-slate-500 text-xs">{u.email}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleCreateMatch(u._id)}
                            className="neon-button px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium cursor-pointer"
                          >
                            Challenge
                          </button>
                        </div>
                      </AnimatedCard>
                    ))}
                  </div>
                )}
              </div>
            </AnimatedCard>
          )}

          <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
            {/* Stats */}
            <div className="md:col-span-1 order-2 md:order-1">
              {loading ? <StatsSkeleton /> : <AnimatedCard delay={100}><PlayerStats user={user} /></AnimatedCard>}
            </div>

            {/* Matches */}
            <div className="md:col-span-2 order-1 md:order-2">
              <h2 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
                <FiUsers className="text-cyan-300" size={18} />
                Your Matches
                {matches.length > 0 && (
                  <span className="hud-pill ml-1">
                    {matches.length}
                  </span>
                )}
              </h2>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <MatchSkeleton key={i} />)}
                </div>
              ) : matches.length === 0 ? (
                <AnimatedCard>
                  <div className="glass-panel rounded-[24px] p-8 sm:p-12 text-center">
                    <div className="w-16 h-16 avatar-shell rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiZap className="text-cyan-300" size={28} />
                    </div>
                    <h3 className="text-white font-semibold mb-2">No matches yet</h3>
                    <p className="text-slate-500 text-sm mb-4">Challenge someone to start competing!</p>
                    <button
                      onClick={() => setShowNewMatch(true)}
                      className="neon-button px-4 py-2 rounded-xl text-sm font-medium cursor-pointer"
                    >
                      Find an Opponent
                    </button>
                  </div>
                </AnimatedCard>
              ) : (
                <div className="space-y-2.5">
                  {matches.map((match, i) => {
                    const opponent = getOpponent(match);
                    const isMyTurn = match.currentTurn?._id === user._id || match.currentTurn === user._id;

                    return (
                      <AnimatedCard key={match._id} delay={i * 80}>
                        <Link to={`/match/${match._id}`} className="block no-underline group">
                          <div className="glass-panel scan-line rounded-[24px] p-3.5 sm:p-4 hover:border-cyan-400/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-cyan-500/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 avatar-shell rounded-full flex items-center justify-center text-cyan-200 font-bold text-sm shrink-0 group-hover:scale-110 transition-transform">
                                {opponent?.username?.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="text-white font-medium text-sm sm:text-base truncate group-hover:text-cyan-200 transition-colors">
                                  vs {opponent?.username}
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                  <span
                                    className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full ${
                                      match.status === 'active'
                                        ? 'bg-emerald-500/20 text-emerald-300'
                                        : 'bg-slate-600/20 text-slate-400'
                                    }`}
                                  >
                                    {match.status === 'active' && <span className="inline-block w-1 h-1 bg-emerald-300 rounded-full mr-1 animate-pulse" />}
                                    {match.status}
                                  </span>
                                  {isMyTurn && match.status === 'active' && (
                                    <span className="text-[10px] sm:text-xs bg-cyan-500/20 text-cyan-200 px-2 py-0.5 rounded-full animate-pulse">
                                      Your Turn
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <FiChevronRight className="text-slate-500 group-hover:text-cyan-300 group-hover:translate-x-1 transition-all shrink-0" size={16} />
                          </div>
                        </Link>
                      </AnimatedCard>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Dashboard;
