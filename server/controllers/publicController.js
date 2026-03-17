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
            where: { active: true },
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
                accommodation: {
                    where: { isActive: true },
                    orderBy: { pricePerNight: 'asc' },
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
            category: dest.category,
            location: `${dest.district.name}, ${dest.district.state.name}`,
            districtId: dest.district.id,
            districtName: dest.district.name,
            stateId: dest.district.state.id,
            stateName: dest.district.state.name,
            countryName: dest.district.state.country?.name,
            highlights: dest.activities.map(a => a.name),
            startingPrice: dest.accommodation[0]?.pricePerNight || 0,
            avgCost: dest.avgCost,
            bestSeason: dest.bestSeason,
            activities: dest.activities.map((a) => ({
                id: a.id,
                name: a.name,
                price: a.price ?? 0,
                duration: a.duration ?? null,
                icon: a.icon ?? null
            }))
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
exports.getDestinationDetails = async (req, res) => {
    try {
        const { slug } = req.params;
        const destination = await prisma.destination.findUnique({
            where: { slug },
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
                accommodation: { where: { isActive: true } },
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
