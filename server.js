require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());

// Request timeout 10s
app.use((_req, res, next) => {
  res.setTimeout(30000, () => {
    res.status(503).json({ message: 'Server ບໍ່ຕອບສະໜອງ, ກະລູນາລອງໃໝ່ ຫຼື ເປຶດ VPN' });
  });
  next();
});

// Connect MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/debtors', require('./routes/debtors'));
app.use('/api/mydebt', require('./routes/mydebt'));
app.use('/api/history', require('./routes/history'));
app.use('/api/public', require('./routes/public'));

// Root
app.get('/', (_req, res) => {
  const dbStatus = mongoose.connection.readyState === 1;
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Debt Management API</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      background: #0f172a;
      color: #e2e8f0;
      font-family: 'Segoe UI', sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .card {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 16px;
      padding: 40px;
      width: 100%;
      max-width: 480px;
      box-shadow: 0 25px 50px rgba(0,0,0,0.4);
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #22c55e20;
      color: #22c55e;
      border: 1px solid #22c55e40;
      padding: 4px 12px;
      border-radius: 99px;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 20px;
    }
    .dot {
      width: 7px; height: 7px;
      background: #22c55e;
      border-radius: 50%;
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }
    h1 { font-size: 24px; font-weight: 700; margin-bottom: 6px; }
    .sub { color: #64748b; font-size: 14px; margin-bottom: 28px; }
    .row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #1e293b;
      font-size: 14px;
    }
    .label { color: #64748b; }
    .value { font-weight: 500; }
    .status-ok { color: #22c55e; }
    .status-err { color: #ef4444; }
    .routes {
      margin-top: 24px;
      background: #0f172a;
      border-radius: 10px;
      padding: 16px;
    }
    .routes-title { font-size: 12px; color: #64748b; margin-bottom: 10px; font-weight: 600; letter-spacing: 1px; }
    .route-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      padding: 4px 0;
      color: #94a3b8;
    }
    .method {
      font-size: 11px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 4px;
      background: #1d4ed820;
      color: #60a5fa;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge"><span class="dot"></span> ONLINE</div>
    <h1>Debt Management API</h1>
    <p class="sub">Backend server is running successfully</p>
    <div class="row">
      <span class="label">Server Time</span>
      <span class="value">${new Date().toLocaleString('th-TH')}</span>
    </div>
    <div class="row">
      <span class="label">Database</span>
      <span class="value ${dbStatus ? 'status-ok' : 'status-err'}">${dbStatus ? '✅ Connected' : '❌ Disconnected'}</span>
    </div>
    <div class="row">
      <span class="label">Environment</span>
      <span class="value">${process.env.NODE_ENV || 'development'}</span>
    </div>
    <div class="row">
      <span class="label">Port</span>
      <span class="value">${process.env.PORT || 8080}</span>
    </div>
    <div class="routes">
      <div class="routes-title">ENDPOINTS</div>
      <div class="route-item"><span class="method">GET</span> /api/ping</div>
      <div class="route-item"><span class="method">POST</span> /api/auth/login</div>
      <div class="route-item"><span class="method">GET</span> /api/debtors</div>
      <div class="route-item"><span class="method">GET</span> /api/mydebt</div>
      <div class="route-item"><span class="method">GET</span> /api/history</div>
    </div>
  </div>
</body>
</html>`);
});

// Health check (prevent sleep)
app.get('/api/ping', (req, res) => res.json({ status: 'ok', time: new Date() }));

// Keep-alive: ping ตัวเองทุก 4 นาที ป้องกัน Render sleep
if (process.env.RENDER_URL) {
  setInterval(async () => {
    try {
      await fetch(`${process.env.RENDER_URL}/api/ping`);
      console.log('🏓 Keep-alive ping sent');
    } catch (err) {
      console.error('❌ Keep-alive failed:', err.message);
    }
  }, 4 * 60 * 1000);
}

const PORT = process.env.PORT || 8080;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
