const prisma = require('../utils/prisma');

const getPackages = async (req, res) => {
    try {
        const packages = await prisma.package.findMany();
        res.json(packages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createPackage = async (req, res) => {
    try {
        const pkg = await prisma.package.create({ data: req.body });
        res.json(pkg);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updatePackage = async (req, res) => {
    try {
        const pkg = await prisma.package.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(pkg);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deletePackage = async (req, res) => {
    try {
        await prisma.package.delete({ where: { id: req.params.id } });
        res.json({ message: 'Package deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getPackages, createPackage, updatePackage, deletePackage };
