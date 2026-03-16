/**
 * MetricCard — A glowing dark card that displays a single live metric.
 * Shows an icon, label, value, unit, and optional trend indicator.
 */
export default function MetricCard({ label, value, unit, icon, color = 'cyan', trend }) {
    // Map color names to Tailwind-compatible classes
    const colorMap = {
        cyan: { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', glow: 'shadow-[0_0_15px_rgba(6,182,212,0.12)]' },
        blue: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', glow: 'shadow-[0_0_15px_rgba(59,130,246,0.12)]' },
        green: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.12)]' },
        amber: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.12)]' },
        rose: { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', glow: 'shadow-[0_0_15px_rgba(244,63,94,0.12)]' },
        violet: { text: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/30', glow: 'shadow-[0_0_15px_rgba(139,92,246,0.12)]' },
    };

    const c = colorMap[color] || colorMap.cyan;

    return (
        <div
            className={`
        relative rounded-xl border ${c.border} ${c.bg} ${c.glow}
        p-5 transition-all duration-300 hover:scale-[1.02]
        hover:border-opacity-60 animate-fade-in
      `}
        >
            {/* Icon badge */}
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${c.bg} mb-3`}>
                <span className={`text-xl ${c.text}`}>{icon}</span>
            </div>

            {/* Label */}
            <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">{label}</p>

            {/* Value */}
            <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-bold tabular-nums ${c.text}`}>
                    {value !== null && value !== undefined ? Number(value).toFixed(1) : '—'}
                </span>
                <span className="text-sm text-slate-500">{unit}</span>
            </div>

            {/* Trend indicator */}
            {trend !== undefined && (
                <div className={`mt-2 text-xs font-medium ${trend >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {trend >= 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(1)}%
                </div>
            )}

            {/* Live indicator dot */}
            <div className="absolute top-3 right-3">
                <span className={`inline-block w-2 h-2 rounded-full ${c.text.replace('text-', 'bg-')} pulse-dot`} />
            </div>
        </div>
    );
}
