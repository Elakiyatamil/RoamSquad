const prisma = require('../utils/prisma');

const getAuditLogs = async (req, res) => {
    try {
        const { page = 1, limit = 50, userId, action, entity } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};
        if (userId) where.userId = userId;
        if (action) where.action = action;
        if (entity) where.entity = entity;

        const [logs, total] = await Promise.all([
            prisma.auditLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit),
                include: {
                    user: { select: { id: true, name: true, email: true } }
                }
            }),
            prisma.auditLog.count({ where })
        ]);

        res.json({ data: logs, total, page: parseInt(page), limit: parseInt(limit) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getAuditLogs };
