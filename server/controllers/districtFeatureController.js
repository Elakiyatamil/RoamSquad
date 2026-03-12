const prisma = require('../utils/prisma');

// Must Visit Spots
const getMustVisit = async (req, res) => {
    try {
        const spots = await prisma.mustVisitSpot.findMany({
            where: { districtId: req.params.id }
        });
        res.json(spots);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createMustVisit = async (req, res) => {
    try {
        const spot = await prisma.mustVisitSpot.create({
            data: { ...req.body, districtId: req.params.id }
        });
        res.json(spot);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateMustVisit = async (req, res) => {
    try {
        const spot = await prisma.mustVisitSpot.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(spot);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteMustVisit = async (req, res) => {
    try {
        await prisma.mustVisitSpot.delete({ where: { id: req.params.id } });
        res.json({ message: 'Must Visit Spot deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Upcoming Events
const getEvents = async (req, res) => {
    try {
        const events = await prisma.upcomingEvent.findMany({
            where: { districtId: req.params.id }
        });
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createEvent = async (req, res) => {
    try {
        const event = await prisma.upcomingEvent.create({
            data: { ...req.body, districtId: req.params.id }
        });
        res.json(event);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateEvent = async (req, res) => {
    try {
        const event = await prisma.upcomingEvent.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(event);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteEvent = async (req, res) => {
    try {
        await prisma.upcomingEvent.delete({ where: { id: req.params.id } });
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getMustVisit, createMustVisit, updateMustVisit, deleteMustVisit,
    getEvents, createEvent, updateEvent, deleteEvent
};
