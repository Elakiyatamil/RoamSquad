const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');
const { verifyJWT } = require('../middleware/auth');

// Local Auth
router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/me', verifyJWT, authController.getMe);

// Google OAuth
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

router.get('/google/callback', 
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    (req, res) => {
        const token = authController.generateToken(req.user);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        
        // Pass token and basic user info to frontend via query params
        // In production, consider a more secure way if needed, but this is common for SPAs
        const userData = encodeURIComponent(JSON.stringify({
            id: req.user.id,
            email: req.user.email,
            name: req.user.name,
            role: req.user.role
        }));
        
        res.redirect(`${frontendUrl}/auth-success?token=${token}&user=${userData}`);
    }
);

// Prevent fallthrough into /api protected routers
router.use((req, res) => res.sendStatus(404));

module.exports = router;
