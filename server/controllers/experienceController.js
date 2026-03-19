const prisma = require('../utils/prisma');
const { logAction } = require('../utils/auditLog');

// Activities
const getActivities = async (req, res) => {
    try {
        const destinationId = req.params.id || req.query.destinationId;
        const where = destinationId ? { destinationId } : {};
        
        const activities = await prisma.activity.findMany({
            where,
            orderBy: { sortOrder: 'asc' }
        });
        res.json(activities);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createActivity = async (req, res) => {
    try {
        const { name, duration, price, description, destinationId } = req.body;

        if (!destinationId) {
            return res.status(400).json({ error: "destinationId required" });
        }

        const activity = await prisma.activity.create({
            data: {
                name,
                duration,
                price: Number(price) || 0,
                description: description || "",
                destinationId,
                isActive: req.body.isActive !== undefined ? req.body.isActive : true,
                icon: req.body.icon || '📍',
                sortOrder: req.body.sortOrder || 0
            }
        });
        await logAction(req.user, 'CREATE', 'Activity', activity.id, activity.name);
        res.json(activity);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const updateActivity = async (req, res) => {
    try {
        const activity = await prisma.activity.update({
            where: { id: req.params.id },
            data: req.body
        });
        await logAction(req.user, 'UPDATE', 'Activity', activity.id, activity.name);
        res.json(activity);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteActivity = async (req, res) => {
    try {
        const activity = await prisma.activity.findUnique({ where: { id: req.params.id } });
        await prisma.activity.delete({ where: { id: req.params.id } });
        await logAction(req.user, 'DELETE', 'Activity', req.params.id, activity?.name);
        res.json({ message: 'Activity deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const reorderActivities = async (req, res) => {
    try {
        const { order } = req.body; // Array of IDs
        await Promise.all(order.map((id, index) =>
            prisma.activity.update({
                where: { id },
                data: { sortOrder: index }
            })
        ));
        res.json({ message: 'Activities reordered successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Food Options
const getFoodOptions = async (req, res) => {
    try {
        const { mealType, destinationId: queryId } = req.query;
        const destinationId = req.params.id || queryId;
        const where = destinationId ? { destinationId } : {};
        
        if (mealType) where.mealType = mealType;

        const food = await prisma.foodOption.findMany({
            where,
            orderBy: { sortOrder: 'asc' }
        });
        res.json(food);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createFoodOption = async (req, res) => {
    try {
        const { name, type, price, description, destinationId } = req.body;

        if (!destinationId) {
            return res.status(400).json({ error: "destinationId required" });
        }

        const food = await prisma.foodOption.create({
            data: {
                name,
                type: type || req.body.mealType || 'RESTAURANT',
                price: Number(price) || 0,
                description: description || req.body.description || "",
                destinationId,
                mealType: req.body.mealType || type || 'LUNCH',
                dietaryTags: req.body.dietaryTags || [],
                isActive: req.body.isActive !== undefined ? req.body.isActive : true,
                icon: req.body.icon || req.body.emoji || '🍴',
                sortOrder: req.body.sortOrder || 0
            }
        });
        await logAction(req.user, 'CREATE', 'FoodOption', food.id, food.name);
        res.json(food);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const updateFoodOption = async (req, res) => {
    try {
        const food = await prisma.foodOption.update({
            where: { id: req.params.id },
            data: req.body
        });
        await logAction(req.user, 'UPDATE', 'FoodOption', food.id, food.name);
        res.json(food);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteFoodOption = async (req, res) => {
    try {
        const food = await prisma.foodOption.findUnique({ where: { id: req.params.id } });
        await prisma.foodOption.delete({ where: { id: req.params.id } });
        await logAction(req.user, 'DELETE', 'FoodOption', req.params.id, food?.name);
        res.json({ message: 'Food option deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Accommodation
const getAccommodationAdmin = async (req, res) => {
    try {
        const destinationId = req.params.id || req.query.destinationId;
        const where = destinationId ? { destinationId } : {};

        const accommodation = await prisma.accommodation.findMany({
            where
        });
        res.json(accommodation);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAccommodationPublic = async (req, res) => {
    try {
        const accommodation = await prisma.accommodation.findMany({
            where: { destinationId: req.params.id, isActive: true },
            select: {
                id: true,
                tier: true,
                description: true,
                stars: true,
                price: true,
                includes: true,
                imageUrl: true
            }
        });
        res.json(accommodation);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createAccommodation = async (req, res) => {
    try {
        const { tier, price, destinationId } = req.body;

        if (!destinationId) {
            return res.status(400).json({ error: "destinationId required" });
        }

        const acc = await prisma.accommodation.create({
            data: {
                tier,
                price: Number(price) || 0,
                destinationId,
                hotelNameInternal: req.body.hotelNameInternal || "",
                description: req.body.description || "",
                stars: req.body.stars ? Number(req.body.stars) : 3,
                includes: req.body.includes || [],
                imageUrl: req.body.imageUrl || "",
                isActive: req.body.isActive !== undefined ? req.body.isActive : true
            }
        });

        await logAction(req.user, 'CREATE', 'Accommodation', acc.id, `${acc.tier} tier`);
        res.json(acc);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const updateAccommodation = async (req, res) => {
    try {
        const acc = await prisma.accommodation.update({
            where: { id: req.params.id },
            data: req.body
        });
        await logAction(req.user, 'UPDATE', 'Accommodation', acc.id, `${acc.tier} tier`);
        res.json(acc);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteAccommodation = async (req, res) => {
    try {
        const acc = await prisma.accommodation.findUnique({ where: { id: req.params.id } });
        await prisma.accommodation.delete({ where: { id: req.params.id } });
        await logAction(req.user, 'DELETE', 'Accommodation', req.params.id, acc?.tier);
        res.json({ message: 'Accommodation deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Travel Options
const getTravelOptions = async (req, res) => {
    try {
        const destinationId = req.params.id || req.query.destinationId;
        const where = destinationId ? { destinationId } : {};
        const options = await prisma.travelOption.findMany({
            where
        });
        res.json(options);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createTravelOption = async (req, res) => {
    try {
        const destinationId = req.params.id || req.body.destinationId;
        if (!destinationId) return res.status(400).json({ error: "destinationId required" });

        const option = await prisma.travelOption.create({
            data: { 
                mode: req.body.mode || "Road",
                cost: Number(req.body.cost) || 0,
                duration: req.body.duration || "1h",
                destinationId,
                icon: req.body.icon || "🚘",
                description: req.body.description || ""
            }
        });

        await logAction(req.user, 'CREATE', 'TravelOption', option.id, option.mode);
        res.json(option);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateTravelOption = async (req, res) => {
    try {
        const option = await prisma.travelOption.update({
            where: { id: req.params.id },
            data: req.body
        });
        await logAction(req.user, 'UPDATE', 'TravelOption', option.id, option.mode);
        res.json(option);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteTravelOption = async (req, res) => {
    try {
        const option = await prisma.travelOption.findUnique({ where: { id: req.params.id } });
        await prisma.travelOption.delete({ where: { id: req.params.id } });
        await logAction(req.user, 'DELETE', 'TravelOption', req.params.id, option?.mode);
        res.json({ message: 'Travel option deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getActivities, createActivity, updateActivity, deleteActivity, reorderActivities,
    getFoodOptions, createFoodOption, updateFoodOption, deleteFoodOption,
    getAccommodationAdmin, getAccommodationPublic, createAccommodation, updateAccommodation, deleteAccommodation,
    getTravelOptions, createTravelOption, updateTravelOption, deleteTravelOption
};
