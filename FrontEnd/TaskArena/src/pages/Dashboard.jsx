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
      <div className="min-h-screen bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">Dashboard</h1>
              <p className="text-gray-500 text-xs sm:text-sm mt-0.5">Welcome back, {user?.username}</p>
            </div>
            <button
              onClick={() => setShowNewMatch(!showNewMatch)}
              className={`flex items-center gap-2 font-semibold px-3 sm:px-4 py-2 rounded-lg transition-all cursor-pointer text-sm ${
                showNewMatch
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-yellow-500 hover:bg-yellow-400 text-gray-900 hover:shadow-lg hover:shadow-yellow-500/20'
              }`}
            >
              {showNewMatch ? <FiX size={16} /> : <FiPlus size={16} />}
              <span className="hidden sm:inline">{showNewMatch ? 'Cancel' : 'New Match'}</span>
            </button>
          </div>

          {/* New Match Panel */}
          {showNewMatch && (
            <AnimatedCard className="mb-6">
              <div className="bg-gray-800 border border-yellow-500/20 rounded-xl p-4 sm:p-5">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <FiSearch className="text-yellow-400" size={16} />
                  Find an opponent
                </h3>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search by username..."
                    autoFocus
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-500 transition-colors"
                  />
                </div>
                {searching && (
                  <div className="flex items-center gap-2 mt-3 text-gray-500 text-sm">
                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-t border-yellow-400" />
                    Searching...
                  </div>
                )}
                {!searching && searchQuery.length >= 2 && searchResults.length === 0 && (
                  <p className="text-gray-500 text-sm mt-3">No users found. Try another username.</p>
                )}
                {searchResults.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {searchResults.map((u, i) => (
                      <AnimatedCard key={u._id} delay={i * 80}>
                        <div className="flex items-center justify-between bg-gray-900 rounded-lg p-3 hover:bg-gray-900/80 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 font-bold text-sm">
                              {u.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-white font-medium text-sm">{u.username}</p>
                              <p className="text-gray-500 text-xs">{u.email}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleCreateMatch(u._id)}
                            className="bg-yellow-500/20 text-yellow-400 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium hover:bg-yellow-500/30 transition-all hover:scale-105 cursor-pointer"
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
                <FiUsers className="text-yellow-400" size={18} />
                Your Matches
                {matches.length > 0 && (
                  <span className="text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded-full ml-1">
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
                  <div className="bg-gray-800 border border-dashed border-gray-600 rounded-xl p-8 sm:p-12 text-center">
                    <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiZap className="text-yellow-400" size={28} />
                    </div>
                    <h3 className="text-white font-semibold mb-2">No matches yet</h3>
                    <p className="text-gray-500 text-sm mb-4">Challenge someone to start competing!</p>
                    <button
                      onClick={() => setShowNewMatch(true)}
                      className="bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-500/30 transition-colors cursor-pointer"
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
                          <div className="bg-gray-800 border border-gray-700 rounded-xl p-3.5 sm:p-4 hover:border-yellow-500/40 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-yellow-500/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center text-yellow-400 font-bold text-sm shrink-0 group-hover:scale-110 transition-transform">
                                {opponent?.username?.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="text-white font-medium text-sm sm:text-base truncate group-hover:text-yellow-300 transition-colors">
                                  vs {opponent?.username}
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                  <span
                                    className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full ${
                                      match.status === 'active'
                                        ? 'bg-green-500/20 text-green-400'
                                        : 'bg-gray-600/20 text-gray-400'
                                    }`}
                                  >
                                    {match.status === 'active' && <span className="inline-block w-1 h-1 bg-green-400 rounded-full mr-1 animate-pulse" />}
                                    {match.status}
                                  </span>
                                  {isMyTurn && match.status === 'active' && (
                                    <span className="text-[10px] sm:text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full animate-pulse">
                                      Your Turn
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <FiChevronRight className="text-gray-600 group-hover:text-yellow-400 group-hover:translate-x-1 transition-all shrink-0" size={16} />
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
