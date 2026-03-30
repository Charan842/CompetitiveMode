import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMatch } from '../services/matchService';
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
import ChatBox from '../components/ChatBox';
import toast from 'react-hot-toast';
import { FiPlus, FiCalendar, FiAward, FiArrowLeft, FiLayers } from 'react-icons/fi';

const MatchView = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [match, setMatch] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    try {
      const [matchRes, tasksRes, resultsRes] = await Promise.all([
        getMatch(id), getTasksByMatch(id), getResultsByMatch(id),
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
      <div className="min-h-screen" style={{ background: '#080303' }}>
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          <div className="glass-panel rounded-xl p-6 animate-pulse">
            <div className="flex justify-center gap-8">
              <div className="text-center space-y-2"><div className="w-14 h-14 bg-red-950/40 rounded-full mx-auto" /><div className="w-20 h-4 bg-red-950/30 rounded mx-auto" /></div>
              <div className="w-12 h-8 bg-red-950/30 rounded self-center" />
              <div className="text-center space-y-2"><div className="w-14 h-14 bg-red-950/40 rounded-full mx-auto" /><div className="w-20 h-4 bg-red-950/30 rounded mx-auto" /></div>
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#080303' }}>
        <div className="text-center">
          <span className="text-4xl block mb-3">404</span>
          <p className="text-slate-500 mb-4">Match not found</p>
          <Link to="/" className="text-red-400 hover:underline text-sm">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const opponent = match.players.find((p) => p._id !== user._id);
  const isMyTurn = match.currentTurn?._id === user._id || match.currentTurn === user._id;
  const winsA = results.filter((r) => r.winner?._id === user._id || r.winner === user._id).length;
  const winsB = results.filter((r) => r.winner && (r.winner._id || r.winner) !== user._id).length;
  const draws = results.filter((r) => !r.winner).length;

  return (
    <PageTransition>
      <div className="min-h-screen" style={{ background: '#080303' }}>
        <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
          {/* Back */}
          <Link to="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-red-400 text-sm mb-4 sm:mb-6 transition-colors no-underline">
            <FiArrowLeft size={14} /> Dashboard
          </Link>

          {/* VS Header */}
          <AnimatedCard>
            <div className="glass-panel-strong rounded-2xl p-5 sm:p-8 mb-6 overflow-hidden relative scan-line">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-red-500/3 pointer-events-none" />

              <div className="flex items-center justify-center gap-4 sm:gap-8 relative">
                {/* Me */}
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 avatar-shell rounded-full flex items-center justify-center text-red-300 font-bold text-lg sm:text-2xl mx-auto animate-red-pulse">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <p className="text-white font-semibold mt-2 text-sm sm:text-base">{user.username}</p>
                  <p className="text-emerald-400 text-xs sm:text-sm font-bold">{winsA} wins</p>
                </div>

                {/* VS */}
                <div className="text-center px-2">
                  <div className="bg-black/60 border border-red-900/40 rounded-xl px-3 sm:px-5 py-2">
                    <p className="display-title text-red-500 text-2xl sm:text-3xl font-black tracking-wider">VS</p>
                  </div>
                  <p className="text-slate-600 text-[10px] sm:text-xs mt-1.5">{draws} draws</p>
                </div>

                {/* Opponent */}
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 avatar-shell rounded-full flex items-center justify-center text-red-300 font-bold text-lg sm:text-2xl mx-auto" style={{ filter: 'hue-rotate(160deg)' }}>
                    {opponent?.username?.charAt(0).toUpperCase()}
                  </div>
                  <p className="text-white font-semibold mt-2 text-sm sm:text-base">{opponent?.username}</p>
                  <p className="text-red-400 text-xs sm:text-sm font-bold">{winsB} wins</p>
                </div>
              </div>

              {isMyTurn && match.status === 'active' && (
                <div className="text-center mt-5 sm:mt-6 relative">
                  <Link
                    to={`/create-task/${match._id}`}
                    className="inline-flex items-center gap-2 neon-button px-4 sm:px-6 py-2.5 rounded-xl transition-all no-underline hover:scale-105 text-sm sm:text-base"
                  >
                    <FiPlus size={16} />
                    Create Today's Task
                  </Link>
                </div>
              )}
              {!isMyTurn && match.status === 'active' && (
                <p className="text-center text-slate-600 text-xs sm:text-sm mt-4 relative">
                  Waiting for <span className="text-red-400 font-medium">{opponent?.username}</span> to create today's task...
                </p>
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
            <AnimatedCard delay={350} className="mb-6">
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
              <FiCalendar className="text-red-400" size={18} />
              Tasks
              <span className="hud-pill">{tasks.length}</span>
            </h2>
            {tasks.length === 0 ? (
              <AnimatedCard>
                <div className="glass-panel border-dashed rounded-xl p-8 sm:p-10 text-center">
                  <div className="w-14 h-14 avatar-shell rounded-full flex items-center justify-center mx-auto mb-3">
                    <FiLayers className="text-red-400/60" size={24} />
                  </div>
                  <p className="text-slate-400 font-medium mb-1">No tasks yet</p>
                  <p className="text-slate-600 text-sm">
                    {isMyTurn ? "It's your turn to create a task!" : `Waiting for ${opponent?.username}...`}
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

          {/* Chat */}
          <AnimatedCard delay={300} className="mb-6">
            <ChatBox matchId={id} />
          </AnimatedCard>

          {/* Results History */}
          {results.length > 0 && (
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
                <FiAward className="text-red-400" size={18} />
                Results History
                <span className="hud-pill">{results.length}</span>
              </h2>
              <div className="space-y-2">
                {results.map((r, i) => (
                  <AnimatedCard key={r._id} delay={i * 60}>
                    <Link to={`/results/${r.taskId?._id || r.taskId}`} className="block no-underline group">
                      <div className="glass-panel rounded-lg p-3 sm:p-3.5 flex items-center justify-between hover:border-red-500/25 transition-all duration-300 hover:-translate-y-0.5">
                        <div className="min-w-0">
                          <p className="text-white text-sm font-medium truncate group-hover:text-red-300 transition-colors">
                            {r.taskId?.title || 'Task'}
                          </p>
                          <p className="text-slate-600 text-xs">{r.taskId?.date && new Date(r.taskId.date).toLocaleDateString()}</p>
                        </div>
                        <span className={`text-xs sm:text-sm font-bold px-2.5 py-1 rounded-full shrink-0 ml-2 ${
                          !r.winner
                            ? 'text-slate-400 bg-slate-800/50 border border-slate-700/40'
                            : (r.winner._id || r.winner) === user._id
                            ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                            : 'text-red-400 bg-red-500/10 border border-red-500/20'
                        }`}>
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
