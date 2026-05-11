require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const session = require('express-session');
const passport = require('./config/passport');

const { init: initSockets } = require('./sockets');
const hierarchyRoutes = require('./routes/hierarchy');
const experienceRoutes = require('./routes/experiences');
const districtFeatureRoutes = require('./routes/districtFeatures');
const packageRoutes = require('./routes/packages');
const eventRoutes = require('./routes/events');
const requestRoutes = require('./routes/requests');
const uploadRoutes = require('./routes/upload');
const authRoutes = require('./routes/auth');
const publicRoutes = require('./routes/public');
const userTripRoutes = require('./routes/userTrips');
const wishlistRoutes = require('./routes/wishlist');
const inquiryRoutes = require('./routes/inquiry');
const interestRoutes = require('./routes/interests');
const squadLoveRoutes = require('./routes/squadLove');
const experienceController = require('./controllers/experienceController');
const { verifyJWT, isAdmin } = require('./middleware/auth');
const { getAuditLogs } = require('./controllers/auditController');

const app = express();
const server = http.createServer(app);

// Initialize Sockets
initSockets(server);

// Simplified CORS for debugging production connectivity
app.use(cors());

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Passport & Session
app.use(session({
    secret: process.env.SESSION_SECRET || 'roamsquad_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));
app.use(passport.initialize());
app.use(passport.session());

// #region agent log
// Debug-only endpoint for this session (no secrets).
app.post('/__debug-log', (req, res) => {
    // Only enabled in non-production
    if (process.env.NODE_ENV === 'production') return res.status(403).json({ ok: false });
    
    try {
        const fs = require('fs');
        const payload = {
            sessionId: 'b1a21f',
            runId: 'pre-fix',
            hypothesisId: req.body?.hypothesisId || 'H-ui',
            location: req.body?.location || 'server/index.js:/__debug-log',
            message: req.body?.message || 'debug event',
            data: req.body?.data || null,
            timestamp: Date.now(),
        };
        // Use a relative path or a generic log file in the project root
        fs.appendFileSync(path.join(__dirname, 'debug.log'), `${JSON.stringify(payload)}\n`, 'utf8');
    } catch (_) { }
    res.json({ ok: true });
});
// #endregion agent log

// Auth & Public Routes
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/user', userTripRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/inquiry', inquiryRoutes);
app.use('/api/squad-love', squadLoveRoutes);
app.get('/public/destinations/:id/accommodation', experienceController.getAccommodationPublic);

// Admin-Specific Routers (Mounted on specific sub-paths first)
app.use('/api/packages', packageRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/upload', uploadRoutes);

// Broad Admin Routers (Mounted on /api last)
app.use('/api', interestRoutes);
app.use('/api', hierarchyRoutes);
app.use('/api', experienceRoutes);
app.use('/api', districtFeatureRoutes);
app.get('/api/audit-logs', verifyJWT, isAdmin, getAuditLogs);

// Basic Health Check & Root
app.get('/', (req, res) => {
    res.json({ message: 'Roam Squad API is running smoothly.', version: '1.0.0' });
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// Dashboard Stats (Admin only)
app.get('/api/stats', verifyJWT, isAdmin, async (req, res) => {
    try {
        const prisma = require('./utils/prisma');
        const [countries, destinations, activities, pendingRequests, confirmedRequests, totalInquiries] = await Promise.all([
            prisma.country.count(),
            prisma.destination.count(),
            prisma.activity.count(),
            prisma.itineraryRequest.count({ where: { status: 'New Inquiry' } }),
            prisma.itineraryRequest.count({ where: { status: 'Journey Confirmed' } }),
            prisma.inquiry.count()
        ]);
        console.log(`[GET /api/stats] Calculated dashboard stats`);
        res.status(200).json({ 
            success: true, 
            data: { 
                countries, 
                destinations, 
                activities, 
                pendingRequests: pendingRequests + totalInquiries, 
                confirmedRequests,
                totalInquiries
            } 
        });
    } catch (error) {
        console.error(`[GET /api/stats] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('SERVER_ERROR:', err);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
    console.log(`🚀 [RoamSquad] Server running on port ${PORT}`);
    try {
        const prisma = require('./utils/prisma');
        // Simple connectivity check
        await prisma.$connect();
        console.log("✅ [RoamSquad] Database connected successfully");
    } catch (e) {
        console.error("❌ [RoamSquad] Database connection failed at startup:");
        console.error(`   Message: ${e.message}`);
        console.error(`   Error Code: ${e.code || 'N/A'}`);
        if (e.message.includes('Can\'t reach database server')) {
            console.error("   TIP: Check your DATABASE_URL in Render environment variables.");
        }
    }
});

module.exports = server;
 
  
