const express = require('express');
const router = express.Router();
const experienceController = require('../controllers/experienceController');
const { verifyJWT, isAdmin } = require('../middleware/auth');

router.use(verifyJWT, isAdmin);

// Activities
router.get('/destinations/:id/activities', experienceController.getActivities);
router.post('/destinations/:id/activities', experienceController.createActivity);
router.patch('/activities/:id', experienceController.updateActivity);
router.delete('/activities/:id', experienceController.deleteActivity);
router.patch('/destinations/:id/activities/reorder', experienceController.reorderActivities);

// Food Options
router.get('/destinations/:id/food', experienceController.getFoodOptions);
router.post('/destinations/:id/food', experienceController.createFoodOption);
router.patch('/food/:id', experienceController.updateFoodOption);
router.delete('/food/:id', experienceController.deleteFoodOption);

// Accommodation
router.get('/destinations/:id/accommodation', experienceController.getAccommodationAdmin);
router.post('/destinations/:id/accommodation', experienceController.createAccommodation);
router.patch('/accommodation/:id', experienceController.updateAccommodation);
router.delete('/accommodation/:id', experienceController.deleteAccommodation);

// Travel Options
router.get('/destinations/:id/travel-options', experienceController.getTravelOptions);
router.post('/destinations/:id/travel-options', experienceController.createTravelOption);
router.patch('/travel-options/:id', experienceController.updateTravelOption);
router.delete('/travel-options/:id', experienceController.deleteTravelOption);

module.exports = router;
