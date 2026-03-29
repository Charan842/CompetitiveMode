import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMatch, disposeMatch as disposeMatchRequest } from '../services/matchService';
import { getTasksByMatch } from '../services/taskService';
import { getResultsByMatch } from '../services/resultService';
import TaskCard from '../components/TaskCard';
import PlayerStats from '../components/PlayerStats';
import H2HPanel from '../components/H2HPanel';
import SubmissionHeatmap from '../components/SubmissionHeatmap';
import ConstraintBanner from '../components/ConstraintBanner';
import PageTransition from '../components/PageTransition';
import AnimatedCard from '../components/AnimatedCard';
import { CardSkeleton, StatsSkeleton } from '../components/Skeleton';
import toast from 'react-hot-toast';
import { FiPlus, FiCalendar, FiAward, FiArrowLeft, FiLayers, FiTrash2 } from 'react-icons/fi';

const MatchView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [match, setMatch] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [disposing, setDisposing] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [matchRes, tasksRes, resultsRes] = await Promise.all([
        getMatch(id),
        getTasksByMatch(id),
        getResultsByMatch(id),
      ]);
      setMatch(matchRes.data);
      setTasks(tasksRes.data);
      setResults(resultsRes.data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 animate-pulse">
            <div className="flex justify-center gap-8">
              <div className="text-center space-y-2"><div className="w-14 h-14 bg-gray-700 rounded-full mx-auto" /><div className="w-20 h-4 bg-gray-700 rounded mx-auto" /></div>
              <div className="w-12 h-8 bg-gray-700 rounded self-center" />
              <div className="text-center space-y-2"><div className="w-14 h-14 bg-gray-700 rounded-full mx-auto" /><div className="w-20 h-4 bg-gray-700 rounded mx-auto" /></div>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">{[1,2].map(i => <StatsSkeleton key={i} />)}</div>
          <div className="space-y-3">{[1,2].map(i => <CardSkeleton key={i} />)}</div>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <span className="text-4xl block mb-3">404</span>
          <p className="text-gray-500 mb-4">Match not found</p>
          <Link to="/" className="text-yellow-400 hover:underline text-sm">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const opponent = match.players.find((p) => p._id !== user._id);
  const isMyTurn = match.currentTurn?._id === user._id || match.currentTurn === user._id;
  const today = new Date().toDateString();
  const todayTaskCount = tasks.filter((task) => new Date(task.date).toDateString() === today).length;
  const hasReachedTaskLimit = tasks.length >= 5;

  const winsA = results.filter((r) => r.winner?._id === user._id || r.winner === user._id).length;
  const winsB = results.filter((r) => r.winner && (r.winner._id || r.winner) !== user._id).length;
  const draws = results.filter((r) => !r.winner).length;

  const handleDisposeMatch = async () => {
    const confirmed = window.confirm('Dispose this match for both players? This will remove it from your match list.');
    if (!confirmed) return;

    setDisposing(true);
    try {
      await disposeMatchRequest(id);
      toast.success('Match disposed');
      navigate('/');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDisposing(false);
    }
  };

  return (
    <PageTransition>
      <div className="app-shell">
        <div className="page-content max-w-5xl mx-auto px-4 py-6 sm:py-8">
          {/* Back */}
          <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-cyan-200 text-sm mb-4 sm:mb-6 transition-colors no-underline">
            <FiArrowLeft size={14} /> Dashboard
          </Link>

          {/* VS Header */}
          <AnimatedCard>
            <div className="glass-panel-strong scan-line rounded-[28px] p-5 sm:p-8 mb-6 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/8 via-transparent to-amber-400/8 pointer-events-none" />
              <div className="flex items-center justify-between gap-3 mb-6 relative flex-wrap">
                <div>
                  <span className="eyebrow">Live Match</span>
                  <h1 className="display-title text-xl sm:text-3xl text-white mt-4">Head To Head</h1>
                </div>
                <div className="hud-pill">
                  <span className="text-slate-300">Tasks</span>
                  <span className="text-cyan-200 font-bold">{tasks.length}/5</span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-4 sm:gap-8 relative">
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 avatar-shell rounded-full flex items-center justify-center text-cyan-200 font-bold text-lg sm:text-2xl mx-auto">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <p className="text-white font-semibold mt-2 text-sm sm:text-base">{user.username}</p>
                  <p className="text-emerald-300 text-xs sm:text-sm font-bold">{winsA} wins</p>
                </div>

                <div className="text-center px-2">
                  <div className="metric-tile rounded-2xl px-3 sm:px-4 py-2">
                    <p className="display-title text-slate-300 text-2xl sm:text-3xl font-black">VS</p>
                  </div>
                  <p className="text-slate-500 text-[10px] sm:text-xs mt-1.5">{draws} draws</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 avatar-shell rounded-full flex items-center justify-center text-amber-200 font-bold text-lg sm:text-2xl mx-auto">
                    {opponent?.username?.charAt(0).toUpperCase()}
                  </div>
                  <p className="text-white font-semibold mt-2 text-sm sm:text-base">{opponent?.username}</p>
                  <p className="text-rose-300 text-xs sm:text-sm font-bold">{winsB} wins</p>
                </div>
              </div>

              {isMyTurn && match.status === 'active' && (
                <div className="text-center mt-5 sm:mt-6 relative flex flex-col sm:flex-row items-center justify-center gap-3">
                  {hasReachedTaskLimit && (
                    <p className="text-slate-400 text-xs sm:text-sm">
                      This match has reached its 5-task limit.
                    </p>
                  )}
                  {!hasReachedTaskLimit && (
                    <Link
                      to={`/create-task/${match._id}`}
                      className="neon-button inline-flex items-center gap-2 font-semibold px-4 sm:px-6 py-2.5 rounded-xl transition-all no-underline text-sm sm:text-base"
                    >
                      <FiPlus size={16} />
                      {todayTaskCount > 0 ? 'Create Another Task' : 'Create Task'}
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleDisposeMatch}
                    disabled={disposing}
                    className="danger-button inline-flex items-center gap-2 font-semibold px-4 sm:px-5 py-2.5 rounded-xl transition-all text-sm sm:text-base disabled:opacity-60 cursor-pointer"
                  >
                    <FiTrash2 size={16} />
                    {disposing ? 'Disposing...' : 'Dispose Match'}
                  </button>
                </div>
              )}
              {!isMyTurn && match.status === 'active' && (
                <div className="text-center mt-4 relative space-y-3">
                  <p className="text-slate-400 text-xs sm:text-sm">
                    {hasReachedTaskLimit
                      ? 'This match has reached its 5-task limit.'
                      : <>Waiting for <span className="text-amber-200 font-medium">{opponent?.username}</span> to create the next task...</>}
                  </p>
                  <button
                    type="button"
                    onClick={handleDisposeMatch}
                    disabled={disposing}
                    className="danger-button inline-flex items-center gap-2 font-semibold px-4 py-2 rounded-xl transition-all text-xs sm:text-sm disabled:opacity-60 cursor-pointer"
                  >
                    <FiTrash2 size={14} />
                    {disposing ? 'Disposing...' : 'Dispose Match'}
                  </button>
                </div>
              )}
            </div>
          </AnimatedCard>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
            {match.players.map((p, i) => (
              <AnimatedCard key={p._id} delay={200 + i * 100}>
                <PlayerStats user={p} />
              </AnimatedCard>
            ))}
          </div>

          {/* Constraint Banner */}
          {match.nextConstraint && (
            <AnimatedCard delay={400} className="mb-6">
              <ConstraintBanner constraintText={match.nextConstraint} type="active" />
            </AnimatedCard>
          )}

          {/* H2H Analytics & Heatmap */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <AnimatedCard delay={350}>
              <H2HPanel matchId={id} players={match.players} />
            </AnimatedCard>
            <AnimatedCard delay={400}>
              <SubmissionHeatmap matchId={id} currentUserId={user._id} />
            </AnimatedCard>
          </div>

          {/* Tasks */}
          <div className="mb-6">
            <h2 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
              <FiCalendar className="text-cyan-300" size={18} />
              Tasks
              <span className="hud-pill">{tasks.length}/5</span>
            </h2>
            {tasks.length === 0 ? (
              <AnimatedCard>
                <div className="glass-panel rounded-[24px] p-8 sm:p-10 text-center">
                  <div className="w-14 h-14 avatar-shell rounded-full flex items-center justify-center mx-auto mb-3">
                    <FiLayers className="text-cyan-300" size={24} />
                  </div>
                  <p className="text-slate-200 font-medium mb-1">No tasks yet</p>
                  <p className="text-slate-500 text-sm">
                    {isMyTurn ? "It's your turn to create a task." : `Waiting for ${opponent?.username} to create the next task.`}
                  </p>
                </div>
              </AnimatedCard>
            ) : (
              <div className="grid gap-3">
                {tasks.map((task, i) => (
                  <AnimatedCard key={task._id} delay={i * 80}>
                    <TaskCard task={task} />
                  </AnimatedCard>
                ))}
              </div>
            )}
          </div>

          {/* Results History */}
          {results.length > 0 && (
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
                <FiAward className="text-cyan-300" size={18} />
                Results History
                <span className="hud-pill">{results.length}</span>
              </h2>
              <div className="space-y-2">
                {results.map((r, i) => (
                  <AnimatedCard key={r._id} delay={i * 60}>
                    <Link
                      to={`/results/${r.taskId?._id || r.taskId}`}
                      className="block no-underline group"
                    >
                      <div className="glass-panel rounded-2xl p-3 sm:p-3.5 flex items-center justify-between hover:border-cyan-400/30 transition-all duration-300 hover:-translate-y-0.5">
                        <div className="min-w-0">
                          <p className="text-white text-sm font-medium truncate group-hover:text-cyan-200 transition-colors">
                            {r.taskId?.title || 'Task'}
                          </p>
                          <p className="text-slate-500 text-xs">{r.taskId?.date && new Date(r.taskId.date).toLocaleDateString()}</p>
                        </div>
                        <span
                          className={`text-xs sm:text-sm font-bold px-2.5 py-1 rounded-full shrink-0 ml-2 ${
                            !r.winner
                              ? 'text-gray-400 bg-gray-700/50'
                              : (r.winner._id || r.winner) === user._id
                              ? 'text-green-400 bg-green-500/15'
                              : 'text-red-400 bg-red-500/15'
                          }`}
                        >
                          {!r.winner ? 'Draw' : (r.winner._id || r.winner) === user._id ? 'Won' : 'Lost'}
                        </span>
                      </div>
                    </Link>
                  </AnimatedCard>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default MatchView;
