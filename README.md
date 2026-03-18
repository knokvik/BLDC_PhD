# 🏭 Real-Time Motor Monitoring System

Offline & Cloud-ready Industrial IoT web application for monitoring real-time motor and inverter parameters. Uses MQTT data ingestion, PostgreSQL storage, real-time WebSocket updates, and a React dashboard.

---

## ☁️ Cloud Deployment Guide (Supabase + Render + Vercel)

This project has been updated to support deploying to the cloud. Vercel is used for the frontend, Render for the long-running backend, and Supabase for the PostgreSQL database.

### 1. Database Setup (Supabase)
1. Go to [Supabase](https://supabase.com) and create a new project.
2. In the project dashboard, go to the **SQL Editor**.
3. Copy the contents of `database/schema.sql` and run it to create the `motor_readings` table.
4. Go to **Project Settings -> Database** and copy the **Connection string** (URI). Replace `[YOUR-PASSWORD]` with your actual database password.

### 2. Backend Setup (Render)
Render is used for the backend because it supports long-running Node.js processes and WebSockets, which Vercel Serverless Functions do not support.

1. Go to [Render](https://render.com) and create a **New Web Service**.
2. Connect your GitHub repository.
3. Set the **Root Directory** to `motor-backend`.
4. Set the **Build Command** to `npm install`.
5. Set the **Start Command** to `node server.js`.
6. Add the following **Environment Variables**:
   - `DATABASE_URL` = (The connection string you copied from Supabase)
   - `SIMULATION` = `true` (if you want it to generate random data to test)
7. Deploy the service and copy the deployed URL (e.g., `https://motor-backend.onrender.com`).

### 3. Frontend Setup (Vercel)
1. Go to [Vercel](https://vercel.com) and **Add New Project**.
2. Connect your GitHub repository.
3. Set the **Framework Preset** to `Vite`.
4. Set the **Root Directory** to `motor-frontend`.
5. Add the following **Environment Variable**:
   - `VITE_BACKEND_URL` = (The URL of your deployed Render backend, e.g., `https://motor-backend.onrender.com`)
6. Deploy the project!

---

## 💻 Local Development (macOS/Linux)

### 1. Install Dependencies
Make sure you have Node.js installed.

`brew install node`

### 2. Start PostgreSQL (Local)
If you want to run the database locally instead of Supabase:

`brew install postgresql`
`brew services start postgresql`
`psql postgres -c "CREATE DATABASE motor_monitoring;"`
`psql motor_monitoring < database/schema.sql`

### 3. Start Backend
`cd motor-backend`
`npm install`

Create a `.env` file in `motor-backend`:
`PORT=5005`
`DATABASE_URL=postgresql://user:password@localhost:5432/motor_monitoring`
`SIMULATION=true`

Run the backend:
`node server.js`

### 4. Start Frontend
In a new terminal:
`cd motor-frontend`
`npm install`
`npm run dev`

Open **http://localhost:5173** in your browser.
