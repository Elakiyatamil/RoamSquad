const express = require('express');
const router = express.Router();
const districtFeatureController = require('../controllers/districtFeatureController');
const { verifyJWT, isAdmin } = require('../middleware/auth');

router.use(verifyJWT, isAdmin);

// Must Visit Spots
router.get('/districts/:id/must-visit', districtFeatureController.getMustVisit);
router.post('/districts/:id/must-visit', districtFeatureController.createMustVisit);
router.patch('/must-visit/:id', districtFeatureController.updateMustVisit);
router.delete('/must-visit/:id', districtFeatureController.deleteMustVisit);

// Upcoming Events
router.get('/districts/:id/events', districtFeatureController.getEvents);
router.post('/districts/:id/events', districtFeatureController.createEvent);
router.patch('/events/:id', districtFeatureController.updateEvent);
router.delete('/events/:id', districtFeatureController.deleteEvent);

module.exports = router;
