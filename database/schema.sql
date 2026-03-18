-- Motor Monitoring System Database Schema (PostgreSQL for Supabase)
-- Run this in the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS motor_readings (
  id SERIAL PRIMARY KEY,
  motor_speed REAL NOT NULL,
  torque REAL NOT NULL,
  phase_r REAL NOT NULL,
  phase_y REAL NOT NULL,
  phase_b REAL NOT NULL,
  inverter_current REAL NOT NULL,
  dc_voltage REAL NOT NULL,
  pwm_frequency REAL NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index on timestamp for efficient time-range queries
CREATE INDEX IF NOT EXISTS idx_timestamp ON motor_readings(timestamp);
