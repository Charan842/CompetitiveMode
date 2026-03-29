import { useState, useEffect } from "react";
import { getMatchStats } from "../services/matchService";

function StatRow({ label, valA, valB, highlight = false }) {
  const aWins = valA > valB;
  const bWins = valB > valA;

  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-700/50 last:border-0">
      <span
        className={`text-sm font-mono w-16 text-right ${
          aWins ? "text-cyan-400 font-bold" : "text-gray-300"
        }`}
      >
        {valA}
      </span>
      <span className="text-xs text-gray-500 uppercase tracking-wider flex-1 text-center">
        {label}
      </span>
      <span
        className={`text-sm font-mono w-16 text-left ${
          bWins ? "text-orange-400 font-bold" : "text-gray-300"
        }`}
      >
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
      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6 animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-1/3 mx-auto mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-6 bg-gray-700/50 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats || !stats.h2hStats || stats.h2hStats.length < 2) {
    return null;
  }

  const [pA, pB] = stats.h2hStats;
  const playerA = players?.[0];
  const playerB = players?.[1];

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden animate-[fadeInUp_0.4s_ease-out]">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-500/10 via-transparent to-orange-500/10 px-6 py-4 border-b border-gray-700/50">
        <h3 className="text-center text-sm font-bold text-gray-300 uppercase tracking-wider">
          Head to Head
        </h3>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
              {playerA?.username?.[0]?.toUpperCase() || "A"}
            </div>
            <span className="text-sm font-semibold text-cyan-400">
              {playerA?.username || "Player A"}
            </span>
          </div>
          <span className="text-gray-600 text-xs font-bold">VS</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-orange-400">
              {playerB?.username || "Player B"}
            </span>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white text-xs font-bold">
              {playerB?.username?.[0]?.toUpperCase() || "B"}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 py-3">
        <StatRow label="Wins" valA={pA.wins} valB={pB.wins} />
        <StatRow label="Games" valA={pA.gamesPlayed} valB={pB.gamesPlayed} />
        <StatRow label="Streak" valA={pA.currentStreak} valB={pB.currentStreak} />
        <StatRow label="Best Streak" valA={pA.longestStreak} valB={pB.longestStreak} />
        <StatRow
          label="Avg Time"
          valA={formatTime(pA.avgCompletionTime)}
          valB={formatTime(pB.avgCompletionTime)}
        />
        <StatRow
          label="Fastest Win"
          valA={formatTime(pA.fastestWinTime)}
          valB={formatTime(pB.fastestWinTime)}
        />
      </div>
    </div>
  );
}
