const express = require('express');
const { getActivities, getLeadActivities } = require('../controllers/activityController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', authorize('Admin', 'Sales Manager'), getActivities);
router.get('/lead/:id', getLeadActivities);

module.exports = router;
