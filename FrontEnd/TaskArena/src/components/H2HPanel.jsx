import { useState, useEffect } from "react";
import { getMatchStats } from "../services/matchService";

function StatRow({ label, valA, valB }) {
  const aWins = valA > valB;
  const bWins = valB > valA;

  return (
    <div className="flex items-center justify-between py-2 border-b border-red-900/20 last:border-0">
      <span className={`text-sm font-mono w-16 text-right ${aWins ? "text-red-400 font-bold" : "text-slate-400"}`}>
        {valA}
      </span>
      <span className="text-xs text-slate-600 uppercase tracking-wider flex-1 text-center">{label}</span>
      <span className={`text-sm font-mono w-16 text-left ${bWins ? "text-red-400 font-bold" : "text-slate-400"}`}>
        {valB}
      </span>
    </div>
  );
}

function formatTime(ms) {
  if (!ms) return "—";
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return `${mins}m ${secs}s`;
}

export default function H2HPanel({ matchId, players }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!matchId) return;
    getMatchStats(matchId)
      .then((res) => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [matchId]);

  if (loading) {
    return (
      <div className="glass-panel rounded-xl p-6 animate-pulse">
        <div className="h-4 bg-red-950/40 rounded w-1/3 mx-auto mb-4" />
        <div className="space-y-3">
          {[1,2,3,4].map((i) => <div key={i} className="h-6 bg-red-950/30 rounded" />)}
        </div>
      </div>
    );
  }

  if (!stats || !stats.h2hStats || stats.h2hStats.length < 2) return null;

  const [pA, pB] = stats.h2hStats;
  const playerA = players?.[0];
  const playerB = players?.[1];

  return (
    <div className="glass-panel rounded-xl overflow-hidden animate-[fadeInUp_0.4s_ease-out]">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500/8 via-transparent to-red-500/5 px-5 py-4 border-b border-red-900/20">
        <h3 className="text-center text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Head to Head</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 avatar-shell rounded-full flex items-center justify-center text-red-300 text-xs font-bold">
              {playerA?.username?.[0]?.toUpperCase() || "A"}
            </div>
            <span className="text-sm font-semibold text-white">{playerA?.username || "Player A"}</span>
          </div>
          <span className="display-title text-red-600 text-sm font-black">VS</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">{playerB?.username || "Player B"}</span>
            <div className="w-8 h-8 avatar-shell rounded-full flex items-center justify-center text-red-300 text-xs font-bold" style={{ filter: 'hue-rotate(160deg)' }}>
              {playerB?.username?.[0]?.toUpperCase() || "B"}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-5 py-2">
        <StatRow label="Wins" valA={pA.wins} valB={pB.wins} />
        <StatRow label="Games" valA={pA.gamesPlayed} valB={pB.gamesPlayed} />
        <StatRow label="Streak" valA={pA.currentStreak} valB={pB.currentStreak} />
        <StatRow label="Best Streak" valA={pA.longestStreak} valB={pB.longestStreak} />
        <StatRow label="Avg Time" valA={formatTime(pA.avgCompletionTime)} valB={formatTime(pB.avgCompletionTime)} />
        <StatRow label="Fastest Win" valA={formatTime(pA.fastestWinTime)} valB={formatTime(pB.fastestWinTime)} />
      </div>
    </div>
  );
}
