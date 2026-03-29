export default function ConstraintBanner({ constraintText, type = "active" }) {
  if (!constraintText) return null;

  const isActive = type === "active";

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
        isActive
          ? "bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border-violet-500/30"
          : "bg-gray-800/50 border-gray-700/50"
      } animate-[fadeInUp_0.3s_ease-out]`}
    >
      <div
        className={`flex items-center justify-center w-8 h-8 rounded-lg ${
          isActive ? "bg-violet-500/20" : "bg-gray-700/50"
        }`}
      >
        <svg
          className={`w-4 h-4 ${isActive ? "text-violet-400" : "text-gray-400"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`text-xs font-semibold uppercase tracking-wider ${
            isActive ? "text-violet-400" : "text-gray-500"
          }`}
        >
          {isActive ? "Active Constraint" : "Constraint Applied"}
        </p>
        <p className="text-sm text-gray-200 truncate">{constraintText}</p>
      </div>
    </div>
  );
}
