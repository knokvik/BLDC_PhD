import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

import Header from './components/Header';
import MetricCard from './components/MetricCard';
import ChartCard from './components/ChartCard';

// ── Shared Chart Styling ────────────────────────────────────
const GRID_STYLE = { strokeDasharray: "3 3", stroke: "#334155", vertical: false };
const AXIS_STYLE = { fill: "#64748b", fontSize: 12 };
const AXIS_LINE = { stroke: "#334155" };

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 p-3 rounded shadow-lg">
        <p className="text-slate-300 text-xs mb-2 font-mono">{label}</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} className="text-sm font-medium" style={{ color: entry.color }}>
            {entry.name}: {Number(entry.value).toFixed(2)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Use VITE_BACKEND_URL or fallback to localhost
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5005';

export default function App() {
  const [data, setData] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // 1. Fetch initial history
    fetch(`${BACKEND_URL}/api/history`)
      .then(res => res.json())
      .then(history => {
        if (Array.isArray(history)) {
          setData(history.map(formatReading));
        }
      })
      .catch(err => console.error('Failed to fetch history:', err));

    // 2. Connect WebSocket
    const socket = io(BACKEND_URL);

    socket.on('connect', () => {
      console.log('✅ Connected to WebSocket');
      setConnected(true);
    });

    socket.on('disconnect', () => {
      console.warn('❌ Disconnected from WebSocket');
      setConnected(false);
    });

    socket.on('newData', (newReading) => {
      setData(prev => {
        const updated = [...prev, formatReading(newReading)];
        // Keep max 60 points on the chart to prevent performance issues
        return updated.slice(-60);
      });
    });

    return () => socket.disconnect();
  }, []);

  const latest = data[data.length - 1] || null;
  const previous = data[data.length - 2] || null;

  // Calculate trends for metric cards
  const trend = (key) => {
    if (!latest || !previous) return null;
    return latest[key] > previous[key] ? 'up' : latest[key] < previous[key] ? 'down' : 'stable';
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-200">
      <Header connected={connected} backendUrl={BACKEND_URL} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">

        {/* ═══════ MOTOR PERFORMANCE SECTION ═══════ */}
        <section>
          <SectionTitle emoji="⚙️" title="Motor Performance" />

          {/* Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <MetricCard label="Speed" value={latest?.motor_speed} unit="RPM" icon="🌪️" color="cyan" trend={trend('motor_speed')} />
            <MetricCard label="Torque" value={latest?.torque} unit="Nm" icon="🏋️" color="blue" trend={trend('torque')} />
            <MetricCard label="Phase R" value={latest?.phase_r} unit="A" icon="🔴" color="rose" trend={trend('phase_r')} />
            <MetricCard label="Phase Y" value={latest?.phase_y} unit="A" icon="🟡" color="amber" trend={trend('phase_y')} />
            <MetricCard label="Phase B" value={latest?.phase_b} unit="A" icon="🔵" color="sky" trend={trend('phase_b')} />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Speed Chart */}
            <ChartCard title="Motor Speed" subtitle="RPM over time">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="gradSpeed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...GRID_STYLE} />
                  <XAxis dataKey="time" tick={AXIS_STYLE} axisLine={AXIS_LINE} tickLine={false} />
                  <YAxis tick={AXIS_STYLE} axisLine={AXIS_LINE} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="motor_speed" stroke="#06b6d4" strokeWidth={2} fill="url(#gradSpeed)" name="Speed" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Torque Chart */}
            <ChartCard title="Torque" subtitle="Nm over time">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="gradTorque" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...GRID_STYLE} />
                  <XAxis dataKey="time" tick={AXIS_STYLE} axisLine={AXIS_LINE} tickLine={false} />
                  <YAxis tick={AXIS_STYLE} axisLine={AXIS_LINE} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="torque" stroke="#3b82f6" strokeWidth={2} fill="url(#gradTorque)" name="Torque" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Phase Current (Multi-line) */}
            <ChartCard title="Phase Currents" subtitle="R / Y / B (Amps)">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid {...GRID_STYLE} />
                  <XAxis dataKey="time" tick={AXIS_STYLE} axisLine={AXIS_LINE} tickLine={false} />
                  <YAxis tick={AXIS_STYLE} axisLine={AXIS_LINE} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                  <Line type="monotone" dataKey="phase_r" stroke="#f43f5e" strokeWidth={1} name="Phase R" dot={false} />
                  <Line type="monotone" dataKey="phase_y" stroke="#f59e0b" strokeWidth={1} name="Phase Y" dot={false} />
                  <Line type="monotone" dataKey="phase_b" stroke="#3b82f6" strokeWidth={1} name="Phase B" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </section>

        {/* ═══════ INVERTER MONITORING SECTION ═══════ */}
        <section>
          <SectionTitle emoji="🔋" title="Inverter Parameters" />

          {/* Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <MetricCard label="Current" value={latest?.inverter_current} unit="A" icon="⚡" color="green" trend={trend('inverter_current')} />
            <MetricCard label="DC Voltage" value={latest?.dc_voltage} unit="V" icon="🔌" color="violet" trend={trend('dc_voltage')} />
            <MetricCard label="PWM Freq" value={latest?.pwm_frequency} unit="kHz" icon="📊" color="amber" trend={trend('pwm_frequency')} />

          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Inverter Current Chart */}
            <ChartCard title="Inverter Current" subtitle="Amps over time">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="gradCurrent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...GRID_STYLE} />
                  <XAxis dataKey="time" tick={AXIS_STYLE} axisLine={AXIS_LINE} tickLine={false} />
                  <YAxis tick={AXIS_STYLE} axisLine={AXIS_LINE} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="inverter_current" stroke="#10b981" strokeWidth={2} fill="url(#gradCurrent)" name="Current" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* DC Voltage Chart */}
            <ChartCard title="DC Bus Voltage" subtitle="Volts over time">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="gradVoltage" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...GRID_STYLE} />
                  <XAxis dataKey="time" tick={AXIS_STYLE} axisLine={AXIS_LINE} tickLine={false} />
                  <YAxis tick={AXIS_STYLE} axisLine={AXIS_LINE} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="dc_voltage" stroke="#8b5cf6" strokeWidth={2} fill="url(#gradVoltage)" name="Voltage" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* PWM Frequency Chart */}
            <ChartCard title="PWM Frequency" subtitle="kHz over time">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="gradPWM" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...GRID_STYLE} />
                  <XAxis dataKey="time" tick={AXIS_STYLE} axisLine={AXIS_LINE} tickLine={false} />
                  <YAxis tick={AXIS_STYLE} axisLine={AXIS_LINE} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="pwm_frequency" stroke="#f59e0b" strokeWidth={2} fill="url(#gradPWM)" name="PWM Freq" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-6 border-t border-slate-800">
          <p className="text-xs text-slate-600">
            Motor Monitoring System • Real-Time Industrial IoT Dashboard • {data.length} readings loaded
          </p>
        </footer>
      </main>
    </div>
  );
}

// ── Section title component ──────────────────────────────────
function SectionTitle({ emoji, title }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <span className="text-lg">{emoji}</span>
      <h2 className="text-lg font-semibold text-slate-200 tracking-tight">{title}</h2>
      <div className="flex-1 h-px bg-gradient-to-r from-slate-700 to-transparent ml-3" />
    </div>
  );
}

// ── Format a DB row into a chart-friendly object ─────────────
function formatReading(r) {
  const ts = r.timestamp ? new Date(r.timestamp) : new Date();
  return {
    ...r,
    time: ts.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  };
}
