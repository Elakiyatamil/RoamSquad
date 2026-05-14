const express = require('express');
const router = express.Router();
const passport = require('passport');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const { verifyJWT } = require('../middleware/auth');

// Rate limiting for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per windowMs (login/register)
    message: { success: false, message: 'Too many attempts, please try again after 15 minutes' }
});

const oauthCallback = (req, res) => {
    const token = authController.generateToken(req.user);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    const userData = encodeURIComponent(JSON.stringify({
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role,
        avatarUrl: req.user.avatarUrl
    }));
    
    res.redirect(`${frontendUrl}/auth-success?token=${token}&user=${userData}`);
};

// Local Auth
router.post('/login', authLimiter, authController.login);
router.post('/register', authLimiter, authController.register);
router.get('/me', verifyJWT, authController.getMe);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login' }), oauthCallback);

// Facebook OAuth
router.get('/facebook', passport.authenticate('facebook', { scope: ['email', 'public_profile'] }));
router.get('/facebook/callback', passport.authenticate('facebook', { session: false, failureRedirect: '/login' }), oauthCallback);

// Instagram OAuth
router.get('/instagram', passport.authenticate('instagram'));
router.get('/instagram/callback', passport.authenticate('instagram', { session: false, failureRedirect: '/login' }), oauthCallback);

// Prevent fallthrough into /api protected routers
router.use((req, res) => res.sendStatus(404));

module.exports = router;
