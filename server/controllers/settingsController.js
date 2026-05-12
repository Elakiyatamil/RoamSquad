const prisma = require('../utils/prisma');

const getSettings = async (req, res) => {
    try {
        const settings = await prisma.globalSettings.findMany();
        res.status(200).json({ success: true, data: settings });
    } catch (error) {
        console.error(`[GET /settings] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const getSettingByKey = async (req, res) => {
    try {
        const { key } = req.params;
        const setting = await prisma.globalSettings.findUnique({ where: { key } });
        res.status(200).json({ success: true, data: setting });
    } catch (error) {
        console.error(`[GET /settings/${req.params.key}] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const updateSetting = async (req, res) => {
    try {
        const { key } = req.params;
        const { value } = req.body;
        
        const setting = await prisma.globalSettings.upsert({
            where: { key },
            update: { value },
            create: { key, value }
        });
        
        res.status(200).json({ success: true, data: setting });
    } catch (error) {
        console.error(`[PATCH /settings/${req.params.key}] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = { getSettings, getSettingByKey, updateSetting };
