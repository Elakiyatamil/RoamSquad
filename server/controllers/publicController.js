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
        res.json(tree);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all active destinations with highlights and prices
exports.getDestinations = async (req, res) => {
    try {
        const destinations = await prisma.destination.findMany({
            where: { status: 'ACTIVE' },
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
            location: `${dest.district.name}, ${dest.district.state.name}`,
            districtId: dest.district.id,
            districtName: dest.district.name,
            stateId: dest.district.state.id,
            stateName: dest.district.state.name,
            countryName: dest.district.state.country?.name,
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

        // #region agent log
        try {
            const fs = require('fs');
            fs.appendFileSync(
                'c:\\Users\\sange\\MyProjecct\\roamrevier\\debug-b1a21f.log',
                `${JSON.stringify({
                    sessionId: 'b1a21f',
                    runId: 'pre-fix',
                    hypothesisId: 'H7',
                    location: 'server/controllers/publicController.js:getDestinations',
                    message: 'public destinations formatted',
                    data: {
                        count: formatted.length,
                        sample: formatted[0] ? { id: formatted[0].id, activitiesCount: formatted[0].activities?.length ?? null } : null
                    },
                    timestamp: Date.now()
                })}\n`,
                'utf8'
            );
        } catch (_) {}
        // #endregion agent log

        res.json(formatted);
    } catch (error) {
        res.status(500).json({ error: error.message });
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

        res.json(unified);

    } catch (error) {
        res.status(500).json({ error: error.message });
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

        res.json(destination);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all active countries
exports.getCountries = async (req, res) => {
    try {
        const countries = await prisma.country.findMany({
            where: { active: true },
            orderBy: { name: 'asc' }
        });
        res.json(countries);
    } catch (error) {
        res.status(500).json({ error: error.message });
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
        res.json(states);
    } catch (error) {
        res.status(500).json({ error: error.message });
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
        res.json(districts);
    } catch (error) {
        res.status(500).json({ error: error.message });
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

        res.json(destinations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Granular Detail Endpoints
exports.getDestinationActivities = async (req, res) => {
    try {
        const { id } = req.params;
        const activities = await prisma.activity.findMany({
            where: { destinationId: id, isActive: true }
        });
        res.json(activities);
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
        res.json(accommodation);
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
        res.json(food);
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
        res.json(travelOptions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
