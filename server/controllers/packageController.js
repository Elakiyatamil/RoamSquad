const prisma = require('../utils/prisma');
const { logAction } = require('../utils/auditLog');

const getPackages = async (req, res) => {
    try {
        const packages = await prisma.package.findMany();
        console.log(`[GET /packages] Fetched ${packages.length} packages`);
        res.status(200).json({ success: true, data: packages });
    } catch (error) {
        console.error(`[GET /packages] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const createPackage = async (req, res) => {
    try {
        const pkg = await prisma.package.create({ data: req.body });
        await logAction(req.user, 'CREATE', 'Package', pkg.id, pkg.name);
        console.log(`[POST /packages] Created package: ${pkg.id}`);
        res.status(201).json({ success: true, data: pkg });
    } catch (error) {
        console.error(`[POST /packages] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const updatePackage = async (req, res) => {
    try {
        const pkg = await prisma.package.update({
            where: { id: req.params.id },
            data: req.body
        });
        await logAction(req.user, 'UPDATE', 'Package', pkg.id, pkg.name);
        console.log(`[PATCH /packages/${req.params.id}] Updated package`);
        res.status(200).json({ success: true, data: pkg });
    } catch (error) {
        console.error(`[PATCH /packages/${req.params.id}] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const deletePackage = async (req, res) => {
    try {
        const pkg = await prisma.package.findUnique({ where: { id: req.params.id } });
        await prisma.package.delete({ where: { id: req.params.id } });
        await logAction(req.user, 'DELETE', 'Package', req.params.id, pkg?.name);
        console.log(`[DELETE /packages/${req.params.id}] Deleted package`);
        res.status(200).json({ success: true, message: 'Package deleted successfully' });
    } catch (error) {
        console.error(`[DELETE /packages/${req.params.id}] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const getPackagesPublic = async (req, res) => {
    try {
        const packages = await prisma.package.findMany({ where: { isActive: true } });
        console.log(`[GET /packages/public] Fetched ${packages.length} active packages`);
        res.status(200).json({ success: true, data: packages });
    } catch (error) {
        console.error(`[GET /packages/public] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
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
        console.log(`[GET /packages/interests] Fetched ${interests.length} registrations`);
        res.status(200).json({ success: true, data: interests });
    } catch (error) {
        console.error(`[GET /packages/interests] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = { getPackages, createPackage, updatePackage, deletePackage, getPackagesPublic, createPackageInterest, getPackageInterests };
