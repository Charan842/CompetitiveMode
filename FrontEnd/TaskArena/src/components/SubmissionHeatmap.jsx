import { useState, useEffect } from "react";
import { getActivityHeatmap } from "../services/matchService";

export default function SubmissionHeatmap({ matchId, currentUserId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!matchId) return;
    getActivityHeatmap(matchId)
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [matchId]);

  if (loading) {
    return (
      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6 animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-1/3 mb-4" />
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 28 }).map((_, i) => (
            <div key={i} className="w-5 h-5 bg-gray-700/50 rounded-sm" />
          ))}
        </div>
      </div>
    );
  }

  if (!data || Object.keys(data).length === 0) {
    return null;
  }

  // Generate last 28 days of dates
  const days = [];
  for (let i = 27; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }

  const getIntensity = (dateKey) => {
    if (!data[dateKey] || !currentUserId) return 0;
    return data[dateKey][currentUserId] || 0;
  };

  const getColor = (count) => {
    if (count === 0) return "bg-gray-700/40";
    if (count === 1) return "bg-emerald-900/60";
    if (count === 2) return "bg-emerald-700/70";
    if (count <= 4) return "bg-emerald-500/80";
    return "bg-emerald-400";
  };

  const weekLabels = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4 animate-[fadeInUp_0.4s_ease-out]">
      <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
        <svg
          className="w-4 h-4 text-emerald-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        Activity (Last 4 Weeks)
      </h4>

      <div className="flex gap-1">
        {/* Day labels column */}
        <div className="flex flex-col gap-1 mr-1">
          {weekLabels.map((label, i) => (
            <div
              key={i}
              className="w-5 h-5 flex items-center justify-center text-[10px] text-gray-500"
            >
              {label}
            </div>
          ))}
        </div>

        {/* Grid - 4 columns of 7 rows */}
        {[0, 1, 2, 3].map((week) => (
          <div key={week} className="flex flex-col gap-1">
            {[0, 1, 2, 3, 4, 5, 6].map((day) => {
              const idx = week * 7 + day;
              const dateKey = days[idx];
              const count = dateKey ? getIntensity(dateKey) : 0;

              return (
                <div
                  key={day}
                  className={`w-5 h-5 rounded-sm ${getColor(count)} transition-all duration-200 hover:ring-1 hover:ring-white/30 cursor-default`}
                  title={dateKey ? `${dateKey}: ${count} submission${count !== 1 ? "s" : ""}` : ""}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1 mt-3 justify-end">
        <span className="text-[10px] text-gray-500 mr-1">Less</span>
        {[0, 1, 2, 3, 5].map((c) => (
          <div
            key={c}
            className={`w-3 h-3 rounded-sm ${getColor(c)}`}
          />
        ))}
        <span className="text-[10px] text-gray-500 ml-1">More</span>
      </div>
    </div>
  );
}
