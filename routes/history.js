const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { getDebtorsHistory, getMyDebtHistory } = require('../controllers/historyController');

router.use(protect, adminOnly);

router.get('/debtors', getDebtorsHistory);
router.get('/mydebt', getMyDebtHistory);

module.exports = router;
