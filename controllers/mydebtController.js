const MyDebt = require('../models/MyDebt');

const ownerFilter = (userId) => ({
  $or: [{ owner: userId }, { owner: null }]
});

const getAllMyDebts = async (req, res) => {
  try {
    const debts = await MyDebt.find({ isActive: true, ...ownerFilter(req.user._id) }).sort({ createdAt: -1 });
    res.json(debts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMyDebt = async (req, res) => {
  try {
    const debt = await MyDebt.findById(req.params.id);
    if (!debt) return res.status(404).json({ message: 'Not found MyDebt' });
    res.json(debt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createMyDebt = async (req, res) => {
  try {
    const { creditorName, phone, note } = req.body;
    const exists = await MyDebt.findOne({ creditorName, isActive: true, ...ownerFilter(req.user._id) });
    if (exists) return res.status(400).json({ message: 'Creditor name already exists' });
    const debt = await MyDebt.create({ creditorName, phone, note, owner: req.user._id });
    res.status(201).json(debt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addTransaction = async (req, res) => {
  try {
    const { type, amount, paymentMethod, note, date } = req.body;
    const debt = await MyDebt.findById(req.params.id);
    if (!debt) return res.status(404).json({ message: 'Not found MyDebt' });
    debt.transactions.push({
      type, amount: Number(amount), paymentMethod, note,
      date: date ? new Date(date) : new Date(),
      createdBy: req.user.username
    });
    await debt.save();
    res.json(debt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateTransaction = async (req, res) => {
  try {
    const debt = await MyDebt.findById(req.params.id);
    if (!debt) return res.status(404).json({ message: 'Not found MyDebt' });
    const tx = debt.transactions.id(req.params.txId);
    if (!tx) return res.status(404).json({ message: 'Not found Transaction' });
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
};

const deleteTransaction = async (req, res) => {
  try {
    const debt = await MyDebt.findById(req.params.id);
    if (!debt) return res.status(404).json({ message: 'Not found MyDebt' });
    debt.transactions.pull(req.params.txId);
    await debt.save();
    res.json(debt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteMyDebt = async (req, res) => {
  try {
    await MyDebt.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'ลบสำเร็จ' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAllMyDebts, getMyDebt, createMyDebt, addTransaction, updateTransaction, deleteTransaction, deleteMyDebt };
