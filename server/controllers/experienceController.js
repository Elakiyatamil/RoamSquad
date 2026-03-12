const prisma = require('../utils/prisma');

// Activities
const getActivities = async (req, res) => {
    try {
        const activities = await prisma.activity.findMany({
            where: { destinationId: req.params.id },
            orderBy: { sortOrder: 'asc' }
        });
        res.json(activities);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createActivity = async (req, res) => {
    try {
        const activity = await prisma.activity.create({
            data: { ...req.body, destinationId: req.params.id }
        });
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
        res.json(activity);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteActivity = async (req, res) => {
    try {
        await prisma.activity.delete({ where: { id: req.params.id } });
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
        const { mealType } = req.query;
        const where = { destinationId: req.params.id };
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
        const food = await prisma.foodOption.create({
            data: { ...req.body, destinationId: req.params.id }
        });
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
        res.json(food);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteFoodOption = async (req, res) => {
    try {
        await prisma.foodOption.delete({ where: { id: req.params.id } });
        res.json({ message: 'Food option deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Accommodation
const getAccommodationAdmin = async (req, res) => {
    try {
        const accommodation = await prisma.accommodation.findMany({
            where: { destinationId: req.params.id }
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
                vibeDescription: true,
                stars: true,
                pricePerNight: true,
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
        const acc = await prisma.accommodation.create({
            data: { ...req.body, destinationId: req.params.id }
        });
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
        res.json(acc);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteAccommodation = async (req, res) => {
    try {
        await prisma.accommodation.delete({ where: { id: req.params.id } });
        res.json({ message: 'Accommodation deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Travel Options
const getTravelOptions = async (req, res) => {
    try {
        const options = await prisma.travelOption.findMany({
            where: { destinationId: req.params.id }
        });
        res.json(options);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createTravelOption = async (req, res) => {
    try {
        const option = await prisma.travelOption.create({
            data: { ...req.body, destinationId: req.params.id }
        });
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
        res.json(option);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteTravelOption = async (req, res) => {
    try {
        await prisma.travelOption.delete({ where: { id: req.params.id } });
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
