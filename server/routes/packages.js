const express = require('express');
const router = express.Router();
const packageController = require('../controllers/packageController');
const { verifyJWT, isAdmin } = require('../middleware/auth');

router.use(verifyJWT, isAdmin);

router.get('/', packageController.getPackages);
router.post('/', packageController.createPackage);
router.patch('/:id', packageController.updatePackage);
router.delete('/:id', packageController.deletePackage);

module.exports = router;
