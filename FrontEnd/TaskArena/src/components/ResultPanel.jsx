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
    <div className={`glass-panel rounded-xl overflow-hidden transition-all duration-700 ${show ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
      {/* Winner banner */}
      <div className={`py-6 px-4 text-center relative overflow-hidden ${
        isDraw
          ? 'bg-gradient-to-r from-slate-800/60 via-slate-700/30 to-slate-800/60'
          : 'bg-gradient-to-r from-red-950/60 via-red-900/20 to-red-950/60'
      }`}>
        {!isDraw && (
          <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 to-transparent pointer-events-none" />
        )}
        {isDraw ? (
          <div className={`transition-all duration-500 delay-300 relative ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <span className="text-5xl block mb-2">🤝</span>
            <h3 className="text-slate-200 text-xl font-bold">It's a Draw!</h3>
            <p className="text-slate-500 text-sm mt-1">Both players matched evenly</p>
          </div>
        ) : (
          <div className={`transition-all duration-500 delay-300 relative ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <span className="text-5xl block mb-2">🏆</span>
            <h3 className="text-red-400 text-xl font-bold display-title">
              {winner?.username || 'Winner'} Wins!
            </h3>
            <p className="text-red-400/40 text-sm mt-1 uppercase tracking-wider text-xs">Champion of this round</p>
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
        ? 'bg-gradient-to-br from-red-900/30 to-red-950/20 border-red-500/30 shadow-lg shadow-red-500/10'
        : 'bg-black/30 border-slate-800/60'
    }`}
    style={{ transitionDelay: `${delay}ms`, opacity: show ? 1 : 0, transform: show ? 'translateY(0)' : 'translateY(12px)' }}
  >
    <div className="flex items-center gap-2 mb-3">
      {isWinner && <FiAward className="text-red-400 shrink-0" size={18} />}
      <span className="text-white font-semibold text-sm sm:text-base truncate">
        {stats.userId?.username || 'Player'}
      </span>
    </div>
    <div className="space-y-2.5 text-sm">
      <div className="flex items-center gap-2 text-slate-500">
        <FiTrendingUp size={13} className="shrink-0" />
        <span className="text-xs sm:text-sm">Completed: <span className="text-white font-bold">{stats.completedCount}</span></span>
      </div>
      <div className="flex items-center gap-2 text-slate-500">
        <FiClock size={13} className="shrink-0" />
        <span className="text-xs sm:text-sm">Time: <span className="text-white font-bold">{formatDuration(stats.totalTime)}</span></span>
      </div>
    </div>
    {isWinner && (
      <div className="mt-3 pt-2 border-t border-red-500/20">
        <span className="text-[10px] text-red-400/60 uppercase tracking-widest font-bold">Winner</span>
      </div>
    )}
  </div>
);

export default ResultPanel;
