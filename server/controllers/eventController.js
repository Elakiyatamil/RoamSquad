const prisma = require('../utils/prisma');
const { logAction } = require('../utils/auditLog');

const getEvents = async (req, res) => {
    try {
        const events = await prisma.upcomingEvent.findMany({
            orderBy: { dateTime: 'asc' }
        });
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
        res.status(200).json({ success: true, data: events });
    } catch (error) {
        console.error(`[GET /events/public] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const createEvent = async (req, res) => {
    try {
        console.log('[POST /events] Body:', req.body);
        console.log('[POST /events] File:', req.file ? 'Present' : 'Missing');

        const { title, description, location, dateTime, contactNumber, districtId } = req.body;
        
        if (!title) {
            return res.status(400).json({ success: false, error: 'Title is required' });
        }

        // Handle image from body (URL string from standardized upload)
        let imageUrl = req.body.image || null;


        let parsedDate = null;
        if (dateTime) {
            const d = new Date(dateTime);
            if (!isNaN(d.getTime())) {
                parsedDate = d;
            } else {
                return res.status(400).json({ success: false, error: 'Invalid date format' });
            }
        }

        const eventData = { 
            title, 
            description: description || null, 
            location: location || null, 
            dateTime: parsedDate, 
            image: imageUrl,
            contactNumber: contactNumber || null,
            districtId: districtId || null
        };

        const event = await prisma.upcomingEvent.create({
            data: eventData
        });
        
        if (req.user) {
            await logAction(req.user, 'CREATE', 'Event', event.id, event.title);
        }
        
        res.status(201).json({ success: true, data: event });
    } catch (error) {
        console.error('[POST /events] Fatal Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const updateEvent = async (req, res) => {
    try {
        const { dateTime, ...rest } = req.body;
        
        // Image URL from standardized upload
        let imageUrl = req.body.image;


        const event = await prisma.upcomingEvent.update({
            where: { id: req.params.id },
            data: { 
                ...rest, 
                ...(dateTime ? { dateTime: new Date(dateTime) } : {}),
                ...(imageUrl ? { image: imageUrl } : {})
            }
        });
        await logAction(req.user, 'UPDATE', 'Event', event.id, event.title);
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
        res.status(200).json({ success: true, data: { message: 'Event deleted' } });
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
        res.status(200).json({ success: true, data: interests });
    } catch (error) {
        console.error(`[GET /events/interests] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = { getEvents, getEventsPublic, createEvent, updateEvent, deleteEvent, joinEvent, getEventInterests };
