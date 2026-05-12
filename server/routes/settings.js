const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { verifyJWT, isAdmin } = require('../middleware/auth');

router.get('/:key', settingsController.getSettingByKey);

// Admin only
router.use(verifyJWT, isAdmin);
router.get('/', settingsController.getSettings);
router.patch('/:key', settingsController.updateSetting);

module.exports = router;
