const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
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
    const token = authController.generateToken(req.user, true);
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

// Auth Diagnostics
router.get('/status', (req, res) => {
    const rawId = process.env.GOOGLE_CLIENT_ID || '';
    const hasSecret = !!process.env.GOOGLE_CLIENT_SECRET;
    const maskedId = rawId ? `${rawId.substring(0, 10)}...${rawId.slice(-15)}` : 'NOT_SET';
    res.json({
        ok: true,
        googleOAuth: {
            configured: !!rawId && hasSecret && !rawId.includes('placeholder'),
            clientIdMasked: maskedId,
            callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5005/api/auth/google/callback',
            devMockOAuth: process.env.DEV_MOCK_OAUTH === 'true'
        }
    });
});

// Local Auth
router.post('/login', authLimiter, authController.login);
router.post('/register', authLimiter, authController.register);
router.get('/me', verifyJWT, authController.getMe);

const prisma = require('../utils/prisma');

// Google OAuth
router.get('/google', (req, res, next) => {
    if (process.env.DEV_MOCK_OAUTH === 'true') {
        const mockProfile = {
            id: 'mock_google_dev_123',
            email: 'dev.google.user@example.com',
            name: 'Google Dev User',
            avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'
        };

        prisma.user.upsert({
            where: { email: mockProfile.email },
            update: { googleId: mockProfile.id },
            create: {
                email: mockProfile.email,
                name: mockProfile.name,
                googleId: mockProfile.id,
                avatarUrl: mockProfile.avatarUrl,
                role: 'USER'
            }
        }).then(user => {
            req.user = user;
            return oauthCallback(req, res);
        }).catch(next);
        return;
    }

    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login' }), oauthCallback);

// Prevent fallthrough into /api protected routers
router.use((req, res) => res.sendStatus(404));

module.exports = router;
