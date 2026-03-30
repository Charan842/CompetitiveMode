import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { computeResult, getResultByTask } from '../services/resultService';
import { getTask } from '../services/taskService';
import ResultPanel from '../components/ResultPanel';
import SubmissionComparison from '../components/SubmissionComparison';
import PageTransition from '../components/PageTransition';
import AnimatedCard from '../components/AnimatedCard';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiAward, FiClock, FiZap } from 'react-icons/fi';

const ResultsPage = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [task, setTask] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [computing, setComputing] = useState(false);

  useEffect(() => { fetchData(); }, [taskId]);

  const fetchData = async () => {
    try {
      const taskRes = await getTask(taskId);
      setTask(taskRes.data);
      try {
        const resultRes = await getResultByTask(taskId);
        setResult(resultRes.data);
      } catch { /* No result yet */ }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCompute = async () => {
    setComputing(true);
    try {
      const { data } = await computeResult(taskId);
      setResult(data);
      toast.success('Result computed!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setComputing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: '#080303' }}>
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
          <div className="h-4 w-16 bg-red-950/40 rounded animate-pulse" />
          <div className="h-7 w-32 bg-red-950/30 rounded animate-pulse" />
          <div className="glass-panel rounded-xl p-12 animate-pulse">
            <div className="w-16 h-16 bg-red-950/40 rounded-full mx-auto mb-4" />
            <div className="h-5 w-40 bg-red-950/30 rounded mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  const isExpired = task && Date.now() > new Date(task.endTime).getTime();

  return (
    <PageTransition>
      <div className="min-h-screen" style={{ background: '#080303' }}>
        <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 hover:text-red-400 text-sm mb-4 sm:mb-6 transition-colors cursor-pointer bg-transparent border-none"
          >
            <FiArrowLeft size={14} /> Back
          </button>

          <AnimatedCard>
            <h1 className="display-title text-xl sm:text-2xl text-white mb-1 flex items-center gap-2">
              <FiAward className="text-red-400" size={22} />
              Results
            </h1>
            {task && <p className="text-slate-500 text-sm mb-5 sm:mb-6">{task.title}</p>}
          </AnimatedCard>

          {result ? (
            <>
              <AnimatedCard delay={200}>
                <ResultPanel result={result} />
              </AnimatedCard>
              <SubmissionComparison
                taskId={taskId}
                currentUserId={user?._id}
                result={result}
              />
            </>
          ) : isExpired ? (
            <AnimatedCard delay={200}>
              <div className="glass-panel border-dashed border-red-500/20 rounded-2xl p-8 sm:p-12 text-center">
                <div className="w-20 h-20 avatar-shell rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiZap className="text-red-400" size={36} />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">Ready to find out?</h3>
                <p className="text-slate-500 text-sm mb-6">Results haven't been computed yet. Click below to reveal the winner.</p>
                <button
                  onClick={handleCompute}
                  disabled={computing}
                  className="neon-button font-bold px-6 sm:px-8 py-3 rounded-xl transition-all disabled:opacity-50 cursor-pointer hover:scale-105 active:scale-95 inline-flex items-center gap-2"
                >
                  {computing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                      Computing...
                    </>
                  ) : (
                    <>
                      <FiAward size={18} />
                      Reveal Winner
                    </>
                  )}
                </button>
              </div>
            </AnimatedCard>
          ) : (
            <AnimatedCard delay={200}>
              <div className="glass-panel rounded-2xl p-8 sm:p-12 text-center">
                <div className="w-20 h-20 avatar-shell rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiClock className="text-slate-600" size={36} />
                </div>
                <h3 className="text-slate-300 font-semibold text-lg mb-2">Not yet!</h3>
                <p className="text-slate-500 text-sm">
                  Results can only be computed after the deadline passes. Keep competing!
                </p>
              </div>
            </AnimatedCard>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default ResultsPage;
