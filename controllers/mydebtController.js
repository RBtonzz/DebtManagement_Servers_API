const MyDebt = require('../models/MyDebt');

const getAllMyDebts = async (req, res) => {
  console.log('[GET /mydebt] user:', req.user?.username);
  try {
    const debts = await MyDebt.find({ isActive: true }).sort({ createdAt: -1 });
    console.log('[GET /mydebt] found:', debts.length);
    res.json(debts);
  } catch (err) {
    console.error('[GET /mydebt] error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

const getMyDebt = async (req, res) => {
  console.log('[GET /mydebt/:id] id:', req.params.id);
  try {
    const debt = await MyDebt.findById(req.params.id);
    if (!debt) {
      console.log('[GET /mydebt/:id] not found:', req.params.id);
      return res.status(404).json({ message: 'Not found MyDebt' });
    }
    console.log('[GET /mydebt/:id] found:', debt.creditorName);
    res.json(debt);
  } catch (err) {
    console.error('[GET /mydebt/:id] error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

const createMyDebt = async (req, res) => {
  console.log('[POST /mydebt] body:', req.body);
  try {
    const { creditorName, phone, note } = req.body;
    const exists = await MyDebt.findOne({ creditorName, isActive: true });
    if (exists) {
      console.log('[POST /mydebt] creditorName already exists:', creditorName);
      return res.status(400).json({ message: 'Creditor name already exists' });
    }
    const debt = await MyDebt.create({ creditorName, phone, note });
    console.log('[POST /mydebt] created:', debt._id, debt.creditorName);
    res.status(201).json(debt);
  } catch (err) {
    console.error('[POST /mydebt] error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

const addTransaction = async (req, res) => {
  console.log('[POST /mydebt/:id/transaction] id:', req.params.id, 'body:', req.body);
  try {
    const { type, amount, paymentMethod, note, date } = req.body;
    const debt = await MyDebt.findById(req.params.id);
    if (!debt) {
      console.log('[POST /mydebt/:id/transaction] debt not found:', req.params.id);
      return res.status(404).json({ message: 'Not found MyDebt' });
    }

    debt.transactions.push({
      type,
      amount: Number(amount),
      paymentMethod,
      note,
      date: date ? new Date(date) : new Date(),
      createdBy: req.user.username
    });
    await debt.save();
    console.log('[POST /mydebt/:id/transaction] added tx type:', type, 'amount:', amount, 'to:', debt.creditorName);
    res.json(debt);
  } catch (err) {
    console.error('[POST /mydebt/:id/transaction] error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

const updateTransaction = async (req, res) => {
  console.log('[PUT /mydebt/:id/transaction/:txId] id:', req.params.id, 'txId:', req.params.txId, 'body:', req.body);
  try {
    const debt = await MyDebt.findById(req.params.id);
    if (!debt) {
      console.log('[PUT /mydebt/:id/transaction/:txId] debt not found:', req.params.id);
      return res.status(404).json({ message: 'Not found MyDebt' });
    }
    const tx = debt.transactions.id(req.params.txId);
    if (!tx) {
      console.log('[PUT /mydebt/:id/transaction/:txId] tx not found:', req.params.txId);
      return res.status(404).json({ message: 'Not found Transaction' });
    }

    const { type, amount, paymentMethod, note, date } = req.body;
    if (type) tx.type = type;
    if (amount) tx.amount = Number(amount);
    if (paymentMethod) tx.paymentMethod = paymentMethod;
    if (note !== undefined) tx.note = note;
    if (date) tx.date = new Date(date);
    await debt.save();
    console.log('[PUT /mydebt/:id/transaction/:txId] updated tx:', req.params.txId);
    res.json(debt);
  } catch (err) {
    console.error('[PUT /mydebt/:id/transaction/:txId] error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

const deleteTransaction = async (req, res) => {
  console.log('[DELETE /mydebt/:id/transaction/:txId] id:', req.params.id, 'txId:', req.params.txId);
  try {
    const debt = await MyDebt.findById(req.params.id);
    if (!debt) {
      console.log('[DELETE /mydebt/:id/transaction/:txId] debt not found:', req.params.id);
      return res.status(404).json({ message: 'Not found MyDebt' });
    }
    debt.transactions.pull(req.params.txId);
    await debt.save();
    console.log('[DELETE /mydebt/:id/transaction/:txId] deleted tx:', req.params.txId);
    res.json(debt);
  } catch (err) {
    console.error('[DELETE /mydebt/:id/transaction/:txId] error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

const deleteMyDebt = async (req, res) => {
  console.log('[DELETE /mydebt/:id] id:', req.params.id);
  try {
    await MyDebt.findByIdAndUpdate(req.params.id, { isActive: false });
    console.log('[DELETE /mydebt/:id] soft deleted:', req.params.id);
    res.json({ message: 'ลบสำเร็จ' });
  } catch (err) {
    console.error('[DELETE /mydebt/:id] error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllMyDebts,
  getMyDebt,
  createMyDebt,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  deleteMyDebt
};
