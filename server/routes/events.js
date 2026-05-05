const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { verifyJWT, isAdmin } = require('../middleware/auth');


// Public routes
router.get('/public', eventController.getEventsPublic);
router.post('/:id/join', verifyJWT, eventController.joinEvent);

// Admin routes
router.use(verifyJWT, isAdmin);

router.get('/', eventController.getEvents);
router.post('/', eventController.createEvent);
router.patch('/:id', eventController.updateEvent);
router.delete('/:id', eventController.deleteEvent);
router.get('/interests', eventController.getEventInterests);

module.exports = router;
