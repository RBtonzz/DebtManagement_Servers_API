const Debtor = require('../models/Debtor');
const MyDebt = require('../models/MyDebt');

const getDebtorsHistory = async (req, res) => {
  console.log('[GET /history/debtors] user:', req.user?.username);
  try {
    const debtors = await Debtor.find({}).sort({ createdAt: -1 });
    console.log('[GET /history/debtors] found:', debtors.length);
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
    console.error('[GET /history/debtors] error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

const getMyDebtHistory = async (req, res) => {
  console.log('[GET /history/mydebt] user:', req.user?.username);
  try {
    const debts = await MyDebt.find({}).sort({ createdAt: -1 });
    console.log('[GET /history/mydebt] found:', debts.length);
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
    console.error('[GET /history/mydebt] error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getDebtorsHistory, getMyDebtHistory };
