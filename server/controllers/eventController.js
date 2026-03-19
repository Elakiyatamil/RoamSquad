const prisma = require('../utils/prisma');
const { logAction } = require('../utils/auditLog');

const getEvents = async (req, res) => {
    try {
        const events = await prisma.upcomingEvent.findMany({
            orderBy: { dateTime: 'asc' }
        });
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getEventsPublic = async (req, res) => {
    try {
        const events = await prisma.upcomingEvent.findMany({
            orderBy: { dateTime: 'asc' }
        });
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createEvent = async (req, res) => {
    try {
        const { title, description, location, dateTime, contactNumber, districtId } = req.body;
        
        // Handle file upload: check if multer put a file in req.file
        let imageUrl = req.body.image || null;
        if (req.file) {
            const cloudinary = require('../utils/cloudinary');
            const { Readable } = require('stream');
            imageUrl = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: 'roam_squad/events' },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result.secure_url);
                    }
                );
                Readable.from(req.file.buffer).pipe(stream);
            });
        }

        const event = await prisma.upcomingEvent.create({
            data: { 
                title, 
                description, 
                location, 
                dateTime: dateTime ? new Date(dateTime) : null, 
                image: imageUrl,
                contactNumber: contactNumber || null,
                districtId: districtId || null
            }
        });
        await logAction(req.user, 'CREATE', 'Event', event.id, event.title);
        res.json(event);
    } catch (error) {
        console.error('createEvent error:', error);
        res.status(500).json({ error: error.message });
    }
};

const updateEvent = async (req, res) => {
    try {
        const { dateTime, ...rest } = req.body;
        
        // Handle file upload
        let imageUrl = req.body.image;
        if (req.file) {
            const cloudinary = require('../utils/cloudinary');
            const { Readable } = require('stream');
            imageUrl = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: 'roam_squad/events' },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result.secure_url);
                    }
                );
                Readable.from(req.file.buffer).pipe(stream);
            });
        }

        const event = await prisma.upcomingEvent.update({
            where: { id: req.params.id },
            data: { 
                ...rest, 
                ...(dateTime ? { dateTime: new Date(dateTime) } : {}),
                ...(imageUrl ? { image: imageUrl } : {})
            }
        });
        await logAction(req.user, 'UPDATE', 'Event', event.id, event.title);
        res.json(event);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteEvent = async (req, res) => {
    try {
        const event = await prisma.upcomingEvent.findUnique({ where: { id: req.params.id } });
        await prisma.upcomingEvent.delete({ where: { id: req.params.id } });
        await logAction(req.user, 'DELETE', 'Event', req.params.id, event?.title);
        res.json({ message: 'Event deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const joinEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone } = req.body;
        const email = req.user?.email || req.body.email;
        const interest = await prisma.eventInterest.create({
            data: { eventId: id, email, name: name || req.user?.name, phone }
        });
        res.json(interest);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getEventInterests = async (req, res) => {
    try {
        const interests = await prisma.eventInterest.findMany({
            orderBy: { createdAt: 'desc' },
            include: { event: { select: { title: true, dateTime: true } } }
        });
        res.json(interests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getEvents, getEventsPublic, createEvent, updateEvent, deleteEvent, joinEvent, getEventInterests };
