const prisma = require('../utils/prisma');

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

exports.addToWishlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const { entityType, entityId } = req.body;

        if (!['Destination', 'Activity'].includes(entityType)) {
            return res.status(400).json({ error: 'Invalid entity type' });
        }

        const item = await prisma.wishlistItem.upsert({
            where: {
                userId_entityType_entityId: { userId, entityType, entityId }
            },
            update: {},
            create: { userId, entityType, entityId }
        });

        res.json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.removeFromWishlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        await prisma.wishlistItem.deleteMany({
            where: { id, userId }
        });

        res.json({ message: 'Removed from wishlist' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.syncWishlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const { items } = req.body; // Array of { entityType, entityId }

        if (!Array.isArray(items)) {
            return res.status(400).json({ error: 'Items must be an array' });
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

        res.json(updatedWishlist);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
