const prisma = require('../utils/prisma');
const { logAction } = require('../utils/auditLog');
const crypto = require('crypto');
const Razorpay = require('razorpay');

// Utility to generate a unique booking ID
const generateBookingId = () => {
    return 'RS-EVT-' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

const getEvents = async (req, res) => {
    try {
        const events = await prisma.event.findMany({
            orderBy: { date: 'asc' },
            include: {
                _count: {
                    select: { registrations: true }
                }
            }
        });
        res.status(200).json({ success: true, data: events });
    } catch (error) {
        console.error(`[GET /events] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const getEventsPublic = async (req, res) => {
    try {
        const events = await prisma.event.findMany({
            where: { status: 'PUBLISHED' },
            orderBy: { date: 'asc' },
            include: {
                reviews: {
                    select: { rating: true }
                }
            }
        });

        // Calculate average rating for each event
        const eventsWithRating = events.map(event => {
            const avgRating = event.reviews.length > 0 
                ? event.reviews.reduce((acc, rev) => acc + rev.rating, 0) / event.reviews.length 
                : 0;
            return {
                ...event,
                rating: parseFloat(avgRating.toFixed(1))
            };
        });

        res.status(200).json({ success: true, data: eventsWithRating });
    } catch (error) {
        console.error(`[GET /events/public] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const getEventById = async (req, res) => {
    try {
        const event = await prisma.event.findUnique({
            where: { id: req.params.id },
            include: {
                reviews: {
                    include: {
                        user: { select: { name: true, avatarUrl: true } }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });
        if (!event) {
            return res.status(404).json({ success: false, error: 'Event not found' });
        }
        res.status(200).json({ success: true, data: event });
    } catch (error) {
        console.error(`[GET /events/${req.params.id}] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const createEvent = async (req, res) => {
    try {
        const { 
            title, tagline, description, venue, address, googleMap, 
            date, startTime, endTime, hostName, contactNumber, 
            emergencyContact, maxAttendees, price, highlights, 
            thingsToBring, status
        } = req.body;
        
        const coverImage = req.body.coverImage || req.body.image || ''; // Fallback for image field
        const galleryImages = req.body.galleryImages || [];

        const eventData = { 
            title, tagline, description, venue, address, googleMap,
            date: new Date(date), startTime, endTime, hostName, contactNumber,
            emergencyContact, maxAttendees: parseInt(maxAttendees, 10), 
            seatsRemaining: parseInt(maxAttendees, 10), price: parseFloat(price),
            highlights, thingsToBring, galleryImages, coverImage, status: status || 'DRAFT'
        };

        const event = await prisma.event.create({
            data: eventData
        });
        
        if (req.user) {
            await logAction(req.user, 'CREATE', 'Event', event.id, event.title);
        }
        
        res.status(201).json({ success: true, data: event });
    } catch (error) {
        console.error('[POST /events] Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const updateEvent = async (req, res) => {
    try {
        const { date, maxAttendees, price, ...rest } = req.body;
        const updateData = { ...rest };
        
        if (date) updateData.date = new Date(date);
        if (maxAttendees !== undefined) {
            updateData.maxAttendees = parseInt(maxAttendees, 10);
            // We should ideally adjust seatsRemaining, but for simplicity we skip complex logic here unless required.
        }
        if (price !== undefined) updateData.price = parseFloat(price);
        
        const event = await prisma.event.update({
            where: { id: req.params.id },
            data: updateData
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
        const event = await prisma.event.findUnique({ where: { id: req.params.id } });
        await prisma.event.delete({ where: { id: req.params.id } });
        await logAction(req.user, 'DELETE', 'Event', req.params.id, event?.title);
        res.status(200).json({ success: true, data: { message: 'Event deleted' } });
    } catch (error) {
        console.error(`[DELETE /events/${req.params.id}] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// --- Registrations ---

const createRegistrationOrder = async (req, res) => {
    try {
        const { id: eventId } = req.params;
        const { persons, phone } = req.body;
        const userId = req.user.id;

        const event = await prisma.event.findUnique({ where: { id: eventId } });
        if (!event) return res.status(404).json({ success: false, error: 'Event not found' });
        if (event.seatsRemaining < persons) return res.status(400).json({ success: false, error: 'Not enough seats available' });

        const amount = event.price * persons;
        const bookingId = generateBookingId();

        // Create Razorpay Order
        const rzp = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || 'YOUR_RAZORPAY_KEY_ID',
            key_secret: process.env.RAZORPAY_KEY_SECRET || 'YOUR_RAZORPAY_KEY_SECRET',
        });

        const order = await rzp.orders.create({
            amount: amount * 100,
            currency: "INR",
            receipt: bookingId
        });

        const razorpayOrderId = order.id;

        // Create a PENDING registration
        const registration = await prisma.eventRegistration.create({
            data: {
                userId,
                eventId,
                phone,
                bookingId,
                persons: parseInt(persons, 10),
                amount,
                paymentStatus: 'PENDING',
                paymentId: razorpayOrderId // Saving order ID here temporarily
            }
        });

        res.status(200).json({ 
            success: true, 
            data: { 
                registrationId: registration.id,
                bookingId: registration.bookingId,
                razorpayOrderId: razorpayOrderId,
                amount: amount * 100 // Razorpay expects paise
            } 
        });
    } catch (error) {
        console.error(`[POST /events/${req.params.id}/register] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const verifyRegistrationPayment = async (req, res) => {
    try {
        const { registrationId, razorpayPaymentId, razorpaySignature } = req.body;

        // Signature Verification
        const secret = process.env.RAZORPAY_KEY_SECRET || 'YOUR_RAZORPAY_KEY_SECRET';
        const expectedSignature = crypto.createHmac('sha256', secret)
            .update(req.body.razorpayOrderId + "|" + razorpayPaymentId)
            .digest('hex');

        if (expectedSignature !== razorpaySignature) {
            return res.status(400).json({ success: false, error: 'Invalid payment signature' });
        }

        const registration = await prisma.eventRegistration.findUnique({ 
            where: { id: registrationId },
            include: { event: true }
        });

        if (!registration) return res.status(404).json({ success: false, error: 'Registration not found' });

        // Update registration to SUCCESS
        const updatedRegistration = await prisma.eventRegistration.update({
            where: { id: registrationId },
            data: {
                paymentStatus: 'SUCCESS',
                paymentId: razorpayPaymentId,
                receiptUrl: `/receipts/${registration.bookingId}.pdf` // Mock receipt URL
            }
        });

        // Decrement seats
        await prisma.event.update({
            where: { id: registration.eventId },
            data: { seatsRemaining: { decrement: registration.persons } }
        });

        res.status(200).json({ success: true, data: updatedRegistration });
    } catch (error) {
        console.error(`[POST /events/verify-payment] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const getRegistrations = async (req, res) => {
    try {
        const registrations = await prisma.eventRegistration.findMany({
            orderBy: { createdAt: 'desc' },
            include: { 
                event: { select: { title: true, date: true, venue: true, coverImage: true } },
                user: { select: { name: true, email: true } }
            }
        });
        res.status(200).json({ success: true, data: registrations });
    } catch (error) {
        console.error(`[GET /events/registrations] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const getMyRegistrations = async (req, res) => {
    try {
        const registrations = await prisma.eventRegistration.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' },
            include: { 
                event: { select: { title: true, date: true, venue: true, coverImage: true, googleMap: true } }
            }
        });
        res.status(200).json({ success: true, data: registrations });
    } catch (error) {
        console.error(`[GET /events/my-registrations] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const createAdminReview = async (req, res) => {
    try {
        const { id: eventId } = req.params;
        const { reviewerName, review, rating } = req.body;

        if (!reviewerName || !review || !rating) {
            return res.status(400).json({ success: false, error: 'Reviewer name, review text, and rating are required' });
        }

        const newReview = await prisma.review.create({
            data: {
                eventId,
                reviewerName,
                review,
                rating: parseInt(rating, 10),
                userId: null // Optional user
            }
        });

        await logAction(req.user, 'CREATE', 'Review', newReview.id, `Admin review for event ${eventId}`);
        res.status(201).json({ success: true, data: newReview });
    } catch (error) {
        console.error(`[POST /events/${req.params.id}/reviews] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        
        await prisma.review.delete({
            where: { id: reviewId }
        });

        await logAction(req.user, 'DELETE', 'Review', reviewId, 'Admin deleted review');
        res.status(200).json({ success: true, data: { message: 'Review deleted successfully' } });
    } catch (error) {
        console.error(`[DELETE /events/reviews/${req.params.reviewId}] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = { 
    getEvents, 
    getEventsPublic, 
    getEventById,
    createEvent, 
    updateEvent, 
    deleteEvent, 
    createRegistrationOrder,
    verifyRegistrationPayment,
    getRegistrations,
    getMyRegistrations,
    createAdminReview,
    deleteReview
};
