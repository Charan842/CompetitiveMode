import { Link } from 'react-router-dom';
import { formatDate, formatTime } from '../utils/formatDate';
import { FiCalendar, FiClock, FiLayers, FiArrowRight } from 'react-icons/fi';
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

const TaskCard = ({ task }) => {
  const isActive = Date.now() >= new Date(task.startTime).getTime() &&
                   Date.now() <= new Date(task.endTime).getTime();
  const isExpired = Date.now() > new Date(task.endTime).getTime();

  return (
    <Link to={`/task/${task._id}`} className="block no-underline group">
      <div className={`glass-panel rounded-xl p-4 sm:p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${categoryGlow[task.category] || categoryGlow.Custom} ${
        isActive
          ? 'border-red-500/30 shadow-md shadow-red-500/10'
          : 'hover:border-red-500/25'
      }`}>
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
            {!isActive && !isExpired && (
              <span className="text-xs bg-blue-500/10 text-blue-400/80 px-2.5 py-1 rounded-full border border-blue-500/20">
                UPCOMING
              </span>
            )}
          </div>
          <FiArrowRight className="text-slate-600 group-hover:text-red-400 group-hover:translate-x-1 transition-all" size={14} />
        </div>
      </div>
    </Link>
  );
};

export default TaskCard;
