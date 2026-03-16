/**
 * Header — Top navigation bar with branding and connection status.
 */
export default function Header({ connected }) {
    return (
        <header className="sticky top-0 z-50 border-b border-slate-800 bg-[#0a0e17]/90 backdrop-blur-md">
            <div className="max-w-[1440px] mx-auto flex items-center justify-between px-6 py-3">
                {/* Logo & Title */}
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                        <span className="text-white font-bold text-sm">⚡</span>
                    </div>
                    <div>
                        <h1 className="text-base font-bold text-white tracking-tight">EV Single-Motor Drive System</h1>
                        <p className="text-[10px] uppercase tracking-widest text-slate-500">Real-Time Motor Monitoring System</p>
                    </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-2">
                    <span
                        className={`inline-block w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 pulse-dot' : 'bg-rose-500'
                            }`}
                    />
                    <span className={`text-xs font-medium ${connected ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {connected ? 'Live' : 'Disconnected'}
                    </span>
                </div>
            </div>
        </header>
    );
}
