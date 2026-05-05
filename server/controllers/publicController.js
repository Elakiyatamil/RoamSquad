const prisma = require('../utils/prisma');

// Get all countries with states and districts (for discovery)
exports.getDiscoveryTree = async (req, res) => {
    try {
        const tree = await prisma.country.findMany({
            where: { active: true },
            include: {
                states: {
                    where: { active: true },
                    include: {
                        districts: {
                            where: { active: true },
                            include: {
                                destinations: {
                                    where: { status: 'ACTIVE' }
                                },
                                _count: {
                                    select: { destinations: true }
                                }
                            }
                        }
                    }
                }
            }
        });
        res.status(200).json({ success: true, data: tree });
    } catch (error) {
        console.error(`[GET /discovery-tree] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get all active destinations with highlights and prices
exports.getDestinations = async (req, res) => {
    try {
        const destinations = await prisma.destination.findMany({
            where: { status: 'ACTIVE' },
            include: {
                state: {
                    include: {
                        country: true
                    }
                },
                district: {
                    include: {
                        state: {
                            include: {
                                country: true
                            }
                        }
                    }
                },
                activities: {
                    where: { isActive: true },
                    take: 5
                },
                accommodations: {
                    where: { isActive: true },
                    orderBy: { price: 'asc' },
                    take: 1
                }
            }
        });

        // Format for public view
        const formatted = destinations.map(dest => ({
            id: dest.id,
            name: dest.name,
            slug: dest.slug,
            description: dest.description,
            coverImage: dest.coverImage,
            images: dest.images,
            rating: dest.rating,
            status: dest.status,
            category: dest.category,
            location: dest.district
                ? `${dest.district.name}, ${dest.district.state.name}`
                : dest.state
                    ? dest.state.name
                    : 'Unknown',
            districtId: dest.district?.id || null,
            districtName: dest.district?.name || null,
            stateId: dest.state?.id || dest.district?.state?.id || null,
            stateName: dest.state?.name || dest.district?.state?.name || null,
            countryName: dest.state?.country?.name || dest.district?.state?.country?.name || null,
            highlights: dest.activities.map(a => a.name),
            startingPrice: dest.accommodations[0]?.price || 0,
            avgCost: dest.avgCost,
            bestSeason: dest.bestSeason,
            activities: dest.activities.map((a) => ({
                id: a.id,
                name: a.name,
                price: a.price ?? 0,
                duration: a.duration ?? null,
                icon: a.icon ?? null
            })),
            foodOptions: dest.foodOptions || [],
            accommodations: dest.accommodations || []
        }));

        res.status(200).json({ success: true, data: formatted });
    } catch (error) {
        console.error(`[GET /public/destinations] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get full destination details including all activities, food, and stays
// Get full destination details by ID including all activities, food, and stays
exports.getDestinationById = async (req, res) => {
    try {
        const { id } = req.params;
        const destination = await prisma.destination.findUnique({
            where: { id, status: 'ACTIVE' },
            include: {
                district: {
                    include: {
                        state: {
                            include: {
                                country: true
                            }
                        }
                    }
                },
                activities: { where: { isActive: true } },
                foodOptions: { where: { isActive: true } },
                accommodations: { where: { isActive: true } },
                travelOptions: true
            }
        });

        if (!destination) {
            return res.status(404).json({ message: 'Destination not found' });
        }

        // Exact Unified Response
        const unified = {
            id: destination.id,
            name: destination.name,
            activities: destination.activities || [],
            foodOptions: destination.foodOptions || [],
            accommodations: destination.accommodations || [],
            travelOptions: destination.travelOptions || []
        };

        res.status(200).json({ success: true, data: unified });
    } catch (error) {
        console.error(`[GET /public/destination/${req.params.id}] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getDestinationDetails = async (req, res) => {

    try {
        const { slug } = req.params;
        const destination = await prisma.destination.findFirst({
            where: { slug, status: 'ACTIVE' },
            include: {
                district: {
                    include: {
                        state: {
                            include: {
                                country: true
                            }
                        }
                    }
                },
                activities: { where: { isActive: true } },
                foodOptions: { where: { isActive: true } },
                accommodations: { where: { isActive: true } },
                travelOptions: true
            }
        });

        if (!destination) {
            return res.status(404).json({ message: 'Destination not found' });
        }

        res.status(200).json({ success: true, data: destination });
    } catch (error) {
        console.error(`[GET /public/destinations/${req.params.slug}] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get all active countries
exports.getCountries = async (req, res) => {
    try {
        const countries = await prisma.country.findMany({
            where: { active: true },
            orderBy: { name: 'asc' }
        });
        res.status(200).json({ success: true, data: countries });
    } catch (error) {
        console.error(`[GET /public/countries] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get active states for a country
exports.getStates = async (req, res) => {
    try {
        const { countryId } = req.params;
        const states = await prisma.state.findMany({
            where: { countryId, active: true },
            orderBy: { name: 'asc' }
        });
        res.status(200).json({ success: true, data: states });
    } catch (error) {
        console.error(`[GET /public/states/${req.params.countryId}] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get active districts for a state
exports.getDistricts = async (req, res) => {
    try {
        const { stateId } = req.params;
        const districts = await prisma.district.findMany({
            where: { stateId, active: true },
            orderBy: { name: 'asc' }
        });
        res.status(200).json({ success: true, data: districts });
    } catch (error) {
        console.error(`[GET /public/districts/${req.params.stateId}] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get active destinations for a district
exports.getDestinationsByDistrict = async (req, res) => {
    try {
        const { districtId } = req.params;
        const destinations = await prisma.destination.findMany({
            where: { districtId, status: 'ACTIVE' },
            include: {
                activities: { where: { isActive: true } },
                accommodations: { where: { isActive: true } },
                foodOptions: { where: { isActive: true } }
            }
        });

        res.status(200).json({ success: true, data: destinations });
    } catch (error) {
        console.error(`[GET /public/destinations/district/${req.params.districtId}] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get active destinations for a state (including district-less destinations)
exports.getDestinationsByState = async (req, res) => {
    try {
        const { stateId } = req.params;
        const destinations = await prisma.destination.findMany({
            where: { stateId, status: 'ACTIVE' },
            include: {
                activities: { where: { isActive: true } },
                accommodations: { where: { isActive: true } },
                foodOptions: { where: { isActive: true } },
                district: true
            },
            orderBy: { name: 'asc' }
        });

        res.status(200).json({ success: true, data: destinations });
    } catch (error) {
        console.error(`[GET /public/destinations/state/${req.params.stateId}] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Granular Detail Endpoints
exports.getDestinationActivities = async (req, res) => {
    try {
        const { id } = req.params;
        const activities = await prisma.activity.findMany({
            where: { destinationId: id, isActive: true }
        });
        res.status(200).json({ success: true, data: activities || [] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getDestinationAccommodation = async (req, res) => {
    try {
        const { id } = req.params;
        const accommodation = await prisma.accommodation.findMany({
            where: { destinationId: id, isActive: true }
        });
        res.status(200).json({ success: true, data: accommodation || [] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getDestinationFood = async (req, res) => {
    try {
        const { id } = req.params;
        const food = await prisma.foodOption.findMany({
            where: { destinationId: id, isActive: true }
        });
        res.status(200).json({ success: true, data: food || [] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getDestinationTravelOptions = async (req, res) => {
    try {
        const { id } = req.params;
        const travelOptions = await prisma.travelOption.findMany({
            where: { destinationId: id }
        });
        res.status(200).json({ success: true, data: travelOptions || [] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getSquadLove = async (req, res) => {
    try {
        const moments = await prisma.squadLove.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' }
        });
        res.status(200).json({ success: true, data: moments });
    } catch (error) {
        console.error(`[GET /public/squad-love] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};
