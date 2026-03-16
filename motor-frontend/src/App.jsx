/**
 * App.jsx — Main dashboard for Real-Time Motor Monitoring System.
 * Connects to backend via Socket.IO, displays live metrics & Recharts charts.
 */
import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

import Header from './components/Header';
import MetricCard from './components/MetricCard';
import ChartCard from './components/ChartCard';

// ── Constants ────────────────────────────────────────────────
const BACKEND_URL = 'http://localhost:5005';
const MAX_POINTS = 50;

// ── Custom Recharts Tooltip ──────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800/95 border border-slate-700 rounded-lg px-3 py-2 shadow-xl backdrop-blur-sm">
      <p className="text-[10px] text-slate-400 mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-xs font-medium" style={{ color: entry.color }}>
          {entry.name}: {Number(entry.value).toFixed(2)}
        </p>
      ))}
    </div>
  );
}

// ── Chart theme constants ────────────────────────────────────
const GRID_STYLE = { strokeDasharray: '3 3', stroke: '#1e293b' };
const AXIS_STYLE = { fontSize: 10, fill: '#64748b' };
const AXIS_LINE = { stroke: '#1e293b' };

export default function App() {
  const [data, setData] = useState([]);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  // Fetch history on mount, then subscribe to live updates
  useEffect(() => {
    // Load historical data
    axios.get(`${BACKEND_URL}/api/history`)
      .then((res) => {
        const formatted = res.data.map(formatReading);
        setData(formatted.slice(-MAX_POINTS));
      })
      .catch((err) => console.warn('History fetch failed:', err.message));

    // Socket.IO connection
    const socket = io(BACKEND_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('newData', (reading) => {
      const entry = formatReading(reading);
      setData((prev) => [...prev.slice(-(MAX_POINTS - 1)), entry]);
    });

    return () => socket.disconnect();
  }, []);

  // Latest reading for metric cards
  const latest = data.length > 0 ? data[data.length - 1] : null;
  const prev = data.length > 1 ? data[data.length - 2] : null;

  function trend(key) {
    if (!latest || !prev || !prev[key]) return undefined;
    return ((latest[key] - prev[key]) / prev[key]) * 100;
  }

  return (
    <div className="min-h-screen bg-[#0a0e17]">
      <Header connected={connected} />

      <main className="max-w-[1440px] mx-auto px-6 py-6 space-y-8">
        {/* ═══════ MOTOR MONITORING SECTION ═══════ */}
        <section>
          <SectionTitle emoji="⚙️" title="Real-Time Motor Parameters" />

          {/* Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <MetricCard label="Speed" value={latest?.motor_speed} unit="RPM" icon="🔄" color="cyan" trend={trend('motor_speed')} />
            <MetricCard label="Torque" value={latest?.torque} unit="Nm" icon="💪" color="blue" trend={trend('torque')} />
            <MetricCard label="Phase R" value={latest?.phase_r} unit="A" icon="🔴" color="rose" trend={trend('phase_r')} />
            <MetricCard label="Phase Y" value={latest?.phase_y} unit="A" icon="🟡" color="amber" trend={trend('phase_y')} />
            <MetricCard label="Phase B" value={latest?.phase_b} unit="A" icon="🔵" color="blue" trend={trend('phase_b')} />
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
            <ChartCard title="Phase Currents" subtitle="R (Amps)">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid {...GRID_STYLE} />
                  <XAxis dataKey="time" tick={AXIS_STYLE} axisLine={AXIS_LINE} tickLine={false} />
                  <YAxis tick={AXIS_STYLE} axisLine={AXIS_LINE} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                  <Line type="monotone" dataKey="phase_r" stroke="#f43f5e" strokeWidth={1} name="Phase R" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Phase Current" subtitle="B (Amps)">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid {...GRID_STYLE} />
                  <XAxis dataKey="time" tick={AXIS_STYLE} axisLine={AXIS_LINE} tickLine={false} />
                  <YAxis tick={AXIS_STYLE} axisLine={AXIS_LINE} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                  <Line type="monotone" dataKey="phase_y" stroke="#f59e0b" strokeWidth={1} name="Phase Y" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Phase Current" subtitle="Y (Amps)">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid {...GRID_STYLE} />
                  <XAxis dataKey="time" tick={AXIS_STYLE} axisLine={AXIS_LINE} tickLine={false} />
                  <YAxis tick={AXIS_STYLE} axisLine={AXIS_LINE} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
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
