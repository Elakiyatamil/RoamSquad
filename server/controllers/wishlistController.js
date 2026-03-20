const prisma = require('../utils/prisma');

exports.getWishlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const items = await prisma.wishlistItem.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
        
        const enriched = await Promise.all(items.map(async (item) => {
            if (item.entityType === 'Destination') {
                const dest = await prisma.destination.findUnique({ 
                    where: { id: item.entityId },
                    include: { activities: true }
                });
                return {
                    id: item.id,
                    entityId: item.entityId,
                    destinationName: dest ? dest.name : 'Unknown Destination',
                    date: item.createdAt,
                    budget: dest ? parseFloat(dest.avgCost?.replace(/[^0-9.-]+/g,"") || '0') : 0,
                    activities: dest?.activities || [],
                    image: dest?.coverImage || null
                };
            }
            return { id: item.id, destinationName: 'Unknown', date: item.createdAt, budget: 0, activities: [] };
        }));

        res.status(200).json({ success: true, data: enriched });
    } catch (error) {
        console.error(`[GET /wishlist] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.addToWishlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const { entityType, entityId } = req.body;

        if (!['Destination', 'Activity'].includes(entityType)) {
            return res.status(400).json({ success: false, error: 'Invalid entity type' });
        }

        const item = await prisma.wishlistItem.upsert({
            where: {
                userId_entityType_entityId: { userId, entityType, entityId }
            },
            update: {},
            create: { userId, entityType, entityId }
        });

        res.status(201).json({ success: true, data: item });
    } catch (error) {
        console.error(`[POST /wishlist] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.removeFromWishlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        await prisma.wishlistItem.deleteMany({
            where: { id, userId }
        });

        res.status(200).json({ success: true, message: 'Removed from wishlist' });
    } catch (error) {
        console.error(`[DELETE /wishlist/${req.params.id}] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.syncWishlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const { items } = req.body; // Array of { entityType, entityId }

        if (!Array.isArray(items)) {
            return res.status(400).json({ success: false, error: 'Items must be an array' });
        }

        const operations = items.map(item => 
            prisma.wishlistItem.upsert({
                where: {
                    userId_entityType_entityId: { 
                        userId, 
                        entityType: item.entityType, 
                        entityId: item.entityId 
                    }
                },
                update: {},
                create: { 
                    userId, 
                    entityType: item.entityType, 
                    entityId: item.entityId 
                }
            })
        );

        await Promise.all(operations);
        
        const updatedWishlist = await prisma.wishlistItem.findMany({
            where: { userId }
        });

        res.status(200).json({ success: true, data: updatedWishlist });
    } catch (error) {
        console.error(`[POST /wishlist/sync] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.createWishlistLead = async (req, res) => {
    try {
        const { email, destination, itinerary, totalBudget } = req.body;
        const lead = await prisma.wishlistLead.create({
            data: {
                email,
                destination: destination || "Unknown",
                itinerary: itinerary || {},
                totalBudget: parseFloat(totalBudget) || 0
            }
        });
        res.status(201).json({ success: true, data: lead });
    } catch (error) {
        console.error(`[POST /wishlist/lead] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getWishlistLeads = async (req, res) => {
    try {
        const leads = await prisma.wishlistLead.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ success: true, data: leads });
    } catch (error) {
        console.error(`[GET /wishlist/leads] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getWishlistLeadsByEmail = async (req, res) => {
    try {
        const { email } = req.params;
        if (!email) return res.status(400).json({ success: false, error: 'Email is required' });
        
        const leads = await prisma.wishlistLead.findMany({
            where: { email },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ success: true, data: leads });
    } catch (error) {
        console.error(`[GET /wishlist/leads/${req.params.email}] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};
