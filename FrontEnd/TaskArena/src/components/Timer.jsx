import useTimer from '../hooks/useTimer';
import { FiClock, FiAlertTriangle } from 'react-icons/fi';

const Timer = ({ endTime, startTime }) => {
  const { timeLeft, formatted, isExpired } = useTimer(endTime);
  const hasStarted = startTime ? Date.now() >= new Date(startTime).getTime() : true;

  const totalSeconds = timeLeft.hours * 3600 + timeLeft.minutes * 60 + timeLeft.seconds;
  const isUrgent = !isExpired && totalSeconds > 0 && totalSeconds <= 300;
  const isCritical = !isExpired && totalSeconds > 0 && totalSeconds <= 60;

  if (!hasStarted) {
    return (
      <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-700/40 rounded-lg px-3 py-2 sm:px-4 backdrop-blur-sm">
        <div className="relative">
          <FiClock className="text-slate-400" size={16} />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-slate-400 rounded-full animate-ping" />
        </div>
        <span className="text-slate-300 font-mono text-xs sm:text-sm">Starts soon...</span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 rounded-lg px-3 py-2 sm:px-4 border backdrop-blur-sm transition-all duration-300 ${
        isExpired
          ? 'bg-red-950/40 border-red-700/50'
          : isCritical
          ? 'bg-red-950/60 border-red-500 shadow-lg shadow-red-500/25 animate-pulse'
          : isUrgent
          ? 'bg-red-950/30 border-red-600/50 shadow-md shadow-red-600/15'
          : 'bg-black/40 border-red-900/30'
      }`}
    >
      {isCritical ? (
        <FiAlertTriangle className="text-red-400 animate-bounce" size={16} />
      ) : isUrgent ? (
        <FiAlertTriangle className="text-red-500" size={16} />
      ) : (
        <FiClock className={isExpired ? 'text-red-500' : 'text-red-400/70'} size={16} />
      )}
      <div className="flex flex-col items-start">
        <span
          className={`font-mono text-sm sm:text-lg font-bold tracking-wider ${
            isExpired
              ? 'text-red-500'
              : isCritical
              ? 'text-red-400'
              : isUrgent
              ? 'text-red-400'
              : 'text-slate-200'
          }`}
        >
          {isExpired ? 'TIME UP' : formatted}
        </span>
        {isUrgent && !isExpired && (
          <span className="text-[10px] text-red-500/80 font-semibold uppercase tracking-wide">
            Hurry up!
          </span>
        )}
      </div>
    </div>
  );
};

export default Timer;
