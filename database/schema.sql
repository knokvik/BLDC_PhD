-- Motor Monitoring System Database Schema
-- Run this file to set up the database:
--   mysql -u root -p < database/schema.sql

CREATE DATABASE IF NOT EXISTS motor_monitoring;
USE motor_monitoring;

CREATE TABLE IF NOT EXISTS motor_readings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  motor_speed FLOAT NOT NULL,
  torque FLOAT NOT NULL,
  phase_r FLOAT NOT NULL,
  phase_y FLOAT NOT NULL,
  phase_b FLOAT NOT NULL,
  inverter_current FLOAT NOT NULL,
  dc_voltage FLOAT NOT NULL,
  pwm_frequency FLOAT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index on timestamp for efficient time-range queries
CREATE INDEX idx_timestamp ON motor_readings(timestamp);
