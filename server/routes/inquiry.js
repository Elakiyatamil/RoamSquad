const express = require('express');
const router = express.Router();
const inquiryController = require('../controllers/inquiryController');
const { verifyJWT, isAdmin } = require('../middleware/auth');

// SRS: login required at inquiry confirm
router.post('/', verifyJWT, inquiryController.createInquiry);

// User: list own inquiries
router.get('/my', verifyJWT, inquiryController.getMyInquiries);

// Admin: list + view details
router.get('/', verifyJWT, isAdmin, inquiryController.getInquiries);
// Owner or admin can view
router.get('/:id', verifyJWT, inquiryController.getInquiryById);

module.exports = router;

