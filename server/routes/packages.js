const express = require('express');
const router = express.Router();
const packageController = require('../controllers/packageController');
const { verifyJWT, isAdmin } = require('../middleware/auth');

const { upload } = require('../controllers/uploadController');

// Public routes
router.get('/public', packageController.getPackagesPublic);
router.post('/:id/interest', verifyJWT, packageController.createPackageInterest);

// Admin routes
router.use(verifyJWT, isAdmin);

router.get('/', packageController.getPackages);
router.post('/', upload.single('image'), packageController.createPackage);
router.patch('/:id', upload.single('image'), packageController.updatePackage);
router.delete('/:id', packageController.deletePackage);
router.get('/interests', packageController.getPackageInterests);

module.exports = router;
