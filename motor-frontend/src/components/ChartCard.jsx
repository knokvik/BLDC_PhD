/**
 * ChartCard — A container card that wraps a Recharts chart
 * with a consistent dark industrial styling.
 */
export default function ChartCard({ title, subtitle, children }) {
    return (
        <div
            className="
        rounded-xl border border-slate-700/50 bg-[#111827]/80
        backdrop-blur-sm p-5 animate-slide-up
        transition-all duration-300 hover:border-slate-600/60
      "
        >
            {/* Header */}
            <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-200 tracking-wide">{title}</h3>
                {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
            </div>

            {/* Chart */}
            <div className="w-full" style={{ height: 220 }}>
                {children}
            </div>
        </div>
    );
}
