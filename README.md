# 🏭 Real-Time Motor Monitoring System

Offline Industrial IoT web application for monitoring real-time motor and inverter parameters. Uses MQTT data ingestion, local MySQL storage, real-time WebSocket updates, and a React dashboard.

**Fully offline** — no cloud services required.  
**macOS compatible** — Intel & Apple Silicon (M1/M2/M3).

---

## 📐 Architecture

```
ESP8266 (or simulation mode)
  ↓
Mosquitto MQTT Broker (local)
  ↓
Node.js Backend (Express + Socket.IO)
  ↓
MySQL Server (local)
  ↓
React Frontend (Vite + TailwindCSS + Recharts)
```

---

## 🍎 macOS Setup Guide

### 1. Install Homebrew (if not installed)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

After installation, follow the terminal instructions to add Homebrew to your PATH:

```bash
echo >> ~/.zprofile
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

### 2. Install Node.js (LTS)

```bash
brew install node
```

Verify:

```bash
node -v   # e.g. v20.x.x
npm -v    # e.g. 10.x.x
```

### 3. Install & Start MySQL

```bash
brew install mysql
brew services start mysql
```

Secure the installation (set a root password):

```bash
mysql_secure_installation
```

Login to test:

```bash
mysql -u root -p
```

### 4. Install & Start Mosquitto (MQTT Broker)

```bash
brew install mosquitto
brew services start mosquitto
```

Test the broker:

```bash
# In one terminal — subscribe:
mosquitto_sub -t test

# In another terminal — publish:
mosquitto_pub -t test -m "hello"
```

---

## 🗄️ Database Setup

Create the database and table:

```bash
mysql -u root -p < database/schema.sql
```

This creates:
- Database: `motor_monitoring`
- Table: `motor_readings` (id, motor_speed, torque, phase_r, phase_y, phase_b, inverter_current, dc_voltage, pwm_frequency, timestamp)

---

## ⚙️ Backend Setup

```bash
cd motor-backend
npm install
```

### Configure environment variables

Edit `motor-backend/.env`:

```env
PORT=5005
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=    # ← set your MySQL root password
DB_NAME=motor_monitoring
MQTT_URL=mqtt://localhost
SIMULATION=true              # set to false for live MQTT mode
```

### Run the backend

```bash
node server.js
```

You should see:

```
✅ Connected to MySQL database
🧪 Simulation mode: generating random data every 2 seconds
🚀 Motor Monitoring backend running on http://localhost:5005
```

---

## 🖥️ Frontend Setup

```bash
cd motor-frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🧪 Simulation Mode

Set `SIMULATION=true` in `motor-backend/.env` to generate random motor data every 2 seconds **without** requiring an ESP8266 or Mosquitto.

The simulated data includes realistic ranges:
- Motor Speed: 1400–1600 RPM
- Torque: 30–60 Nm
- Phase Currents: 10–15 A
- Inverter Current: 12–18 A
- DC Voltage: 620–660 V
- PWM Frequency: 2–8 kHz

---

## 📡 Manual MQTT Testing

With `SIMULATION=false` and Mosquitto running, publish test data:

```bash
mosquitto_pub -t motor/data -m '{"motor_speed":1500,"torque":45,"phase_r":12,"phase_y":13,"phase_b":11,"inverter_current":14,"dc_voltage":640,"pwm_frequency":4}'
```

---

## 📦 Project Structure

```
motor/
├── database/
│   └── schema.sql              # MySQL schema
├── motor-backend/
│   ├── server.js               # Express + MQTT + Socket.IO server
│   ├── .env                    # Environment configuration
│   └── package.json
├── motor-frontend/
│   ├── src/
│   │   ├── App.jsx             # Main dashboard
│   │   ├── main.jsx            # Entry point
│   │   ├── index.css           # TailwindCSS + design tokens
│   │   └── components/
│   │       ├── Header.jsx      # Top nav bar
│   │       ├── MetricCard.jsx  # Live metric display cards
│   │       └── ChartCard.jsx   # Chart container
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## 🚀 Quick Start (TL;DR)

```bash
# 1. Start MySQL & Mosquitto
brew services start mysql
brew services start mosquitto

# 2. Create database
mysql -u root -p < database/schema.sql

# 3. Start backend (edit .env first with your MySQL password)
cd motor-backend
npm install
node server.js

# 4. Start frontend (in a new terminal)
cd motor-frontend
npm install
npm run dev

# 5. Open http://localhost:5173
```

---

## 🚫 Constraints

- Runs completely offline (localhost only)
- No cloud APIs
- No Docker required
- Compatible with macOS Intel & Apple Silicon
