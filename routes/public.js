const express = require('express');
const router = express.Router();
const { getPublicSummary } = require('../controllers/publicController');

router.get('/summary', getPublicSummary);

module.exports = router;
