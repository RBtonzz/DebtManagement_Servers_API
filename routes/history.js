const express = require('express');
const router = express.Router();
const Debtor = require('../models/Debtor');
const MyDebt = require('../models/MyDebt');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

// History summary for debtors
router.get('/debtors', async (req, res) => {
  try {
    const debtors = await Debtor.find({}).sort({ createdAt: -1 });
    const summary = debtors.map(d => ({
      _id: d._id,
      name: d.name,
      totalDebt: d.totalDebt,
      totalAdded: d.transactions.filter(t => t.type === 'add').reduce((s, t) => s + t.amount, 0),
      totalPaid: d.transactions.filter(t => t.type === 'pay').reduce((s, t) => s + t.amount, 0),
      transactionCount: d.transactions.length,
      isActive: d.isActive,
      transactions: d.transactions
    }));
    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// History summary for mydebt
router.get('/mydebt', async (req, res) => {
  try {
    const debts = await MyDebt.find({}).sort({ createdAt: -1 });
    const summary = debts.map(d => ({
      _id: d._id,
      creditorName: d.creditorName,
      totalDebt: d.totalDebt,
      totalAdded: d.transactions.filter(t => t.type === 'add').reduce((s, t) => s + t.amount, 0),
      totalPaid: d.transactions.filter(t => t.type === 'pay').reduce((s, t) => s + t.amount, 0),
      transactionCount: d.transactions.length,
      isActive: d.isActive,
      transactions: d.transactions
    }));
    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
