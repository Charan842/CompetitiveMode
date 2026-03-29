import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { computeResult, getResultByTask } from '../services/resultService';
import { getTask } from '../services/taskService';
import ResultPanel from '../components/ResultPanel';
import PageTransition from '../components/PageTransition';
import AnimatedCard from '../components/AnimatedCard';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiAward, FiClock, FiZap } from 'react-icons/fi';

const ResultsPage = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [computing, setComputing] = useState(false);

  useEffect(() => {
    fetchData();
  }, [taskId]);

  const fetchData = async () => {
    try {
      const taskRes = await getTask(taskId);
      setTask(taskRes.data);

      try {
        const resultRes = await getResultByTask(taskId);
        setResult(resultRes.data);
      } catch {
        // No result computed yet
      }
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
      <div className="min-h-screen bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
          <div className="h-4 w-16 bg-gray-700 rounded animate-pulse" />
          <div className="h-7 w-32 bg-gray-700 rounded animate-pulse" />
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-12 animate-pulse">
            <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-4" />
            <div className="h-5 w-40 bg-gray-700 rounded mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  const isExpired = task && Date.now() > new Date(task.endTime).getTime();

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-white text-sm mb-4 sm:mb-6 transition-colors cursor-pointer bg-transparent border-none"
          >
            <FiArrowLeft size={14} /> Back
          </button>

          <AnimatedCard>
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-1 flex items-center gap-2">
              <FiAward className="text-yellow-400" size={22} />
              Results
            </h1>
            {task && <p className="text-gray-500 text-sm mb-5 sm:mb-6">{task.title}</p>}
          </AnimatedCard>

          {result ? (
            <AnimatedCard delay={200}>
              <ResultPanel result={result} />
            </AnimatedCard>
          ) : isExpired ? (
            <AnimatedCard delay={200}>
              <div className="bg-gray-800 border border-dashed border-yellow-500/30 rounded-2xl p-8 sm:p-12 text-center">
                <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiZap className="text-yellow-400" size={36} />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">Ready to find out?</h3>
                <p className="text-gray-500 text-sm mb-6">Results haven't been computed yet. Click below to reveal the winner.</p>
                <button
                  onClick={handleCompute}
                  disabled={computing}
                  className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold px-6 sm:px-8 py-3 rounded-xl transition-all disabled:opacity-50 cursor-pointer hover:shadow-lg hover:shadow-yellow-500/20 hover:scale-105 active:scale-95 inline-flex items-center gap-2"
                >
                  {computing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-900 border-t-transparent" />
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
              <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 sm:p-12 text-center">
                <div className="w-20 h-20 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiClock className="text-gray-500" size={36} />
                </div>
                <h3 className="text-gray-300 font-semibold text-lg mb-2">Not yet!</h3>
                <p className="text-gray-500 text-sm">
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
