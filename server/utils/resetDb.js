const prisma = require('./prisma');
const bcrypt = require('bcrypt');

async function reset() {
    console.log('--- RESETTING DATABASE ---');
    try {
        // Truncate all tables in order
        await prisma.auditLog.deleteMany();
        await prisma.itineraryRequest.deleteMany();
        await prisma.tripPlan.deleteMany();
        await prisma.wishlistItem.deleteMany();
        await prisma.package.deleteMany();
        await prisma.mustVisitSpot.deleteMany();
        await prisma.upcomingEvent.deleteMany();
        await prisma.travelOption.deleteMany();
        await prisma.accommodation.deleteMany();
        await prisma.foodOption.deleteMany();
        await prisma.activity.deleteMany();
        await prisma.destination.deleteMany();
        await prisma.district.deleteMany();
        await prisma.state.deleteMany();
        await prisma.country.deleteMany();
        await prisma.user.deleteMany();
        
        console.log('✅ All data cleared.');

        console.log('--- CREATING ADMIN USER ---');
        const hashedPassword = await bcrypt.hash('password123', 10);
        const admin = await prisma.user.create({
            data: {
                email: 'admin@roamsquad.com',
                name: 'Roam Squad Admin',
                password: hashedPassword,
                role: 'ADMIN'
            }
        });
        console.log(`✅ Admin created: ${admin.email}`);
        
        console.log('--- DATABASE RESET COMPLETE ---');
    } catch (error) {
        console.error('❌ Reset failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

reset();
