const express = require('express');
const router = express.Router();
const packageController = require('../controllers/packageController');
const eventController = require('../controllers/eventController');
const { verifyJWT, isAdmin } = require('../middleware/auth');
const prisma = require('../utils/prisma');

router.use(verifyJWT, isAdmin);

router.get('/package-interest', packageController.getPackageInterests);
router.get('/event-interest', eventController.getEventInterests);

// Debug endpoint for database visibility
router.get('/debug/db', async (req, res) => {
    try {
        const packageInterests = await prisma.packageInterest.findMany({ include: { package: true }, orderBy: { createdAt: 'desc' } });
        const eventInterests = await prisma.eventInterest.findMany({ include: { event: true }, orderBy: { createdAt: 'desc' } });
        const inquiries = await prisma.inquiry.findMany({ orderBy: { createdAt: 'desc' } });

        res.status(200).json({
            success: true,
            data: {
                packageInterests,
                eventInterests,
                inquiries
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
