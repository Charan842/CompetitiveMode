import useTimer from '../hooks/useTimer';
import { FiClock, FiAlertTriangle } from 'react-icons/fi';

const Timer = ({ endTime, startTime, onDeadlineApproaching }) => {
  const { timeLeft, formatted, isExpired } = useTimer(endTime);
  const hasStarted = startTime ? Date.now() >= new Date(startTime).getTime() : true;

  const totalSeconds = timeLeft.hours * 3600 + timeLeft.minutes * 60 + timeLeft.seconds;
  const isUrgent = !isExpired && totalSeconds > 0 && totalSeconds <= 300; // 5 min
  const isCritical = !isExpired && totalSeconds > 0 && totalSeconds <= 60; // 1 min

  if (!hasStarted) {
    return (
      <div className="flex items-center gap-2 bg-blue-900/30 border border-blue-500/30 rounded-lg px-3 py-2 sm:px-4 backdrop-blur-sm">
        <div className="relative">
          <FiClock className="text-blue-400" size={16} />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-400 rounded-full animate-ping" />
        </div>
        <span className="text-blue-300 font-mono text-xs sm:text-sm">Starts soon...</span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 rounded-lg px-3 py-2 sm:px-4 border backdrop-blur-sm transition-all duration-300 ${
        isExpired
          ? 'bg-red-900/30 border-red-700/50'
          : isCritical
          ? 'bg-red-900/40 border-red-500 shadow-lg shadow-red-500/20 animate-pulse'
          : isUrgent
          ? 'bg-orange-900/30 border-orange-500/50 shadow-md shadow-orange-500/10'
          : 'bg-yellow-900/20 border-yellow-700/50'
      }`}
    >
      {isCritical ? (
        <FiAlertTriangle className="text-red-400 animate-bounce" size={16} />
      ) : isUrgent ? (
        <FiAlertTriangle className="text-orange-400" size={16} />
      ) : (
        <FiClock className={isExpired ? 'text-red-400' : 'text-yellow-400'} size={16} />
      )}
      <div className="flex flex-col items-start">
        <span
          className={`font-mono text-sm sm:text-lg font-bold tracking-wider ${
            isExpired
              ? 'text-red-400'
              : isCritical
              ? 'text-red-300'
              : isUrgent
              ? 'text-orange-300'
              : 'text-yellow-300'
          }`}
        >
          {isExpired ? 'TIME UP' : formatted}
        </span>
        {isUrgent && !isExpired && (
          <span className="text-[10px] text-orange-400/80 font-medium uppercase tracking-wide">
            Hurry up!
          </span>
        )}
      </div>
    </div>
  );
};

export default Timer;
