const express = require('express');
const router = express.Router();
const userTripController = require('../controllers/userTripController');
const { verifyJWT } = require('../middleware/auth');

// Public inquiry (can be done without login, but plan is usually saved first)
router.post('/inquiry', userTripController.createInquiry);

// Protected routes
router.get('/plans', verifyJWT, userTripController.getUserTripPlans);
router.post('/plans', userTripController.saveTripPlan); // Can be semi-public (save with userId if logged in)

router.get('/wishlist', verifyJWT, userTripController.getWishlist);
router.post('/wishlist', verifyJWT, userTripController.addToWishlist);

module.exports = router;
