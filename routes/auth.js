const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Register - Admin only via Postman
router.post('/register', async (req, res) => {
  try {
    const { username, password, secretKey } = req.body;
    if (secretKey !== 'DEBT_ADMIN_SECRET_2024') {
      return res.status(403).json({ message: 'Secret key ไม่ถูกต้อง' });
    }
    const exists = await User.findOne({ username });
    if (exists) return res.status(400).json({ message: 'Username นี้มีอยู่แล้ว' });

    const user = await User.create({ username, password, role: 'admin' });
    res.status(201).json({ message: 'สร้าง Admin สำเร็จ', username: user.username });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password, rememberMe } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Username หรือ Password ไม่ถูกต้อง' });
    }

    const expire = rememberMe ? '15d' : '1d';
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: expire });
    res.json({ token, username: user.username, role: user.role });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Verify token
router.get('/verify', protect, (req, res) => {
  res.json({ username: req.user.username, role: req.user.role });
});

module.exports = router;
