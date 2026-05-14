const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const asyncHandler = require('../middleware/asyncHandler');
const { registerSchema, loginSchema, updatePasswordSchema } = require('../utils/validation');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res) => {
    const { error } = registerSchema.validate(req.body);
    if (error) {
        res.status(400);
        throw new Error(error.details[0].message);
    }

    const { name, email, password, role } = req.body;

    // Check if user exists
    const userExists = await User.findByEmail(email);
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const result = await User.create({
        name,
        email,
        password: hashedPassword,
        role: role || 'Sales Agent'
    });

    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token: generateToken(result.insertId)
    });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
    const { error } = loginSchema.validate(req.body);
    if (error) {
        res.status(400);
        throw new Error(error.details[0].message);
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
        res.status(401);
        throw new Error('Invalid credentials');
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        res.status(401);
        throw new Error('Invalid credentials');
    }

    // Check status
    if (user.status === 'Blocked') {
        res.status(403);
        throw new Error('Account is blocked');
    }

    res.json({
        success: true,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        },
        token: generateToken(user.id)
    });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    res.json({ success: true, user });
});

// @desc    Update password
// @route   PUT /api/auth/update-password
// @access  Private
exports.updatePassword = asyncHandler(async (req, res) => {
    const { error } = updatePasswordSchema.validate(req.body);
    if (error) {
        res.status(400);
        throw new Error(error.details[0].message);
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);
    
    // We need the password from the DB to compare
    const [rows] = await require('../config/db').execute('SELECT password FROM users WHERE id = ?', [req.user.id]);
    const dbPassword = rows[0].password;

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, dbPassword);
    if (!isMatch) {
        res.status(401);
        throw new Error('Current password is incorrect');
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password in DB
    await require('../config/db').execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);

    res.json({ success: true, message: 'Password updated successfully' });
});

// @desc    Update notification preferences
// @route   PUT /api/auth/preferences
// @access  Private
exports.updatePreferences = asyncHandler(async (req, res) => {
    const { notify_email, notify_assignment, notify_status_change } = req.body;

    await require('../config/db').execute(
        'UPDATE users SET notify_email = ?, notify_assignment = ?, notify_status_change = ? WHERE id = ?',
        [notify_email, notify_assignment, notify_status_change, req.user.id]
    );

    res.json({ success: true, message: 'Preferences updated successfully' });
});
