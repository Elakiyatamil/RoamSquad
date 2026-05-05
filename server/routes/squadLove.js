const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { verifyJWT, isAdmin } = require('../middleware/auth');

// Get all Squad Love content
router.get('/', async (req, res) => {
    try {
        const content = await prisma.squadLove.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' }
        });
        res.json({ success: true, data: content });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Admin: Create/Update Squad Love content
router.post('/', verifyJWT, isAdmin, async (req, res) => {
    try {
        const { type, url, caption, name, location, sortOrder } = req.body;
        const newItem = await prisma.squadLove.create({
            data: { 
                type, 
                url, 
                caption, 
                name,
                location,
                sortOrder: sortOrder || 0 
            }
        });
        res.json({ success: true, data: newItem });
    } catch (error) {

        res.status(500).json({ success: false, error: error.message });
    }
});

router.delete('/:id', verifyJWT, isAdmin, async (req, res) => {
    try {
        await prisma.squadLove.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
