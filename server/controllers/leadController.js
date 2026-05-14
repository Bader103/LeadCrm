const Lead = require('../models/leadModel');
const asyncHandler = require('../middleware/asyncHandler');
const { logActivity } = require('../utils/logger');
const { leadSchema } = require('../utils/validation');
const Notification = require('../models/notificationModel');

// @desc    Get all leads
// @route   GET /api/leads
// @access  Private
exports.getLeads = asyncHandler(async (req, res) => {
    let leads;
    
    // Admin and Manager can see all leads
    if (req.user.role === 'Admin' || req.user.role === 'Sales Manager') {
        leads = await Lead.findAll();
    } else {
        // Sales Agents/Interns see only leads assigned to them
        leads = await Lead.findByAssignedTo(req.user.id);
    }

    res.json({ success: true, count: leads.length, data: leads });
});

// @desc    Get single lead
// @route   GET /api/leads/:id
// @access  Private
exports.getLead = asyncHandler(async (req, res) => {
    const [rows] = await require('../config/db').execute(
        `SELECT l.*, u.name as assigned_to_name 
         FROM leads l 
         LEFT JOIN users u ON l.assigned_to = u.id 
         WHERE l.id = ?`,
        [req.params.id]
    );
    const lead = rows[0];

    if (!lead) {
        res.status(404);
        throw new Error('Lead not found');
    }

    // Check ownership/access
    if (req.user.role !== 'Admin' && req.user.role !== 'Sales Manager' && lead.assigned_to !== req.user.id) {
        res.status(403);
        throw new Error('Not authorized to view this lead');
    }

    res.json({ success: true, data: lead });
});

// @desc    Create new lead
// @route   POST /api/leads
// @access  Private (Admin, Manager, Sales Agent)
exports.createLead = asyncHandler(async (req, res) => {
    const { error } = leadSchema.validate(req.body);
    if (error) {
        res.status(400);
        throw new Error(error.details[0].message);
    }

    // Set creator
    req.body.created_by = req.user.id;

    const result = await Lead.create(req.body);

    // Log Activity
    await logActivity(req.user.id, 'CREATE_LEAD', result.insertId, { name: req.body.name });
    
    res.status(201).json({
        success: true,
        message: 'Lead created successfully',
        data: { id: result.insertId, ...req.body }
    });
});

// @desc    Update lead
// @route   PUT /api/leads/:id
// @access  Private
exports.updateLead = asyncHandler(async (req, res) => {
    let lead = await Lead.findById(req.params.id);

    if (!lead) {
        res.status(404);
        throw new Error('Lead not found');
    }

    // Check authorization
    if (req.user.role !== 'Admin' && req.user.role !== 'Sales Manager' && lead.assigned_to !== req.user.id) {
        res.status(403);
        throw new Error('Not authorized to update this lead');
    }

    const oldStatus = lead.status;
    const newStatus = req.body.status;

    await Lead.update(req.params.id, req.body);
    
    // Log Activity
    await logActivity(req.user.id, 'UPDATE_LEAD', req.params.id, req.body);

    // Create Notification if status changed and lead is assigned
    if (newStatus && oldStatus !== newStatus && lead.assigned_to) {
        // Notify assigned user if someone else updated it, or just notify always
        await Notification.create({
            user_id: lead.assigned_to,
            type: 'STATUS_CHANGE',
            message: `Lead "${lead.first_name} ${lead.last_name}" status updated to ${newStatus}.`,
            lead_id: req.params.id
        });
    }

    const updatedLead = await Lead.findById(req.params.id);

    res.json({ success: true, data: updatedLead });
});

// @desc    Delete lead
// @route   DELETE /api/leads/:id
// @access  Private (Admin, Manager)
exports.deleteLead = asyncHandler(async (req, res) => {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
        res.status(404);
        throw new Error('Lead not found');
    }

    // Only Admin and Manager can delete
    if (req.user.role !== 'Admin' && req.user.role !== 'Sales Manager') {
        res.status(403);
        throw new Error('Not authorized to delete leads');
    }

    await Lead.delete(req.params.id);

    res.json({ success: true, message: 'Lead removed' });
});
