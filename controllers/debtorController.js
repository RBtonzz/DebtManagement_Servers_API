const Debtor = require('../models/Debtor');

const getAllDebtors = async (req, res) => {
  console.log('[GET /debtors] user:', req.user?.username ?? 'public');
  try {
    const debtors = await Debtor.find({ isActive: true }).sort({ createdAt: -1 });
    console.log('[GET /debtors] found:', debtors.length);
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
    console.error('[GET /debtors] error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

const getDebtor = async (req, res) => {
  console.log('[GET /debtors/:id] id:', req.params.id);
  try {
    const debtor = await Debtor.findById(req.params.id);
    if (!debtor) {
      console.log('[GET /debtors/:id] not found:', req.params.id);
      return res.status(404).json({ message: 'Not found Debtor' });
    }
    console.log('[GET /debtors/:id] found:', debtor.name);
    res.json(debtor);
  } catch (err) {
    console.error('[GET /debtors/:id] error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

const createDebtor = async (req, res) => {
  console.log('[POST /debtors] body:', req.body);
  try {
    const { name, phone, note } = req.body;
    const exists = await Debtor.findOne({ name, isActive: true });
    if (exists) {
      console.log('[POST /debtors] name already exists:', name);
      return res.status(400).json({ message: 'Name already exists' });
    }
    const debtor = await Debtor.create({ name, phone, note });
    console.log('[POST /debtors] created:', debtor._id, debtor.name);
    res.status(201).json(debtor);
  } catch (err) {
    console.error('[POST /debtors] error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

const addTransaction = async (req, res) => {
  console.log('[POST /debtors/:id/transaction] id:', req.params.id, 'body:', req.body);
  try {
    const { type, amount, paymentMethod, note, date } = req.body;
    const debtor = await Debtor.findById(req.params.id);
    if (!debtor) {
      console.log('[POST /debtors/:id/transaction] debtor not found:', req.params.id);
      return res.status(404).json({ message: 'Not found Debtor' });
    }

    debtor.transactions.push({
      type,
      amount: Number(amount),
      paymentMethod,
      note,
      date: date ? new Date(date) : new Date(),
      createdBy: req.user.username
    });
    await debtor.save();
    console.log('[POST /debtors/:id/transaction] added tx type:', type, 'amount:', amount, 'to:', debtor.name);
    res.json(debtor);
  } catch (err) {
    console.error('[POST /debtors/:id/transaction] error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

const updateTransaction = async (req, res) => {
  console.log('[PUT /debtors/:id/transaction/:txId] id:', req.params.id, 'txId:', req.params.txId, 'body:', req.body);
  try {
    const debtor = await Debtor.findById(req.params.id);
    if (!debtor) {
      console.log('[PUT /debtors/:id/transaction/:txId] debtor not found:', req.params.id);
      return res.status(404).json({ message: 'Not found Debtor' });
    }
    const tx = debtor.transactions.id(req.params.txId);
    if (!tx) {
      console.log('[PUT /debtors/:id/transaction/:txId] tx not found:', req.params.txId);
      return res.status(404).json({ message: 'Not found Transaction' });
    }

    const { type, amount, paymentMethod, note, date } = req.body;
    if (type) tx.type = type;
    if (amount) tx.amount = Number(amount);
    if (paymentMethod) tx.paymentMethod = paymentMethod;
    if (note !== undefined) tx.note = note;
    if (date) tx.date = new Date(date);
    await debtor.save();
    console.log('[PUT /debtors/:id/transaction/:txId] updated tx:', req.params.txId);
    res.json(debtor);
  } catch (err) {
    console.error('[PUT /debtors/:id/transaction/:txId] error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

const deleteTransaction = async (req, res) => {
  console.log('[DELETE /debtors/:id/transaction/:txId] id:', req.params.id, 'txId:', req.params.txId);
  try {
    const debtor = await Debtor.findById(req.params.id);
    if (!debtor) {
      console.log('[DELETE /debtors/:id/transaction/:txId] debtor not found:', req.params.id);
      return res.status(404).json({ message: 'ไม่พบลูกหนี้' });
    }
    debtor.transactions.pull(req.params.txId);
    await debtor.save();
    console.log('[DELETE /debtors/:id/transaction/:txId] deleted tx:', req.params.txId);
    res.json(debtor);
  } catch (err) {
    console.error('[DELETE /debtors/:id/transaction/:txId] error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

const deleteDebtor = async (req, res) => {
  console.log('[DELETE /debtors/:id] id:', req.params.id);
  try {
    await Debtor.findByIdAndUpdate(req.params.id, { isActive: false });
    console.log('[DELETE /debtors/:id] soft deleted:', req.params.id);
    res.json({ message: 'Debtor soft deleted successfully' });
  } catch (err) {
    console.error('[DELETE /debtors/:id] error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllDebtors,
  getDebtor,
  createDebtor,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  deleteDebtor
};
