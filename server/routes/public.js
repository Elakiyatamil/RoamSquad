const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

router.get('/discovery-tree', publicController.getDiscoveryTree);
router.get('/destinations', publicController.getDestinations);
router.get('/destinations/:slug', publicController.getDestinationDetails);

module.exports = router;
