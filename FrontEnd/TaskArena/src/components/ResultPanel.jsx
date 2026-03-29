import { useEffect, useState } from 'react';
import { FiAward, FiTrendingUp, FiClock } from 'react-icons/fi';
import { formatDuration } from '../utils/formatDate';
import ClutchBadge from './ClutchBadge';
import InsightPanel from './InsightPanel';

const ResultPanel = ({ result }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(t);
  }, []);

  if (!result) return null;

  const { winner, isDraw, playerAStats, playerBStats, clutchEvents, insights } = result;

  return (
    <div className={`bg-gray-800 border border-gray-700 rounded-xl overflow-hidden transition-all duration-700 ${show ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
      {/* Winner banner */}
      <div className={`py-6 px-4 text-center ${isDraw ? 'bg-gradient-to-r from-gray-700/50 via-gray-600/30 to-gray-700/50' : 'bg-gradient-to-r from-yellow-600/20 via-yellow-500/10 to-yellow-600/20'}`}>
        {isDraw ? (
          <div className={`transition-all duration-500 delay-300 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <span className="text-5xl block mb-2">🤝</span>
            <h3 className="text-gray-300 text-xl font-bold">It's a Draw!</h3>
            <p className="text-gray-500 text-sm mt-1">Both players matched evenly</p>
          </div>
        ) : (
          <div className={`transition-all duration-500 delay-300 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <span className="text-5xl block mb-2">🏆</span>
            <h3 className="text-yellow-400 text-xl font-bold">
              {winner?.username || 'Winner'} Wins!
            </h3>
            <p className="text-yellow-400/50 text-sm mt-1">Champion of this round</p>
          </div>
        )}
      </div>

      {/* Stats comparison */}
      <div className="p-4 sm:p-6 space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <PlayerStatBox
            stats={playerAStats}
            isWinner={!isDraw && winner?._id === playerAStats.userId?._id}
            delay={500}
            show={show}
          />
          <PlayerStatBox
            stats={playerBStats}
            isWinner={!isDraw && winner?._id === playerBStats.userId?._id}
            delay={650}
            show={show}
          />
        </div>

        {/* Clutch Moments */}
        {clutchEvents && clutchEvents.length > 0 && (
          <div className={`transition-all duration-500 delay-[800ms] ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <ClutchBadge
              events={clutchEvents}
              players={[playerAStats.userId, playerBStats.userId].filter(Boolean)}
            />
          </div>
        )}

        {/* Insights */}
        {insights && insights.length > 0 && (
          <div className={`transition-all duration-500 delay-[1000ms] ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <InsightPanel insights={insights} />
          </div>
        )}
      </div>
    </div>
  );
};

const PlayerStatBox = ({ stats, isWinner, delay, show }) => (
  <div
    className={`rounded-xl p-3 sm:p-4 border transition-all duration-500 ${
      isWinner
        ? 'bg-gradient-to-br from-yellow-500/15 to-yellow-600/5 border-yellow-500/40 shadow-lg shadow-yellow-500/5'
        : 'bg-gray-900/50 border-gray-700'
    }`}
    style={{ transitionDelay: `${delay}ms`, opacity: show ? 1 : 0, transform: show ? 'translateY(0)' : 'translateY(12px)' }}
  >
    <div className="flex items-center gap-2 mb-3">
      {isWinner && <FiAward className="text-yellow-400 shrink-0" size={18} />}
      <span className="text-white font-semibold text-sm sm:text-base truncate">
        {stats.userId?.username || 'Player'}
      </span>
    </div>
    <div className="space-y-2.5 text-sm">
      <div className="flex items-center gap-2 text-gray-400">
        <FiTrendingUp size={13} className="shrink-0" />
        <span className="text-xs sm:text-sm">Completed: <span className="text-white font-bold">{stats.completedCount}</span></span>
      </div>
      <div className="flex items-center gap-2 text-gray-400">
        <FiClock size={13} className="shrink-0" />
        <span className="text-xs sm:text-sm">Time: <span className="text-white font-bold">{formatDuration(stats.totalTime)}</span></span>
      </div>
    </div>
    {isWinner && (
      <div className="mt-3 pt-2 border-t border-yellow-500/20">
        <span className="text-[10px] text-yellow-400/70 uppercase tracking-widest font-semibold">Winner</span>
      </div>
    )}
  </div>
);

export default ResultPanel;
