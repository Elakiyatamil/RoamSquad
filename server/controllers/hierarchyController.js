const prisma = require('../utils/prisma');
const { logAction } = require('../utils/auditLog');

const getTree = async (req, res) => {
    try {
        const tree = await prisma.country.findMany({
            include: {
                states: {
                    include: {
                        destinations: true,
                        districts: {
                            include: {
                                destinations: true
                            }
                        }
                    }
                }
            }
        });
        res.status(200).json({ success: true, data: tree });
    } catch (error) {
        console.error(`[GET /hierarchy/tree] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Countries
const getCountries = async (req, res) => {
    try {
        const countries = await prisma.country.findMany();
        res.status(200).json({ success: true, data: countries });
    } catch (error) {
        console.error(`[GET /countries] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const createCountry = async (req, res) => {
    try {
        const { name, active, flag, code } = req.body;
        const country = await prisma.country.create({ 
            data: { name, active, flag, code } 
        });
        await logAction(req.user, 'CREATE', 'Country', country.id, country.name);
        res.status(201).json({ success: true, data: country });
    } catch (error) {
        console.error(`[POST /countries] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const updateCountry = async (req, res) => {
    try {
        const country = await prisma.country.update({
            where: { id: req.params.id },
            data: req.body
        });
        await logAction(req.user, 'UPDATE', 'Country', country.id, country.name);
        res.status(200).json({ success: true, data: country });
    } catch (error) {
        console.error(`[PATCH /countries/${req.params.id}] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const deleteCountry = async (req, res) => {
    try {
        const country = await prisma.country.findUnique({ where: { id: req.params.id } });
        await prisma.country.delete({ where: { id: req.params.id } });
        await logAction(req.user, 'DELETE', 'Country', req.params.id, country?.name);
        res.json({ message: 'Country deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// States
const getStates = async (req, res) => {
    try {
        console.log(`[GET /countries/${req.params.id}/states] Fetching states...`);
        const states = await prisma.state.findMany({
            where: { countryId: req.params.id }
        });
        res.status(200).json({ success: true, data: states });
    } catch (error) {
        console.error(`[GET /countries/${req.params.id}/states] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const createState = async (req, res) => {
    try {
        const { name, active } = req.body;
        const state = await prisma.state.create({
            data: { name, active, countryId: req.params.id }
        });
        await logAction(req.user, 'CREATE', 'State', state.id, state.name);
        res.status(201).json({ success: true, data: state });
    } catch (error) {
        console.error(`[POST /countries/${req.params.id}/states] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const updateState = async (req, res) => {
    try {
        const state = await prisma.state.update({
            where: { id: req.params.id },
            data: req.body
        });
        await logAction(req.user, 'UPDATE', 'State', state.id, state.name);
        res.status(200).json({ success: true, data: state });
    } catch (error) {
        console.error(`[PATCH /states/${req.params.id}] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const deleteState = async (req, res) => {
    try {
        const state = await prisma.state.findUnique({ where: { id: req.params.id } });
        await prisma.state.delete({ where: { id: req.params.id } });
        await logAction(req.user, 'DELETE', 'State', req.params.id, state?.name);
        res.status(200).json({ success: true, data: { message: 'State deleted successfully' } });
    } catch (error) {
        console.error(`[DELETE /states/${req.params.id}] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Districts
const getDistricts = async (req, res) => {
    try {
        const districts = await prisma.district.findMany({
            where: { stateId: req.params.id }
        });
        res.status(200).json({ success: true, data: districts });
    } catch (error) {
        console.error(`[GET /states/${req.params.id}/districts] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const createDistrict = async (req, res) => {
    try {
        const { name, active } = req.body;
        const district = await prisma.district.create({
            data: { name, active, stateId: req.params.id }
        });
        await logAction(req.user, 'CREATE', 'District', district.id, district.name);
        res.status(201).json({ success: true, data: district });
    } catch (error) {
        console.error(`[POST /states/${req.params.id}/districts] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const updateDistrict = async (req, res) => {
    try {
        const district = await prisma.district.update({
            where: { id: req.params.id },
            data: req.body
        });
        await logAction(req.user, 'UPDATE', 'District', district.id, district.name);
        res.status(200).json({ success: true, data: district });
    } catch (error) {
        console.error(`[PATCH /districts/${req.params.id}] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const deleteDistrict = async (req, res) => {
    try {
        const district = await prisma.district.findUnique({ where: { id: req.params.id } });
        await prisma.district.delete({ where: { id: req.params.id } });
        await logAction(req.user, 'DELETE', 'District', req.params.id, district?.name);
        res.status(200).json({ success: true, data: { message: 'District deleted successfully' } });
    } catch (error) {
        console.error(`[DELETE /districts/${req.params.id}] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Destinations
const getDestinationsByDistrict = async (req, res) => {
    try {
        const destinations = await prisma.destination.findMany({
            where: { districtId: req.params.districtId }
        });
        res.status(200).json({ success: true, data: destinations });
    } catch (error) {
        console.error(`[GET /districts/${req.params.districtId}/destinations] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const getDestinationsByState = async (req, res) => {
    try {
        const destinations = await prisma.destination.findMany({
            where: { stateId: req.params.stateId },
            include: { state: true, district: true }
        });
        res.status(200).json({ success: true, data: destinations });
    } catch (error) {
        console.error(`[GET /states/${req.params.stateId}/destinations] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const createDestination = async (req, res) => {
    try {
        const { name, category = 'Other', rating = 0, status = 'ACTIVE', active = true, coverImage = null, description = '' } = req.body;
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const districtId = req.params.districtId;
        const district = await prisma.district.findUnique({
            where: { id: districtId },
            select: { stateId: true }
        });

        if (!district) {
            return res.status(404).json({ success: false, error: 'District not found' });
        }

        const destination = await prisma.destination.create({
            data: { 
                name, 
                category, 
                rating: parseFloat(rating) || 0, 
                active,
                status, 
                coverImage, 
                description, 
                slug, 
                districtId,
                stateId: district.stateId
            }
        });
        await logAction(req.user, 'CREATE', 'Destination', destination.id, destination.name);
        res.status(201).json({ success: true, data: destination });
    } catch (error) {
        console.error(`[POST /districts/${req.params.districtId}/destinations] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const createDestinationUnderState = async (req, res) => {
    try {
        const { name, category = 'Other', rating = 0, status = 'ACTIVE', active = true, coverImage = null, description = '', districtId } = req.body;
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const stateId = req.params.stateId;
        const state = await prisma.state.findUnique({ where: { id: stateId }, select: { id: true } });

        if (!state) {
            return res.status(404).json({ success: false, error: 'State not found' });
        }

        let normalizedDistrictId = null;
        if (districtId) {
            const district = await prisma.district.findFirst({
                where: { id: districtId, stateId },
                select: { id: true }
            });
            if (!district) {
                return res.status(400).json({ success: false, error: 'District not found in this state' });
            }
            normalizedDistrictId = district.id;
        }

        const destination = await prisma.destination.create({
            data: {
                name,
                category,
                rating: parseFloat(rating) || 0,
                active,
                status,
                coverImage,
                description,
                slug,
                stateId,
                districtId: normalizedDistrictId
            }
        });
        await logAction(req.user, 'CREATE', 'Destination', destination.id, destination.name);
        res.status(201).json({ success: true, data: destination });
    } catch (error) {
        console.error(`[POST /states/${req.params.stateId}/destinations] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
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
        if (req.query.status) where.status = req.query.status;
        if (active !== undefined) where.active = active === 'true';

        const [destinations, total] = await Promise.all([
            prisma.destination.findMany({
                where,
                skip,
                take,
                include: {
                    state: true,
                    district: { include: { state: true } }
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.destination.count({ where })
        ]);

        res.status(200).json({
            success: true,
            data: destinations,
            meta: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / take)
            }
        });
    } catch (error) {
        console.error(`[GET /destinations/flat] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const getFullDestination = async (req, res) => {
    try {
        const destination = await prisma.destination.findUnique({
            where: { id: req.params.id },
            include: {
                activities: { orderBy: { sortOrder: 'asc' } },
                foodOptions: { orderBy: { sortOrder: 'asc' } },
                accommodations: true,
                travelOptions: true,
                state: { include: { country: true } },
                district: { include: { state: true } }
            }
        });
        if (!destination) {
            return res.status(404).json({ success: false, error: 'Destination not found' });
        }
        res.status(200).json({ success: true, data: destination });
    } catch (error) {
        console.error(`[GET /destinations/${req.params.id}] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const updateDestination = async (req, res) => {
    try {
        const { id, name, description, category, rating, active, status, slug, coverImage, images, avgCost, bestSeason } = req.body;
        
        const updateData = {
            name,
            description,
            category,
            rating: parseFloat(rating) || 0,
            active: active === true,
            status: status || 'ACTIVE',
            slug,
            coverImage,
            images,
            avgCost,
            bestSeason
        };

        // allow updating state or district
        if (req.body.stateId !== undefined) updateData.stateId = req.body.stateId;
        if (req.body.districtId !== undefined) updateData.districtId = req.body.districtId || null;

        // Filter out undefined fields to prevent Prisma errors
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

        const destination = await prisma.destination.update({
            where: { id: req.params.id },
            data: updateData
        });
        
        await logAction(req.user, 'UPDATE', 'Destination', destination.id, destination.name);
        res.status(200).json({ success: true, data: destination });
    } catch (error) {
        console.error(`[PATCH /destinations/${req.params.id}] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const deleteDestination = async (req, res) => {
    try {
        const destination = await prisma.destination.findUnique({ where: { id: req.params.id } });
        await prisma.destination.delete({ where: { id: req.params.id } });
        await logAction(req.user, 'DELETE', 'Destination', req.params.id, destination?.name);
        res.status(200).json({ success: true, data: { message: 'Destination deleted successfully' } });
    } catch (error) {
        console.error(`[DELETE /destinations/${req.params.id}] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    getTree,
    getCountries, createCountry, updateCountry, deleteCountry,
    getStates, createState, updateState, deleteState,
    getDistricts, createDistrict, updateDistrict, deleteDistrict,
    getDestinationsByDistrict, getDestinationsByState, createDestination, createDestinationUnderState, getFlatDestinations, getFullDestination, updateDestination, deleteDestination
};
