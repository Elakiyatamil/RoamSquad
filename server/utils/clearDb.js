const prisma = require('./prisma');

async function clearDb() {
    console.log('Clearing database...');
    try {
        // Clear in order (children first) to avoid foreign key violations
        await prisma.itineraryRequest.deleteMany();
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

        // Keep the Admin user so we can still log in
        await prisma.user.deleteMany({
            where: {
                role: { not: 'ADMIN' }
            }
        });

        console.log('Database cleared successfully (Admin user preserved).');
    } catch (error) {
        console.error('Error clearing database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

clearDb();
