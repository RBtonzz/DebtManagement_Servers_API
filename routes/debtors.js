const express = require('express');
const router = express.Router();
const Debtor = require('../models/Debtor');
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');

// GET all debtors (public: name + total only, admin: full)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const debtors = await Debtor.find({ isActive: true }).sort({ createdAt: -1 });
    if (req.user?.role === 'admin') {
      return res.json(debtors);
    }
    // Public: only name and totalDebt
    const publicData = debtors.map(d => ({
      _id: d._id,
      name: d.name,
      totalDebt: d.totalDebt
    }));
    res.json(publicData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single debtor
router.get('/:id', protect, adminOnly, async (req, res) => {
  try {
    const debtor = await Debtor.findById(req.params.id);
    if (!debtor) return res.status(404).json({ message: 'ไม่พบลูกหนี้' });
    res.json(debtor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create debtor
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { name, phone, note } = req.body;
    const exists = await Debtor.findOne({ name, isActive: true });
    if (exists) return res.status(400).json({ message: 'มีชื่อนี้อยู่แล้ว' });
    const debtor = await Debtor.create({ name, phone, note });
    res.status(201).json(debtor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST add transaction (add/pay)
router.post('/:id/transaction', protect, adminOnly, async (req, res) => {
  try {
    const { type, amount, paymentMethod, note, date } = req.body;
    const debtor = await Debtor.findById(req.params.id);
    if (!debtor) return res.status(404).json({ message: 'ไม่พบลูกหนี้' });

    debtor.transactions.push({
      type,
      amount: Number(amount),
      paymentMethod,
      note,
      date: date ? new Date(date) : new Date(),
      createdBy: req.user.username
    });
    await debtor.save();
    res.json(debtor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update transaction
router.put('/:id/transaction/:txId', protect, adminOnly, async (req, res) => {
  try {
    const debtor = await Debtor.findById(req.params.id);
    if (!debtor) return res.status(404).json({ message: 'ไม่พบลูกหนี้' });
    const tx = debtor.transactions.id(req.params.txId);
    if (!tx) return res.status(404).json({ message: 'ไม่พบรายการ' });

    const { type, amount, paymentMethod, note, date } = req.body;
    if (type) tx.type = type;
    if (amount) tx.amount = Number(amount);
    if (paymentMethod) tx.paymentMethod = paymentMethod;
    if (note !== undefined) tx.note = note;
    if (date) tx.date = new Date(date);
    await debtor.save();
    res.json(debtor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE transaction
router.delete('/:id/transaction/:txId', protect, adminOnly, async (req, res) => {
  try {
    const debtor = await Debtor.findById(req.params.id);
    if (!debtor) return res.status(404).json({ message: 'ไม่พบลูกหนี้' });
    debtor.transactions.pull(req.params.txId);
    await debtor.save();
    res.json(debtor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE debtor (soft delete)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Debtor.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'ลบสำเร็จ' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
