const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { verifyJWT, isAdmin } = require('../middleware/auth');

// Public routes
router.get('/public', eventController.getEventsPublic);
router.get('/:id', eventController.getEventById);

// Protected routes (User)
router.post('/:id/register', verifyJWT, eventController.createRegistrationOrder);
router.post('/verify-payment', verifyJWT, eventController.verifyRegistrationPayment);
router.get('/me/registrations', verifyJWT, eventController.getMyRegistrations);

// Admin routes
router.use(verifyJWT, isAdmin);

router.get('/', eventController.getEvents);
router.post('/', eventController.createEvent);
router.patch('/:id', eventController.updateEvent);
router.delete('/:id', eventController.deleteEvent);

router.get('/admin/registrations', eventController.getRegistrations);

router.post('/:id/reviews', eventController.createAdminReview);
router.delete('/reviews/:reviewId', eventController.deleteReview);

module.exports = router;
