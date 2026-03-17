const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

const { verifyJWT } = require('../middleware/auth');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/me', verifyJWT, authController.getMe);

// Prevent fallthrough into /api protected routers
router.use((req, res) => res.sendStatus(404));

module.exports = router;
