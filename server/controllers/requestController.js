const prisma = require('../utils/prisma');
const { getIO } = require('../sockets');

const getRequests = async (req, res) => {
    try {
        const { status } = req.query;
        const where = status ? { status } : {};
        const requests = await prisma.itineraryRequest.findMany({ where, orderBy: { createdAt: 'desc' } });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: error.message });
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

        res.json(request);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteRequest = async (req, res) => {
    try {
        await prisma.itineraryRequest.delete({ where: { id: req.params.id } });
        res.json({ message: 'Request deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getRequests, updateRequest, deleteRequest };
