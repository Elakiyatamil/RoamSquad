const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

router.get('/discovery-tree', publicController.getDiscoveryTree);
router.get('/destinations', publicController.getDestinations);
router.get('/destination/:id', publicController.getDestinationById); // Enforced singular route
router.get('/destinations/id/:id', publicController.getDestinationById);
router.get('/destinations/:slug', publicController.getDestinationDetails);



// Hierarchy Selection
router.get('/countries', publicController.getCountries);
router.get('/states/:countryId', publicController.getStates);
router.get('/districts/:stateId', publicController.getDistricts);
router.get('/destinations/state/:stateId', publicController.getDestinationsByState);
router.get('/destinations/district/:districtId', publicController.getDestinationsByDistrict);

// Granular Destination Details
router.get('/destinations/:id/activities', publicController.getDestinationActivities);
router.get('/destinations/:id/accommodation', publicController.getDestinationAccommodation);
router.get('/destinations/:id/food', publicController.getDestinationFood);
router.get('/destinations/:id/travel-options', publicController.getDestinationTravelOptions);
router.get('/squad-love', publicController.getSquadLove);

module.exports = router;
