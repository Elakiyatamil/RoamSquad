const prisma = require('../utils/prisma');

const getTree = async (req, res) => {
    try {
        const tree = await prisma.country.findMany({
            include: {
                states: {
                    include: {
                        districts: {
                            include: {
                                destinations: true
                            }
                        }
                    }
                }
            }
        });
        res.json(tree);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Countries
const getCountries = async (req, res) => {
    try {
        const countries = await prisma.country.findMany();
        res.json(countries);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createCountry = async (req, res) => {
    try {
        const country = await prisma.country.create({ data: req.body });
        res.json(country);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateCountry = async (req, res) => {
    try {
        const country = await prisma.country.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(country);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteCountry = async (req, res) => {
    try {
        await prisma.country.delete({ where: { id: req.params.id } });
        res.json({ message: 'Country deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// States
const getStates = async (req, res) => {
    try {
        const states = await prisma.state.findMany({
            where: { countryId: req.params.id }
        });
        res.json(states);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createState = async (req, res) => {
    try {
        const state = await prisma.state.create({
            data: { ...req.body, countryId: req.params.id }
        });
        res.json(state);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateState = async (req, res) => {
    try {
        const state = await prisma.state.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(state);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteState = async (req, res) => {
    try {
        await prisma.state.delete({ where: { id: req.params.id } });
        res.json({ message: 'State deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Districts
const getDistricts = async (req, res) => {
    try {
        const districts = await prisma.district.findMany({
            where: { stateId: req.params.id }
        });
        res.json(districts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createDistrict = async (req, res) => {
    try {
        const district = await prisma.district.create({
            data: { ...req.body, stateId: req.params.id }
        });
        res.json(district);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateDistrict = async (req, res) => {
    try {
        const district = await prisma.district.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(district);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteDistrict = async (req, res) => {
    try {
        await prisma.district.delete({ where: { id: req.params.id } });
        res.json({ message: 'District deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Destinations
const getDestinationsByDistrict = async (req, res) => {
    try {
        const destinations = await prisma.destination.findMany({
            where: { districtId: req.params.id }
        });
        res.json(destinations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createDestination = async (req, res) => {
    try {
        const { name } = req.body;
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const destination = await prisma.destination.create({
            data: { ...req.body, slug, districtId: req.params.id }
        });
        res.json(destination);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getFlatDestinations = async (req, res) => {
    try {
        const { search, category, active, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);

        const where = {};
        if (search) where.name = { contains: search, mode: 'insensitive' };
        if (category) where.category = category;
        if (active !== undefined) where.active = active === 'true';

        const [destinations, total] = await Promise.all([
            prisma.destination.findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.destination.count({ where })
        ]);

        res.json({
            data: destinations,
            meta: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / take)
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getFullDestination = async (req, res) => {
    try {
        const destination = await prisma.destination.findUnique({
            where: { id: req.params.id },
            include: {
                activities: { orderBy: { sortOrder: 'asc' } },
                foodOptions: { orderBy: { sortOrder: 'asc' } },
                accommodation: true,
                travelOptions: true
            }
        });
        if (!destination) {
            return res.status(404).json({ message: 'Destination not found' });
        }
        res.json(destination);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateDestination = async (req, res) => {
    try {
        const destination = await prisma.destination.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(destination);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteDestination = async (req, res) => {
    try {
        await prisma.destination.delete({ where: { id: req.params.id } });
        res.json({ message: 'Destination deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getTree,
    getCountries, createCountry, updateCountry, deleteCountry,
    getStates, createState, updateState, deleteState,
    getDistricts, createDistrict, updateDistrict, deleteDistrict,
    getDestinationsByDistrict, createDestination, getFlatDestinations, getFullDestination, updateDestination, deleteDestination
};
