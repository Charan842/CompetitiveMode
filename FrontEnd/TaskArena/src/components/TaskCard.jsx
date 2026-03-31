import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDate, formatTime } from '../utils/formatDate';
import { FiCalendar, FiClock, FiLayers, FiArrowRight, FiTrash2 } from 'react-icons/fi';
import DifficultyBadge from './DifficultyBadge';

const categoryColors = {
  DSA: 'bg-violet-500/15 text-violet-300 border-violet-500/25',
  Study: 'bg-blue-500/15 text-blue-300 border-blue-500/25',
  Fitness: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  Custom: 'bg-orange-500/15 text-orange-300 border-orange-500/25',
};

const categoryGlow = {
  DSA: 'hover:shadow-violet-500/10',
  Study: 'hover:shadow-blue-500/10',
  Fitness: 'hover:shadow-emerald-500/10',
  Custom: 'hover:shadow-orange-500/10',
};

// onDelete — passed when current user may delete
// hasResult — true when result has been computed for this task
const TaskCard = ({ task, onDelete, hasResult }) => {
  const [confirm, setConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isActive = Date.now() >= new Date(task.startTime).getTime() &&
                   Date.now() <= new Date(task.endTime).getTime();
  const isExpired = Date.now() > new Date(task.endTime).getTime();
  const notStarted = Date.now() < new Date(task.startTime).getTime();

  // Can delete before start (creator only) OR after result (any participant)
  const canDelete = !!onDelete && (notStarted || hasResult);

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleting(true);
    try {
      await onDelete(task._id);
    } finally {
      setDeleting(false);
      setConfirm(false);
    }
  };

  return (
    <div className={`glass-panel rounded-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${categoryGlow[task.category] || categoryGlow.Custom} ${
      isActive ? 'border-red-500/30 shadow-md shadow-red-500/10' : 'hover:border-red-500/25'
    }`}>
      <Link to={`/task/${task._id}`} className="block no-underline group p-4 sm:p-5">
        <div className="flex items-start justify-between mb-3 gap-2">
          <h3 className="text-white font-semibold text-base sm:text-lg group-hover:text-red-300 transition-colors">
            {task.title}
          </h3>
          <div className="flex items-center gap-2 shrink-0">
            {task.difficulty && <DifficultyBadge difficulty={task.difficulty} />}
            <span className={`text-xs px-2 py-1 rounded-full border ${categoryColors[task.category] || categoryColors.Custom}`}>
              {task.category}
            </span>
          </div>
        </div>

        <p className="text-slate-400 text-sm mb-4 line-clamp-2">{task.description}</p>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <FiCalendar size={12} />
            {formatDate(task.date)}
          </span>
          <span className="flex items-center gap-1">
            <FiClock size={12} />
            {formatTime(task.startTime)} - {formatTime(task.endTime)}
          </span>
          <span className="flex items-center gap-1">
            <FiLayers size={12} />
            {task.subtasks?.length || 0} subtasks
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div>
            {isActive && (
              <span className="inline-flex items-center gap-1.5 text-xs bg-red-500/15 text-red-400 px-2.5 py-1 rounded-full border border-red-500/25">
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
                LIVE
              </span>
            )}
            {isExpired && (
              <span className="text-xs bg-slate-800/60 text-slate-500 px-2.5 py-1 rounded-full border border-slate-700/40">
                ENDED
              </span>
            )}
            {notStarted && (
              <span className="text-xs bg-blue-500/10 text-blue-400/80 px-2.5 py-1 rounded-full border border-blue-500/20">
                UPCOMING
              </span>
            )}
          </div>
          <FiArrowRight className="text-slate-600 group-hover:text-red-400 group-hover:translate-x-1 transition-all" size={14} />
        </div>
      </Link>

      {/* Delete row — only for creator, only before start */}
      {canDelete && (
        <div
          className="border-t border-red-950/30 px-4 py-2"
          onClick={(e) => e.stopPropagation()}
        >
          {!confirm ? (
            <button
              onClick={(e) => { e.preventDefault(); setConfirm(true); }}
              className="flex items-center gap-1.5 text-xs text-slate-700 hover:text-red-400 transition-colors cursor-pointer bg-transparent border-none py-0.5"
            >
              <FiTrash2 size={11} />
              Delete task
            </button>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-slate-500">Delete this task?</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.preventDefault(); setConfirm(false); }}
                  disabled={deleting}
                  className="text-xs text-slate-500 hover:text-white px-2 py-1 rounded transition-colors cursor-pointer bg-transparent border-none"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex items-center gap-1 text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-lg hover:bg-red-500/20 transition-colors cursor-pointer disabled:opacity-40"
                >
                  {deleting ? (
                    <div className="w-3 h-3 border border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                  ) : (
                    <FiTrash2 size={11} />
                  )}
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskCard;
