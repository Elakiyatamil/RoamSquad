const prisma = require('../utils/prisma');
const { getIO } = require('../sockets');

const getRequests = async (req, res) => {
    try {
        const { status } = req.query;
        const where = status ? { status } : {};
        const requests = await prisma.itineraryRequest.findMany({ where, orderBy: { createdAt: 'desc' } });
        res.status(200).json({ success: true, data: requests });
    } catch (error) {
        console.error(`[GET /requests] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const updateRequest = async (req, res) => {
    try {
        const request = await prisma.itineraryRequest.update({
            where: { id: req.params.id },
            data: req.body
        });

        // Emit socket update
        const io = getIO();
        io.emit('request:updated', request);

        res.status(200).json({ success: true, data: request });
    } catch (error) {
        console.error(`[PATCH /requests/${req.params.id}] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const createRequest = async (req, res) => {
    try {
        const request = await prisma.itineraryRequest.create({
            data: {
                ...req.body,
                status: 'New Inquiry'
            }
        });

        // Emit socket update to admins
        const io = getIO();
        io.emit('request:created', request);

        res.status(201).json({ success: true, data: request });
    } catch (error) {
        console.error(`[POST /requests] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const deleteRequest = async (req, res) => {
    try {
        await prisma.itineraryRequest.delete({
            where: { id: req.params.id }
        });

        // Emit socket update
        const io = getIO();
        io.emit('request:deleted', { id: req.params.id });

        res.status(200).json({ success: true, data: { message: 'Request deleted successfully' } });
    } catch (error) {
        console.error(`[DELETE /requests/${req.params.id}] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = { getRequests, updateRequest, deleteRequest, createRequest };
