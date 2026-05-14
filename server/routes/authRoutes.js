const express = require('express');
const { register, login, getMe, updatePassword, updatePreferences } = require('../controllers/authController');
const { getUsers, updateUserRole, deleteUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/update-password', protect, updatePassword);
router.put('/preferences', protect, updatePreferences);

// User Management (Admin Only)
router.get('/users', protect, authorize('Admin'), getUsers);
router.put('/users/:id', protect, authorize('Admin'), updateUserRole);
router.delete('/users/:id', protect, authorize('Admin'), deleteUser);

module.exports = router;
