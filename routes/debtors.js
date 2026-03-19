const express = require('express');
const router = express.Router();
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');
const {
  getAllDebtors,
  getDebtor,
  createDebtor,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  deleteDebtor
} = require('../controllers/debtorController');

router.get('/', optionalAuth, getAllDebtors);
router.get('/:id', protect, adminOnly, getDebtor);
router.post('/', protect, adminOnly, createDebtor);
router.post('/:id/transaction', protect, adminOnly, addTransaction);
router.put('/:id/transaction/:txId', protect, adminOnly, updateTransaction);
router.delete('/:id/transaction/:txId', protect, adminOnly, deleteTransaction);
router.delete('/:id', protect, adminOnly, deleteDebtor);

module.exports = router;
