import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTask } from '../services/taskService';
import { createSubmission, getMySubmissions, lockSubmissions } from '../services/submissionService';
import SubmissionForm from '../components/SubmissionForm';
import Timer from '../components/Timer';
import PageTransition from '../components/PageTransition';
import AnimatedCard from '../components/AnimatedCard';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiAlertCircle, FiClock, FiLock } from 'react-icons/fi';

const SubmissionPage = () => {
  const { taskId, subtaskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [subtask, setSubtask] = useState(null);
  const [existingSubmission, setExistingSubmission] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [taskId, subtaskId]);

  const fetchData = async () => {
    try {
      const [taskRes, subsRes] = await Promise.all([
        getTask(taskId),
        getMySubmissions(taskId),
      ]);
      setTask(taskRes.data);

      const st = taskRes.data.subtasks.find((s) => s._id === subtaskId);
      setSubtask(st);

      const existing = subsRes.data.find((s) => s.subtaskId === subtaskId);
      setExistingSubmission(existing);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isLocked = existingSubmission?.locked === true;

  const handleSubmit = async (response) => {
    try {
      await createSubmission({ taskId, subtaskId, response });
      toast.success('Submitted successfully!');
      navigate(`/task/${taskId}`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleLock = async () => {
    try {
      await lockSubmissions(taskId);
      toast.success('All submissions locked!');
      navigate(`/task/${taskId}`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
          <div className="h-4 w-24 bg-gray-700 rounded animate-pulse" />
          <div className="h-6 w-48 bg-gray-700 rounded animate-pulse" />
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 animate-pulse space-y-3">
            <div className="h-5 w-40 bg-gray-700 rounded" />
            <div className="h-4 w-full bg-gray-700 rounded" />
            <div className="h-32 w-full bg-gray-700 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!task || !subtask) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <FiAlertCircle className="text-gray-600 mx-auto mb-3" size={40} />
          <p className="text-gray-500 mb-4">Subtask not found</p>
          <button onClick={() => navigate(-1)} className="text-yellow-400 hover:underline text-sm cursor-pointer bg-transparent border-none">Go Back</button>
        </div>
      </div>
    );
  }

  const isActive = Date.now() >= new Date(task.startTime).getTime() && Date.now() <= new Date(task.endTime).getTime();
  const isExpired = Date.now() > new Date(task.endTime).getTime();
  const notStarted = Date.now() < new Date(task.startTime).getTime();

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
          <button
            onClick={() => navigate(`/task/${taskId}`)}
            className="flex items-center gap-2 text-gray-500 hover:text-white text-sm mb-4 sm:mb-6 transition-colors cursor-pointer bg-transparent border-none"
          >
            <FiArrowLeft size={14} /> Back to Task
          </button>

          <AnimatedCard>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 sm:mb-6">
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-white">{task.title}</h1>
                <p className="text-gray-500 text-xs sm:text-sm mt-0.5">Subtask: <span className="text-gray-300">{subtask.title}</span></p>
              </div>
              <div className="shrink-0">
                <Timer endTime={task.endTime} startTime={task.startTime} />
              </div>
            </div>
          </AnimatedCard>

          {isExpired && (
            <AnimatedCard className="mb-5">
              <div className="bg-red-900/15 border border-red-700/40 rounded-xl p-4 flex items-center gap-3">
                <FiAlertCircle className="text-red-400 shrink-0" size={20} />
                <p className="text-red-400 text-sm font-medium">Deadline has passed. Submissions are closed.</p>
              </div>
            </AnimatedCard>
          )}

          {notStarted && (
            <AnimatedCard className="mb-5">
              <div className="bg-blue-900/15 border border-blue-700/40 rounded-xl p-4 flex items-center gap-3">
                <FiClock className="text-blue-400 shrink-0" size={20} />
                <p className="text-blue-400 text-sm font-medium">Task hasn't started yet. Please wait for the start time.</p>
              </div>
            </AnimatedCard>
          )}

          {isLocked && (
            <AnimatedCard className="mb-5">
              <div className="bg-amber-900/15 border border-amber-700/40 rounded-xl p-4 flex items-center gap-3">
                <FiLock className="text-amber-400 shrink-0" size={20} />
                <p className="text-amber-400 text-sm font-medium">This submission is locked and cannot be edited.</p>
              </div>
            </AnimatedCard>
          )}

          <AnimatedCard delay={150}>
            <SubmissionForm
              subtask={subtask}
              onSubmit={handleSubmit}
              existingResponse={existingSubmission?.response}
              disabled={!isActive || isLocked}
            />
          </AnimatedCard>

          {isActive && existingSubmission && !isLocked && (
            <AnimatedCard delay={250} className="mt-4">
              <button
                onClick={handleLock}
                className="w-full flex items-center justify-center gap-2 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/30 text-amber-400 font-semibold py-2.5 rounded-xl transition-all cursor-pointer text-sm hover:scale-[1.01] active:scale-[0.99]"
              >
                <FiLock size={14} />
                Lock Submission (Prevent Edits)
              </button>
            </AnimatedCard>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default SubmissionPage;
