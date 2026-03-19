const express = require('express');
const router = express.Router();
const MyDebt = require('../models/MyDebt');
const { protect, adminOnly } = require('../middleware/auth');

// All mydebt routes require admin
router.use(protect, adminOnly);

router.get('/', async (req, res) => {
  try {
    const debts = await MyDebt.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(debts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const debt = await MyDebt.findById(req.params.id);
    if (!debt) return res.status(404).json({ message: 'ไม่พบรายการ' });
    res.json(debt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { creditorName, phone, note } = req.body;
    const exists = await MyDebt.findOne({ creditorName, isActive: true });
    if (exists) return res.status(400).json({ message: 'มีชื่อนี้อยู่แล้ว' });
    const debt = await MyDebt.create({ creditorName, phone, note });
    res.status(201).json(debt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/transaction', async (req, res) => {
  try {
    const { type, amount, paymentMethod, note, date } = req.body;
    const debt = await MyDebt.findById(req.params.id);
    if (!debt) return res.status(404).json({ message: 'ไม่พบรายการ' });

    debt.transactions.push({
      type,
      amount: Number(amount),
      paymentMethod,
      note,
      date: date ? new Date(date) : new Date(),
      createdBy: req.user.username
    });
    await debt.save();
    res.json(debt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id/transaction/:txId', async (req, res) => {
  try {
    const debt = await MyDebt.findById(req.params.id);
    if (!debt) return res.status(404).json({ message: 'ไม่พบรายการ' });
    const tx = debt.transactions.id(req.params.txId);
    if (!tx) return res.status(404).json({ message: 'ไม่พบรายการ' });

    const { type, amount, paymentMethod, note, date } = req.body;
    if (type) tx.type = type;
    if (amount) tx.amount = Number(amount);
    if (paymentMethod) tx.paymentMethod = paymentMethod;
    if (note !== undefined) tx.note = note;
    if (date) tx.date = new Date(date);
    await debt.save();
    res.json(debt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id/transaction/:txId', async (req, res) => {
  try {
    const debt = await MyDebt.findById(req.params.id);
    if (!debt) return res.status(404).json({ message: 'ไม่พบรายการ' });
    debt.transactions.pull(req.params.txId);
    await debt.save();
    res.json(debt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await MyDebt.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'ลบสำเร็จ' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
