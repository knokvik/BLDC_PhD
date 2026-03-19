// ============================================================
// Motor Monitoring System — Backend Server
// Express + PostgreSQL + MQTT + Socket.IO
// ============================================================

require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { Pool } = require('pg');
const mqtt = require('mqtt');

// ── Configuration ───────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const DB_CONFIG = {
  connectionString: process.env.DATABASE_URL, // e.g., postgresql://user:password@host:port/dbname
};
const MQTT_URL = process.env.MQTT_URL || 'mqtt://localhost';
const SIMULATION = process.env.SIMULATION === 'true';
const MQTT_TOPIC = 'motor/data';

// ── Express + Socket.IO setup ───────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

// ── PostgreSQL connection pool ───────────────────────────────────
let pool;

async function initDatabase() {
  try {
    pool = new Pool(DB_CONFIG);
    // Verify connection
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL database');
    client.release();
  } catch (err) {
    console.error('❌ PostgreSQL connection failed:', err.message);
    console.log('⏳ Retrying in 5 seconds...');
    setTimeout(initDatabase, 5000);
  }
}

// ── Insert a reading into the database ──────────────────────
async function insertReading(data) {
  const sql = `INSERT INTO motor_readings
    (motor_speed, torque, phase_r, phase_y, phase_b, inverter_current, dc_voltage, pwm_frequency)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`;
  const values = [
    data.motor_speed,
    data.torque,
    data.phase_r,
    data.phase_y,
    data.phase_b,
    data.inverter_current,
    data.dc_voltage,
    data.pwm_frequency,
  ];

  try {
    const result = await pool.query(sql, values);
    return result.rows[0].id;
  } catch (err) {
    console.error('❌ DB insert error:', err.message);
    return null;
  }
}

// ── Validate incoming motor data ────────────────────────────
function validateMotorData(data) {
  const requiredFields = [
    'motor_speed',
    'torque',
    'phase_r',
    'phase_y',
    'phase_b',
    'inverter_current',
    'dc_voltage',
    'pwm_frequency',
  ];
  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || typeof data[field] !== 'number') {
      return false;
    }
  }
  return true;
}

// ── Process incoming motor data (shared by MQTT & simulation)
async function processMotorData(data) {
  if (!validateMotorData(data)) {
    console.warn('⚠️  Invalid motor data received, skipping.');
    return;
  }

  const insertId = await insertReading(data);
  if (insertId) {
    const payload = { ...data, id: insertId, timestamp: new Date().toISOString() };
    io.emit('newData', payload);
    console.log(`📡 Emitted reading #${insertId}`);
  }
}

// ── MQTT client ─────────────────────────────────────────────
function initMQTT() {
  if (SIMULATION) {
    console.log('🔁 Simulation mode enabled — skipping MQTT broker connection.');
    return;
  }

  const client = mqtt.connect(MQTT_URL, {
    reconnectPeriod: 5000, // auto-reconnect every 5 s
    connectTimeout: 10000,
  });

  client.on('connect', () => {
    console.log('✅ Connected to MQTT broker');
    client.subscribe(MQTT_TOPIC, (err) => {
      if (err) console.error('❌ MQTT subscribe error:', err.message);
      else console.log(`📥 Subscribed to topic: ${MQTT_TOPIC}`);
    });
  });

  client.on('message', async (_topic, message) => {
    try {
      const data = JSON.parse(message.toString());
      await processMotorData(data);
    } catch (err) {
      console.error('❌ Failed to parse MQTT message:', err.message);
    }
  });

  client.on('error', (err) => {
    console.error('❌ MQTT error:', err.message);
  });

  client.on('reconnect', () => {
    console.log('🔄 Reconnecting to MQTT broker...');
  });
}

// ── Simulation mode ─────────────────────────────────────────
function startSimulation() {
  if (!SIMULATION) return;
  console.log('🧪 Simulation mode: generating random data every 2 seconds');

  setInterval(async () => {
    const data = {
      motor_speed: +(1400 + Math.random() * 200).toFixed(1),
      torque: +(30 + Math.random() * 30).toFixed(1),
      phase_r: +(10 + Math.random() * 5).toFixed(2),
      phase_y: +(10 + Math.random() * 5).toFixed(2),
      phase_b: +(10 + Math.random() * 5).toFixed(2),
      inverter_current: +(12 + Math.random() * 6).toFixed(2),
      dc_voltage: +(620 + Math.random() * 40).toFixed(1),
      pwm_frequency: +(2 + Math.random() * 6).toFixed(1),
    };
    await processMotorData(data);
  }, 2000);
}

// ── REST endpoint — historical data ─────────────────────────
app.get('/api/history', async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM motor_readings ORDER BY timestamp DESC LIMIT 50'
    );
    res.json(result.rows.reverse()); // oldest-first for charts
  } catch (err) {
    console.error('❌ History query error:', err.message);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// ── Socket.IO connection logging ────────────────────────────
io.on('connection', (socket) => {
  console.log(`🟢 Client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`🔴 Client disconnected: ${socket.id}`);
  });
});

// ── Start everything ────────────────────────────────────────
(async () => {
  await initDatabase();
  initMQTT();
  startSimulation();

  server.listen(PORT, () => {
    console.log(`\n🚀 Motor Monitoring backend running on http://localhost:${PORT}`);
    console.log(`   Mode: ${SIMULATION ? 'SIMULATION' : 'LIVE (MQTT)'}\n`);
  });
})();
