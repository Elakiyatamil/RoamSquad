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
const experienceController = require('./controllers/experienceController');

const app = express();
const server = http.createServer(app);

// Initialize Sockets
initSockets(server);

app.use(cors());
app.use(express.json());

// Public Endpoints
app.get('/public/destinations/:id/accommodation', experienceController.getAccommodationPublic);

// Admin Routes (JWT & Admin checks are inside the route files)
app.use('/api', hierarchyRoutes);
app.use('/api', experienceRoutes);
app.use('/api', districtFeatureRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

// Basic Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
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
