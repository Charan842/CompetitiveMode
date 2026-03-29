import { Link } from 'react-router-dom';
import { formatDate, formatTime } from '../utils/formatDate';
import { FiCalendar, FiClock, FiLayers, FiArrowRight } from 'react-icons/fi';
import DifficultyBadge from './DifficultyBadge';

const categoryColors = {
  DSA: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  Study: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  Fitness: 'bg-green-500/20 text-green-300 border-green-500/30',
  Custom: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
};

const categoryGlow = {
  DSA: 'hover:shadow-purple-500/10',
  Study: 'hover:shadow-blue-500/10',
  Fitness: 'hover:shadow-green-500/10',
  Custom: 'hover:shadow-orange-500/10',
};

const TaskCard = ({ task }) => {
  const isActive = Date.now() >= new Date(task.startTime).getTime() &&
                   Date.now() <= new Date(task.endTime).getTime();
  const isExpired = Date.now() > new Date(task.endTime).getTime();
  const unitLabel = task.category === 'DSA' ? 'questions' : 'subtasks';

  return (
    <Link
      to={`/task/${task._id}`}
      className="block no-underline group"
    >
      <div className={`bg-gray-800 border rounded-xl p-4 sm:p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${categoryGlow[task.category] || categoryGlow.Custom} ${
        isActive
          ? 'border-green-500/40 shadow-md shadow-green-500/5'
          : 'border-gray-700 hover:border-yellow-500/50'
      }`}>
        <div className="flex items-start justify-between mb-3 gap-2">
          <h3 className="text-white font-semibold text-base sm:text-lg group-hover:text-yellow-300 transition-colors">
            {task.title}
          </h3>
          <div className="flex items-center gap-2 shrink-0">
            {task.difficulty && <DifficultyBadge difficulty={task.difficulty} />}
            <span className={`text-xs px-2 py-1 rounded-full border ${categoryColors[task.category] || categoryColors.Custom}`}>
              {task.category}
            </span>
          </div>
        </div>

        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{task.description}</p>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-gray-500">
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
            {task.subtasks?.length || 0} {unitLabel}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div>
            {isActive && (
              <span className="inline-flex items-center gap-1.5 text-xs bg-green-500/20 text-green-400 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                LIVE
              </span>
            )}
            {isExpired && (
              <span className="text-xs bg-red-500/15 text-red-400/80 px-2.5 py-1 rounded-full">
                ENDED
              </span>
            )}
            {!isActive && !isExpired && (
              <span className="text-xs bg-blue-500/15 text-blue-400 px-2.5 py-1 rounded-full">
                UPCOMING
              </span>
            )}
          </div>
          <FiArrowRight className="text-gray-600 group-hover:text-yellow-400 group-hover:translate-x-1 transition-all" size={14} />
        </div>
      </div>
    </Link>
  );
};

export default TaskCard;
