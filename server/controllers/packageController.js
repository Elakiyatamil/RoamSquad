const prisma = require('../utils/prisma');
const { logAction } = require('../utils/auditLog');

const packageInclude = {
    participantGroups: true,
    itineraryDays: {
        orderBy: { dayNumber: 'asc' },
        include: {
            activities: true
        }
    }
};

const getPackages = async (req, res) => {
    try {
        const packages = await prisma.package.findMany({
            include: packageInclude
        });
        res.status(200).json({ success: true, data: packages });
    } catch (error) {
        console.error(`[GET /packages] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const createPackage = async (req, res) => {
    try {
        const data = { ...req.body };
        const { itineraryDays, participantGroups, ...packageData } = data;
        
        delete packageData.id;
        delete packageData.interests;
        delete packageData.createdAt;
        
        if (req.file) {
            const cloudinary = require('../utils/cloudinary');
            const { Readable } = require('stream');
            const imageUrl = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: 'roam_squad/packages' },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result.secure_url);
                    }
                );
                Readable.from(req.file.buffer).pipe(stream);
            });
            packageData.coverImage = imageUrl;
        }

        // Convert highlights if string
        if (typeof packageData.highlights === 'string') {
            packageData.highlights = packageData.highlights.split(',').map(h => h.trim()).filter(Boolean);
        }

        const pkg = await prisma.package.create({
            data: {
                ...packageData,
                participantGroups: participantGroups ? {
                    create: participantGroups.map(g => ({
                        name: g.name,
                        count: parseInt(g.count) || 0
                    }))
                } : undefined,
                itineraryDays: itineraryDays ? {
                    create: itineraryDays.map(day => ({
                        dayNumber: parseInt(day.dayNumber),
                        locationName: day.locationName,
                        dayTheme: day.dayTheme,
                        transportType: day.transportType,
                        transportNote: day.transportNote,
                        accommodationId: day.accommodationId,
                        activities: {
                            create: (day.activities || []).map(act => ({
                                activityTime: act.activityTime,
                                activityType: act.activityType,
                                description: act.description,
                                isHighlight: !!act.isHighlight
                            }))
                        }
                    }))
                } : undefined
            },
            include: packageInclude
        });

        await logAction(req.user, 'CREATE', 'Package', pkg.id, pkg.name);
        res.status(201).json({ success: true, data: pkg });
    } catch (error) {
        console.error(`[POST /packages] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const updatePackage = async (req, res) => {
    try {
        const data = { ...req.body };
        const { itineraryDays, participantGroups, ...packageData } = data;

        delete packageData.id;
        delete packageData.interests;
        delete packageData.createdAt;
        
        if (req.file) {
            const cloudinary = require('../utils/cloudinary');
            const { Readable } = require('stream');
            const imageUrl = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: 'roam_squad/packages' },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result.secure_url);
                    }
                );
                Readable.from(req.file.buffer).pipe(stream);
            });
            packageData.coverImage = imageUrl;
        }

        // Convert highlights if string
        if (typeof packageData.highlights === 'string') {
            packageData.highlights = packageData.highlights.split(',').map(h => h.trim()).filter(Boolean);
        }

        const pkg = await prisma.package.update({
            where: { id: req.params.id },
            data: {
                ...packageData,
                participantGroups: participantGroups ? {
                    deleteMany: {},
                    create: participantGroups.map(g => ({
                        name: g.name,
                        count: parseInt(g.count) || 0
                    }))
                } : undefined,
                itineraryDays: itineraryDays ? {
                    deleteMany: {},
                    create: itineraryDays.map(day => ({
                        dayNumber: parseInt(day.dayNumber),
                        locationName: day.locationName,
                        dayTheme: day.dayTheme,
                        transportType: day.transportType,
                        transportNote: day.transportNote,
                        accommodationId: day.accommodationId,
                        activities: {
                            create: (day.activities || []).map(act => ({
                                activityTime: act.activityTime,
                                activityType: act.activityType,
                                description: act.description,
                                isHighlight: !!act.isHighlight
                            }))
                        }
                    }))
                } : undefined
            },
            include: packageInclude
        });

        await logAction(req.user, 'UPDATE', 'Package', pkg.id, pkg.name);
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
        res.status(200).json({ success: true, data: { message: 'Package deleted successfully' } });
    } catch (error) {
        console.error(`[DELETE /packages/${req.params.id}] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const getPackagesPublic = async (req, res) => {
    try {
        const packages = await prisma.package.findMany({ 
            where: { isActive: true },
            include: packageInclude
        });
        res.status(200).json({ success: true, data: packages });
    } catch (error) {
        console.error(`[GET /packages/public] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const createPackageInterest = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, email: bodyEmail } = req.body;
        const email = req.user?.email || bodyEmail;


        if (!email || !name || !phone) {
            return res.status(400).json({ success: false, error: 'Name, Email, and Phone are required' });
        }

        const interest = await prisma.packageInterest.create({
            data: { 
                packageId: id, 
                email, 
                name, 
                phone 
            }
        });
        
        res.status(201).json({ success: true, data: interest });
    } catch (error) {
        console.error(`[POST /packages/${id}/interest] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const getPackageInterests = async (req, res) => {
    try {
        const interests = await prisma.packageInterest.findMany({
            orderBy: { createdAt: 'desc' },
            include: { package: { select: { name: true } } }
        });
        res.status(200).json({ success: true, data: interests });
    } catch (error) {
        console.error(`[GET /packages/interests] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const getPackageByIdPublic = async (req, res) => {
    try {
        const pkg = await prisma.package.findUnique({
            where: { id: req.params.id, isActive: true },
            include: packageInclude
        });
        if (!pkg) return res.status(404).json({ success: false, error: 'Package not found' });
        res.status(200).json({ success: true, data: pkg });
    } catch (error) {
        console.error(`[GET /packages/public/${req.params.id}] Error:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = { getPackages, createPackage, updatePackage, deletePackage, getPackagesPublic, getPackageByIdPublic, createPackageInterest, getPackageInterests };
