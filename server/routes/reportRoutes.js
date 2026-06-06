const express = require('express');
const { getPerformanceStats } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/performance', protect, getPerformanceStats);

module.exports = router;
