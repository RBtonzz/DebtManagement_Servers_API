const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getAllMyDebts,
  getMyDebt,
  createMyDebt,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  deleteMyDebt
} = require('../controllers/mydebtController');

router.use(protect, adminOnly);

router.get('/', getAllMyDebts);
router.get('/:id', getMyDebt);
router.post('/', createMyDebt);
router.post('/:id/transaction', addTransaction);
router.put('/:id/transaction/:txId', updateTransaction);
router.delete('/:id/transaction/:txId', deleteTransaction);
router.delete('/:id', deleteMyDebt);

module.exports = router;
