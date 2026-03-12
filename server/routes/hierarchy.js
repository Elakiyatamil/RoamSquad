const express = require('express');
const router = express.Router();
const hierarchyController = require('../controllers/hierarchyController');
const { verifyJWT, isAdmin } = require('../middleware/auth');

router.use(verifyJWT, isAdmin);

router.get('/tree', hierarchyController.getTree);

// Countries
router.get('/countries', hierarchyController.getCountries);
router.post('/countries', hierarchyController.createCountry);
router.patch('/countries/:id', hierarchyController.updateCountry);
router.delete('/countries/:id', hierarchyController.deleteCountry);

// States
router.get('/countries/:id/states', hierarchyController.getStates);
router.post('/countries/:id/states', hierarchyController.createState);
router.patch('/states/:id', hierarchyController.updateState);
router.delete('/states/:id', hierarchyController.deleteState);

// Districts
router.get('/states/:id/districts', hierarchyController.getDistricts);
router.post('/states/:id/districts', hierarchyController.createDistrict);
router.patch('/districts/:id', hierarchyController.updateDistrict);
router.delete('/districts/:id', hierarchyController.deleteDistrict);

// Destinations
router.get('/districts/:id/destinations', hierarchyController.getDestinationsByDistrict);
router.post('/districts/:id/destinations', hierarchyController.createDestination);
router.get('/destinations', hierarchyController.getFlatDestinations);
router.get('/destinations/:id', hierarchyController.getFullDestination);
router.patch('/destinations/:id', hierarchyController.updateDestination);
router.delete('/destinations/:id', hierarchyController.deleteDestination);

module.exports = router;
