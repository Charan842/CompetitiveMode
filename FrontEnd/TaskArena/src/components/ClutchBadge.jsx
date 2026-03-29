import { useState } from "react";

const clutchConfig = {
  first_blood: {
    label: "First Blood",
    icon: "🗡️",
    color: "from-red-500 to-orange-500",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    description: "First to submit a subtask",
  },
  clutch_finish: {
    label: "Clutch Finish",
    icon: "⚡",
    color: "from-yellow-400 to-amber-500",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
    description: "Submitted in the final moments",
  },
  comeback_win: {
    label: "Comeback Win",
    icon: "🔥",
    color: "from-purple-500 to-pink-500",
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
    description: "Was trailing at halftime but won",
  },
};

export default function ClutchBadge({ events, players }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!events || events.length === 0) return null;

  const getPlayerName = (userId) => {
    if (!players) return "Player";
    const player = players.find(
      (p) => p._id === userId || p._id?.toString() === userId?.toString()
    );
    return player?.username || "Player";
  };

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
        Clutch Moments
      </h4>
      <div className="flex flex-wrap gap-2">
        {events.map((event, idx) => {
          const config = clutchConfig[event.type];
          if (!config) return null;

          return (
            <div
              key={idx}
              className="relative"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${config.bg} ${config.border} cursor-default transition-all duration-300 hover:scale-105`}
              >
                <span className="text-sm">{config.icon}</span>
                <span
                  className={`text-xs font-bold bg-gradient-to-r ${config.color} bg-clip-text text-transparent`}
                >
                  {config.label}
                </span>
                <span className="text-xs text-gray-400">
                  — {getPlayerName(event.userId)}
                </span>
              </div>

              {hoveredIdx === idx && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-800 rounded-lg text-xs text-gray-300 whitespace-nowrap z-50 shadow-lg animate-[fadeInUp_0.2s_ease-out]">
                  {config.description}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
