const prisma = require('../utils/prisma');
const { logAction } = require('../utils/auditLog');

// Must Visit Spots
const getMustVisit = async (req, res) => {
    try {
        const spots = await prisma.mustVisitSpot.findMany({
            where: { districtId: req.params.id }
        });
        res.status(200).json({ success: true, data: spots });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createMustVisit = async (req, res) => {
    try {
        const spot = await prisma.mustVisitSpot.create({
            data: { ...req.body, districtId: req.params.id }
        });
        await logAction(req.user, 'CREATE', 'MustVisitSpot', spot.id, spot.name);
        res.status(201).json({ success: true, data: spot });
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
        await logAction(req.user, 'UPDATE', 'MustVisitSpot', spot.id, spot.name);
        res.status(200).json({ success: true, data: spot });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteMustVisit = async (req, res) => {
    try {
        const spot = await prisma.mustVisitSpot.findUnique({ where: { id: req.params.id } });
        await prisma.mustVisitSpot.delete({ where: { id: req.params.id } });
        await logAction(req.user, 'DELETE', 'MustVisitSpot', req.params.id, spot?.name);
        res.status(200).json({ success: true, message: 'Must Visit Spot deleted successfully' });
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
        res.status(200).json({ success: true, data: events });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createEvent = async (req, res) => {
    try {
        const event = await prisma.upcomingEvent.create({
            data: { ...req.body, districtId: req.params.id }
        });
        await logAction(req.user, 'CREATE', 'UpcomingEvent', event.id, event.name);
        res.status(201).json({ success: true, data: event });
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
        await logAction(req.user, 'UPDATE', 'UpcomingEvent', event.id, event.name);
        res.status(200).json({ success: true, data: event });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteEvent = async (req, res) => {
    try {
        const event = await prisma.upcomingEvent.findUnique({ where: { id: req.params.id } });
        await prisma.upcomingEvent.delete({ where: { id: req.params.id } });
        await logAction(req.user, 'DELETE', 'UpcomingEvent', req.params.id, event?.name);
        res.status(200).json({ success: true, message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getMustVisit, createMustVisit, updateMustVisit, deleteMustVisit,
    getEvents, createEvent, updateEvent, deleteEvent
};
