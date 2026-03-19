const prisma = require('../utils/prisma');
const { logAction } = require('../utils/auditLog');

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
        await logAction(req.user, 'CREATE', 'Package', pkg.id, pkg.name);
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
        await logAction(req.user, 'UPDATE', 'Package', pkg.id, pkg.name);
        res.json(pkg);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deletePackage = async (req, res) => {
    try {
        const pkg = await prisma.package.findUnique({ where: { id: req.params.id } });
        await prisma.package.delete({ where: { id: req.params.id } });
        await logAction(req.user, 'DELETE', 'Package', req.params.id, pkg?.name);
        res.json({ message: 'Package deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getPackagesPublic = async (req, res) => {
    try {
        const packages = await prisma.package.findMany({ where: { isActive: true } });
        res.json(packages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createPackageInterest = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone } = req.body;
        const email = req.user?.email || req.body.email;
        const interest = await prisma.packageInterest.create({
            data: { packageId: id, email, name: name || req.user?.name, phone }
        });
        res.json(interest);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getPackageInterests = async (req, res) => {
    try {
        const interests = await prisma.packageInterest.findMany({
            orderBy: { createdAt: 'desc' },
            include: { package: { select: { name: true } } }
        });
        res.json(interests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getPackages, createPackage, updatePackage, deletePackage, getPackagesPublic, createPackageInterest, getPackageInterests };
