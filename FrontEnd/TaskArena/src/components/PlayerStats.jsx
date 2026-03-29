import { useEffect, useState } from 'react';
import { FiAward, FiXCircle, FiMinus } from 'react-icons/fi';

const PlayerStats = ({ user }) => {
  const [animatedRate, setAnimatedRate] = useState(0);

  const total = (user?.totalWins || 0) + (user?.totalLosses || 0) + (user?.totalDraws || 0);
  const winRate = total > 0 ? Math.round((user.totalWins / total) * 100) : 0;

  useEffect(() => {
    if (!user) return;
    const t = setTimeout(() => setAnimatedRate(winRate), 300);
    return () => clearTimeout(t);
  }, [winRate, user]);

  if (!user) return null;

  return (
    <div className="glass-panel scan-line rounded-2xl p-4 sm:p-5 hover:border-cyan-400/25 transition-colors">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-9 h-9 avatar-shell rounded-full flex items-center justify-center text-cyan-200 font-bold text-sm shrink-0">
          {user.username.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-cyan-200/60">Player Node</p>
          <h3 className="text-white font-semibold text-sm sm:text-base truncate">{user.username}</h3>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <StatItem icon={FiAward} color="green" value={user.totalWins} label="Wins" />
        <StatItem icon={FiXCircle} color="red" value={user.totalLosses} label="Losses" />
        <StatItem icon={FiMinus} color="gray" value={user.totalDraws} label="Draws" />
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-slate-400">Win Rate</span>
          <span className="text-cyan-300 font-bold">{winRate}%</span>
        </div>
        <div className="bg-slate-950/80 rounded-full h-2.5 overflow-hidden border border-white/5">
          <div
            className="bg-gradient-to-r from-cyan-400 via-sky-300 to-amber-300 h-full rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${animatedRate}%` }}
          />
        </div>
      </div>
    </div>
  );
};

const StatItem = ({ icon: Icon, color, value, label }) => {
  const colors = {
    green: 'text-emerald-300 bg-emerald-400/10',
    red: 'text-rose-300 bg-rose-400/10',
    gray: 'text-slate-300 bg-slate-400/10',
  };

  return (
    <div className="text-center">
      <div className={`w-8 h-8 rounded-lg mx-auto mb-1.5 flex items-center justify-center ${colors[color]}`}>
        <Icon size={15} />
      </div>
      <p className={`text-xl sm:text-2xl font-bold ${colors[color].split(' ')[0]}`}>{value}</p>
      <p className="text-[10px] text-slate-500 uppercase tracking-[0.22em]">{label}</p>
    </div>
  );
};

export default PlayerStats;
