const express = require('express');
const { getTemplates } = require('../controllers/templateController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getTemplates);

module.exports = router;
