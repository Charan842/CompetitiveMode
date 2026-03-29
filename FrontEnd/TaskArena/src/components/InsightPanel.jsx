export default function InsightPanel({ insights }) {
  if (!insights || insights.length === 0) return null;

  return (
    <div className="mt-4 space-y-2">
      <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
        <svg
          className="w-4 h-4 text-cyan-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
        Match Insights
      </h4>
      <div className="space-y-1.5">
        {insights.map((insight, idx) => (
          <div
            key={idx}
            className="flex items-start gap-2 px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50 animate-[fadeInUp_0.3s_ease-out] transition-all hover:bg-gray-800/80"
            style={{ animationDelay: `${idx * 100}ms`, animationFillMode: "both" }}
          >
            <span className="text-cyan-400 mt-0.5 shrink-0">▸</span>
            <p className="text-sm text-gray-300 leading-relaxed">{insight}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
