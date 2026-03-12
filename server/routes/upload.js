const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { verifyJWT, isAdmin } = require('../middleware/auth');

router.use(verifyJWT, isAdmin);

router.post('/image', uploadController.upload.single('image'), uploadController.uploadSingle);
router.post('/images', uploadController.upload.array('images', 10), uploadController.uploadMultiple);
router.delete('/image', uploadController.deleteImage);

module.exports = router;
