const Debtor = require('../models/Debtor');

// ownerId filter: documents owned by user OR legacy docs without owner (backwards compat)
const ownerFilter = (userId) => ({
  $or: [{ owner: userId }, { owner: null }]
});

const getAllDebtors = async (req, res) => {
  try {
    if (req.user?.role === 'admin') {
      const debtors = await Debtor.find({ isActive: true, ...ownerFilter(req.user._id) }).sort({ createdAt: -1 });
      return res.json(debtors);
    }
    // Public: all debtors (limited fields) — grouped view handled by /api/public/summary
    const debtors = await Debtor.find({ isActive: true }).sort({ createdAt: -1 });
    const publicData = debtors.map(d => ({ _id: d._id, name: d.name, totalDebt: d.totalDebt, owner: d.owner }));
    res.json(publicData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getDebtor = async (req, res) => {
  try {
    const debtor = await Debtor.findById(req.params.id);
    if (!debtor) return res.status(404).json({ message: 'Not found Debtor' });
    // Admin sees full data; public sees limited fields only
    if (req.user?.role === 'admin') return res.json(debtor);
    const { _id, name, phone, note, totalDebt, transactions } = debtor.toJSON();
    res.json({ _id, name, phone, note, totalDebt, transactions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createDebtor = async (req, res) => {
  try {
    const { name, phone, note } = req.body;
    const exists = await Debtor.findOne({ name, isActive: true, ...ownerFilter(req.user._id) });
    if (exists) return res.status(400).json({ message: 'Name already exists' });
    const debtor = await Debtor.create({ name, phone, note, owner: req.user._id });
    res.status(201).json(debtor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addTransaction = async (req, res) => {
  try {
    const { type, amount, paymentMethod, note, date } = req.body;
    const debtor = await Debtor.findById(req.params.id);
    if (!debtor) return res.status(404).json({ message: 'Not found Debtor' });
    debtor.transactions.push({
      type, amount: Number(amount), paymentMethod, note,
      date: date ? new Date(date) : new Date(),
      createdBy: req.user.username
    });
    await debtor.save();
    res.json(debtor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateTransaction = async (req, res) => {
  try {
    const debtor = await Debtor.findById(req.params.id);
    if (!debtor) return res.status(404).json({ message: 'Not found Debtor' });
    const tx = debtor.transactions.id(req.params.txId);
    if (!tx) return res.status(404).json({ message: 'Not found Transaction' });
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
};

const deleteTransaction = async (req, res) => {
  try {
    const debtor = await Debtor.findById(req.params.id);
    if (!debtor) return res.status(404).json({ message: 'ไม่พบลูกหนี้' });
    debtor.transactions.pull(req.params.txId);
    await debtor.save();
    res.json(debtor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteDebtor = async (req, res) => {
  try {
    await Debtor.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Debtor soft deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAllDebtors, getDebtor, createDebtor, addTransaction, updateTransaction, deleteTransaction, deleteDebtor };
