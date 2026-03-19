const jwt = require('jsonwebtoken');
const User = require('../models/User');

const register = async (req, res) => {
  console.log('[POST /auth/register] body:', req.body);
  try {
    const { username, password, secretKey } = req.body;
    if (secretKey !== 'DEBT_ADMIN_SECRET_2024') {
      console.log('[POST /auth/register] invalid secret key');
      return res.status(403).json({ message: 'Secret key wrong' });
    }
    const exists = await User.findOne({ username });
    if (exists) {
      console.log('[POST /auth/register] username already exists:', username);
      return res.status(400).json({ message: 'Username exists' });
    }

    const user = await User.create({ username, password, role: 'admin' });
    console.log('[POST /auth/register] created admin:', user.username);
    res.status(201).json({ message: 'create Admin succesfuly', username: user.username });
  } catch (err) {
    console.error('[POST /auth/register] error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

const login = async (req, res) => {
  console.log('[POST /auth/login] body:', { username: req.body.username, rememberMe: req.body.rememberMe });
  try {
    const { username, password, rememberMe } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      console.log('[POST /auth/login] invalid credentials for:', username);
      return res.status(401).json({ message: 'Username or Password is incorrect' });
    }

    const expire = rememberMe ? '15d' : '1d';
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: expire });
    console.log('[POST /auth/login] success:', username, '| expire:', expire , '| role:', user.role , '| token:', token);
    res.json({ token, username: user.username, role: user.role });
  } catch (err) {
    console.error('[POST /auth/login] error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

const verify = (req, res) => {
  console.log('[GET /auth/verify] user:', req.user.username);
  res.json({ username: req.user.username, role: req.user.role });
};

module.exports = { register, login, verify };
