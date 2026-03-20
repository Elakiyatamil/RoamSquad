const prisma = require('../utils/prisma');
const { logAction } = require('../utils/auditLog');

const getEvents = async (req, res) => {
    try {
        const events = await prisma.upcomingEvent.findMany({
            orderBy: { dateTime: 'asc' }
        });
        console.log(`[GET /events] Feteched ${events.length} events`);
        res.status(200).json({ success: true, data: events });
    } catch (error) {
        console.error(`[GET /events] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const getEventsPublic = async (req, res) => {
    try {
        const events = await prisma.upcomingEvent.findMany({
            orderBy: { dateTime: 'asc' }
        });
        console.log(`[GET /events/public] Feteched ${events.length} events`);
        res.status(200).json({ success: true, data: events });
    } catch (error) {
        console.error(`[GET /events/public] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
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
        console.log(`[POST /events] Created event: ${event.id}`);
        res.status(201).json({ success: true, data: event });
    } catch (error) {
        console.error('[POST /events] Error:', error);
        res.status(500).json({ success: false, error: error.message });
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
        console.log(`[PATCH /events/${req.params.id}] Updated event`);
        res.status(200).json({ success: true, data: event });
    } catch (error) {
        console.error(`[PATCH /events/${req.params.id}] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const deleteEvent = async (req, res) => {
    try {
        const event = await prisma.upcomingEvent.findUnique({ where: { id: req.params.id } });
        await prisma.upcomingEvent.delete({ where: { id: req.params.id } });
        await logAction(req.user, 'DELETE', 'Event', req.params.id, event?.title);
        console.log(`[DELETE /events/${req.params.id}] Deleted event`);
        res.status(200).json({ success: true, message: 'Event deleted' });
    } catch (error) {
        console.error(`[DELETE /events/${req.params.id}] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const joinEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, email: bodyEmail } = req.body;
        const email = req.user?.email || bodyEmail;
        
        console.log("New Lead (Event):", req.body);

        if (!email || !name || !phone) {
            return res.status(400).json({ success: false, error: 'Name, Email, and Phone are required' });
        }

        const interest = await prisma.eventInterest.create({
            data: { 
                eventId: id, 
                email, 
                name, 
                phone 
            }
        });
        
        console.log(`[POST /events/${id}/join] Created registration: ${interest.id}`);
        res.status(201).json({ success: true, data: interest });
    } catch (error) {
        console.error(`[POST /events/${id}/join] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const getEventInterests = async (req, res) => {
    try {
        const interests = await prisma.eventInterest.findMany({
            orderBy: { createdAt: 'desc' },
            include: { event: { select: { title: true, dateTime: true } } }
        });
        console.log(`[GET /events/interests] Fetched ${interests.length} registrations`);
        res.status(200).json({ success: true, data: interests });
    } catch (error) {
        console.error(`[GET /events/interests] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = { getEvents, getEventsPublic, createEvent, updateEvent, deleteEvent, joinEvent, getEventInterests };
