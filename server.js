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
  res.setTimeout(10000, () => {
    res.status(503).json({ message: 'Server ไม่ตอบสนอง กรุณาลองใหม่อีกครั้ง' });
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
