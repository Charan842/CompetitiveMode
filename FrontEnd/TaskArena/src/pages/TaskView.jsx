import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTask } from '../services/taskService';
import { getMySubmissions, getTrackingByTask } from '../services/submissionService';
import { getResultByTask } from '../services/resultService';
import Timer from '../components/Timer';
import SubtaskCard from '../components/SubtaskCard';
import ResultPanel from '../components/ResultPanel';
import PageTransition from '../components/PageTransition';
import AnimatedCard from '../components/AnimatedCard';
import { CardSkeleton } from '../components/Skeleton';
import toast from 'react-hot-toast';
import { FiAward, FiLayers, FiArrowLeft, FiUser } from 'react-icons/fi';
import DifficultyBadge from '../components/DifficultyBadge';
import ConstraintBanner from '../components/ConstraintBanner';

const TaskView = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [task, setTask] = useState(null);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [tracking, setTracking] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const deadlineWarned = useRef(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  // Deadline approaching toast
  useEffect(() => {
    if (!task || deadlineWarned.current) return;
    const end = new Date(task.endTime).getTime();
    const now = Date.now();
    const fiveMin = 5 * 60 * 1000;
    const timeToWarning = end - fiveMin - now;

    if (timeToWarning <= 0 && end > now) {
      toast('Deadline approaching! Less than 5 minutes left.', { icon: '⚡', duration: 5000 });
      deadlineWarned.current = true;
      return;
    }
    if (timeToWarning > 0) {
      const timeout = setTimeout(() => {
        toast('Deadline approaching! Less than 5 minutes left.', { icon: '⚡', duration: 5000 });
        deadlineWarned.current = true;
      }, timeToWarning);
      return () => clearTimeout(timeout);
    }
  }, [task]);

  const fetchData = async () => {
    try {
      const [taskRes, subsRes, trackRes] = await Promise.all([
        getTask(id),
        getMySubmissions(id),
        getTrackingByTask(id),
      ]);
      setTask(taskRes.data);
      setMySubmissions(subsRes.data);
      setTracking(trackRes.data);

      try {
        const resultRes = await getResultByTask(id);
        setResult(resultRes.data);
      } catch {
        // No result yet
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 animate-pulse space-y-4">
            <div className="h-6 w-48 bg-gray-700 rounded" />
            <div className="h-4 w-full bg-gray-700 rounded" />
            <div className="grid grid-cols-2 gap-4"><div className="h-2 bg-gray-700 rounded-full" /><div className="h-2 bg-gray-700 rounded-full" /></div>
          </div>
          {[1,2,3].map(i => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <span className="text-4xl block mb-3">404</span>
          <p className="text-gray-500 mb-4">Task not found</p>
          <Link to="/" className="text-yellow-400 hover:underline text-sm">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const isActive = Date.now() >= new Date(task.startTime).getTime() && Date.now() <= new Date(task.endTime).getTime();
  const isExpired = Date.now() > new Date(task.endTime).getTime();
  const completedSubtaskIds = new Set(mySubmissions.map((s) => s.subtaskId));

  const myTracking = tracking.find((t) => (t.userId?._id || t.userId) === user._id);
  const opponentTracking = tracking.find((t) => (t.userId?._id || t.userId) !== user._id);
  const myCount = myTracking?.completedCount || 0;
  const opCount = opponentTracking?.completedCount || 0;
  const total = task.subtasks.length;
  const taskUnitLabel = task.category === 'DSA' ? 'Questions' : 'Subtasks';

  return (
    <PageTransition>
      <div className="app-shell">
        <div className="page-content max-w-4xl mx-auto px-4 py-6 sm:py-8">
          {/* Back */}
          <Link to={`/match/${task.matchId}`} className="inline-flex items-center gap-2 text-slate-500 hover:text-cyan-200 text-sm mb-4 sm:mb-6 transition-colors no-underline">
            <FiArrowLeft size={14} /> Back to Match
          </Link>

          {/* Header */}
          <AnimatedCard>
            <div className="glass-panel-strong scan-line rounded-[28px] p-4 sm:p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                <div className="min-w-0">
                  <span className="eyebrow mb-3">Challenge Brief</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="display-title text-xl sm:text-2xl text-white">{task.title}</h1>
                    {task.difficulty && <DifficultyBadge difficulty={task.difficulty} />}
                  </div>
                  <p className="text-slate-400 text-sm mt-1">{task.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <FiUser className="text-slate-600" size={12} />
                    <p className="text-slate-500 text-xs">Created by {task.createdBy?.username}</p>
                  </div>
                </div>
                <div className="shrink-0">
                  <Timer endTime={task.endTime} startTime={task.startTime} />
                </div>
              </div>

              {/* Progress bars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4 metric-tile rounded-2xl p-3 sm:p-4">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-400 font-medium">You</span>
                    <span className="text-cyan-300 font-bold">{myCount}/{total}</span>
                  </div>
                  <div className="bg-slate-950/70 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-cyan-400 to-sky-300 h-full rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${total > 0 ? (myCount / total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-400 font-medium">Opponent</span>
                    <span className="text-amber-200 font-bold">{opCount}/{total}</span>
                  </div>
                  <div className="bg-slate-950/70 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-300 to-orange-200 h-full rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${total > 0 ? (opCount / total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </AnimatedCard>

          {/* Constraint */}
          {task.constraintText && (
            <AnimatedCard className="mb-4">
              <ConstraintBanner constraintText={task.constraintText} type="applied" />
            </AnimatedCard>
          )}

          {/* Result */}
          {result && (
            <AnimatedCard className="mb-6">
              <h2 className="text-base sm:text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <FiAward className="text-cyan-300" size={18} />
                Result
              </h2>
              <ResultPanel result={result} />
            </AnimatedCard>
          )}

          {/* Subtasks */}
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
              <FiLayers className="text-cyan-300" size={18} />
              {taskUnitLabel}
              <span className="hud-pill">
                {myCount}/{total} done
              </span>
            </h2>
            <div className="grid gap-2.5 sm:gap-3">
              {task.subtasks.map((subtask, index) => (
                <AnimatedCard key={subtask._id} delay={index * 80}>
                  <Link
                    to={isActive ? `/submit/${task._id}/${subtask._id}` : '#'}
                    className={`no-underline block ${!isActive ? 'pointer-events-none' : ''}`}
                  >
                    <SubtaskCard
                      subtask={subtask}
                      index={index}
                      isCompleted={completedSubtaskIds.has(subtask._id)}
                    />
                  </Link>
                </AnimatedCard>
              ))}
            </div>
          </div>

          {/* Compute Result */}
          {isExpired && !result && (
            <AnimatedCard delay={300} className="mt-6">
              <div className="text-center glass-panel rounded-[24px] p-6 sm:p-8">
                <FiAward className="text-cyan-300 mx-auto mb-3" size={32} />
                <p className="text-slate-400 mb-4">Time's up! Ready to see who won?</p>
                <Link
                  to={`/results/${task._id}`}
                  className="neon-button inline-flex items-center gap-2 font-semibold px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all no-underline"
                >
                  <FiAward size={16} />
                  View Results
                </Link>
              </div>
            </AnimatedCard>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default TaskView;
