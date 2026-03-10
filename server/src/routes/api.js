const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Hierarchy Endpoints

// Countries
router.get('/countries', async (req, res) => {
    const countries = await prisma.country.findMany({ include: { states: true } });
    res.json(countries);
});

router.post('/countries', async (req, res) => {
    const { name } = req.body;
    const country = await prisma.country.create({ data: { name } });
    res.json(country);
});

// States
router.get('/states/:countryId', async (req, res) => {
    const states = await prisma.state.findMany({
        where: { countryId: req.params.countryId },
        include: { districts: true }
    });
    res.json(states);
});

// Destinations
router.get('/destinations/:districtId', async (req, res) => {
    const destinations = await prisma.destination.findMany({
        where: { districtId: req.params.districtId },
        include: {
            activities: true,
            foodOptions: true,
            accommodations: true,
            travelOptions: true,
            mustVisitSpots: true,
            specialPackages: true,
            seasonalOffers: true
        }
    });
    res.json(destinations);
});

// Itinerary Requests (Kanban)
router.get('/itinerary-requests', async (req, res) => {
    const requests = await prisma.itineraryRequest.findMany({
        orderBy: { createdAt: 'desc' }
    });
    res.json(requests);
});

router.patch('/itinerary-requests/:id', async (req, res) => {
    const { status } = req.body;
    const request = await prisma.itineraryRequest.update({
        where: { id: req.params.id },
        data: { status }
    });
    // Emit socket update (will implement properly later)
    res.json(request);
});

module.exports = router;
