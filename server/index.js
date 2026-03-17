const express = require('express');
const cors = require('cors');
const http = require('http');
require('dotenv').config();

const { init: initSockets } = require('./sockets');
const hierarchyRoutes = require('./routes/hierarchy');
const experienceRoutes = require('./routes/experiences');
const districtFeatureRoutes = require('./routes/districtFeatures');
const packageRoutes = require('./routes/packages');
const requestRoutes = require('./routes/requests');
const uploadRoutes = require('./routes/upload');
const authRoutes = require('./routes/auth');
const publicRoutes = require('./routes/public');
const userTripRoutes = require('./routes/userTrips');
const wishlistRoutes = require('./routes/wishlist');
const experienceController = require('./controllers/experienceController');
const { verifyJWT, isAdmin } = require('./middleware/auth');
const { getAuditLogs } = require('./controllers/auditController');

const app = express();
const server = http.createServer(app);

// Initialize Sockets
initSockets(server);

app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
    credentials: true,
}));
app.use(express.json());

// Auth & Public Routes
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/user', userTripRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.get('/public/destinations/:id/accommodation', experienceController.getAccommodationPublic);

// Admin Routes (JWT & Admin checks are inside the route files)
app.use('/api', hierarchyRoutes);
app.use('/api', experienceRoutes);
app.use('/api', districtFeatureRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/upload', uploadRoutes);
app.get('/api/audit-logs', verifyJWT, isAdmin, getAuditLogs);

// Basic Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// Dashboard Stats (Admin only)
app.get('/api/stats', verifyJWT, isAdmin, async (req, res) => {
    try {
        const prisma = require('./utils/prisma');
        const [countries, destinations, activities, pendingRequests, confirmedRequests] = await Promise.all([
            prisma.country.count(),
            prisma.destination.count(),
            prisma.activity.count(),
            prisma.itineraryRequest.count({ where: { status: 'New Inquiry' } }),
            prisma.itineraryRequest.count({ where: { status: 'Journey Confirmed' } }),
        ]);
        res.json({ countries, destinations, activities, pendingRequests, confirmedRequests });
    } catch (error) {
        res.status(500).json({ error: error.message });
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
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = server;
