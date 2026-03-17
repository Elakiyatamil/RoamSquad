const prisma = require('../utils/prisma');
const { getIO } = require('../sockets');

// Create a new trip plan (draft or finalized)
exports.saveTripPlan = async (req, res) => {
    try {
        const { name, daysCount, travelers, travelType, vibe, budget, items, isFinalized } = req.body;
        const userId = req.user?.id; // Optional

        const tripPlan = await prisma.tripPlan.create({
            data: {
                userId,
                name,
                daysCount,
                travelers,
                travelType,
                vibe,
                budget,
                items,
                isFinalized
            }
        });

        res.status(201).json(tripPlan);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all trip plans for the logged-in user
exports.getUserTripPlans = async (req, res) => {
    try {
        const userId = req.user.id;
        const plans = await prisma.tripPlan.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' }
        });
        res.json(plans);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create a trip inquiry
exports.createInquiry = async (req, res) => {
    try {
        const { 
            userName, 
            userEmail, 
            userPhone, 
            destination, 
            travelDates, 
            budget, 
            travelers, 
            travelType, 
            vibe, 
            activities 
        } = req.body;
        
        const userId = req.user?.id;

        const inquiry = await prisma.itineraryRequest.create({
            data: {
                userId,
                userName,
                userEmail,
                userPhone,
                destination,
                travelDates,
                budget,
                travelers,
                travelType,
                vibe,
                activities,
                status: 'New Inquiry'
            }
        });

        // Notify admin via socket
        const io = getIO();
        io.emit('request:new', inquiry);

        res.status(201).json(inquiry);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Add item to wishlist
exports.addToWishlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const { entityType, entityId } = req.body;

        const item = await prisma.wishlistItem.upsert({
            where: {
                userId_entityType_entityId: {
                    userId,
                    entityType,
                    entityId
                }
            },
            update: {},
            create: {
                userId,
                entityType,
                entityId
            }
        });

        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get user wishlist
exports.getWishlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const items = await prisma.wishlistItem.findMany({
            where: { userId }
        });
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
