const express = require('express');
const { 
    getLeads, 
    getLead, 
    createLead, 
    updateLead, 
    deleteLead 
} = require('../controllers/leadController');
const { addNote, getLeadNotes } = require('../controllers/noteController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/export', require('../controllers/exportController').exportLeads);

router.route('/')
    .get(getLeads)
    .post(authorize('Admin'), createLead);

router.route('/:id')
    .get(getLead)
    .put(updateLead)
    .delete(authorize('Admin'), deleteLead);

// Notes routes
router.route('/:leadId/notes')
    .get(getLeadNotes)
    .post(addNote);

// Assignment route
router.post('/assign', authorize('Admin', 'Sales Manager'), require('../controllers/assignmentController').assignLead);

const upload = require('../middleware/uploadMiddleware');

// Follow-up routes
router.get('/followups/all', require('../controllers/followupController').getAllFollowups);
router.get('/:leadId/followups', require('../controllers/followupController').getLeadFollowups);
router.post('/followups', require('../controllers/followupController').addFollowup);

// Attachment routes
const attCtrl = require('../controllers/attachmentController');
router.get('/:leadId/attachments', attCtrl.getLeadAttachments);
router.post('/attachments', upload.single('file'), attCtrl.uploadAttachment);
router.delete('/attachments/:id', attCtrl.deleteAttachment);

// Email sending
router.post('/send-email', require('../controllers/emailController').sendTemplateEmail);

module.exports = router;
