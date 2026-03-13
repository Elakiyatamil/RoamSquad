const prisma = require('./prisma');

/**
 * Records an admin action in the AuditLog table.
 * @param {object} user - The authenticated user from req.user
 * @param {'CREATE'|'UPDATE'|'DELETE'} action 
 * @param {string} entity - e.g. 'Destination', 'Activity'
 * @param {string|null} entityId 
 * @param {string|null} entityName - Human-readable name of the item
 * @param {string|null} details - Extra context
 */
const logAction = async (user, action, entity, entityId = null, entityName = null, details = null) => {
    try {
        await prisma.auditLog.create({
            data: {
                userId: user.id,
                userName: user.name || user.email,
                action,
                entity,
                entityId: entityId ? String(entityId) : null,
                entityName,
                details
            }
        });
    } catch (err) {
        // Non-blocking — don't fail the main request if logging fails
        console.error('[AuditLog] Failed to write log:', err.message);
    }
};

module.exports = { logAction };
