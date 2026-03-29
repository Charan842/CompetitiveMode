const difficultyConfig = {
  Easy: {
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    icon: "●",
    glow: "shadow-emerald-500/20",
  },
  Medium: {
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    icon: "●●",
    glow: "shadow-amber-500/20",
  },
  Hard: {
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    icon: "●●●",
    glow: "shadow-red-500/20",
  },
};

export default function DifficultyBadge({ difficulty, size = "sm" }) {
  const config = difficultyConfig[difficulty] || difficultyConfig.Medium;

  const sizeClasses =
    size === "lg"
      ? "px-3 py-1.5 text-sm gap-2"
      : "px-2 py-0.5 text-xs gap-1.5";

  return (
    <span
      className={`inline-flex items-center ${sizeClasses} rounded-full border ${config.bg} ${config.border} ${config.color} font-semibold shadow-sm ${config.glow} transition-all duration-200 hover:scale-105`}
    >
      <span className="tracking-tighter text-[0.6em] leading-none">
        {config.icon}
      </span>
      {difficulty}
    </span>
  );
}
