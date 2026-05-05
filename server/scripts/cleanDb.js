const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning mock/test data from DB...');

  try {
    // Delete transactional user data but keep structural configurations
    await prisma.inquiry.deleteMany({});
    console.log('✅ Wiped Inquiries');

    await prisma.wishlistItem.deleteMany({});
    console.log('✅ Wiped WishlistItems');

    await prisma.wishlistLead.deleteMany({});
    console.log('✅ Wiped WishlistLeads');

    await prisma.tripPlan.deleteMany({});
    console.log('✅ Wiped TripPlans');

    await prisma.packageInterest.deleteMany({});
    console.log('✅ Wiped PackageInterests');

    await prisma.eventInterest.deleteMany({});
    console.log('✅ Wiped EventInterests');

    await prisma.package.deleteMany({});
    console.log('✅ Wiped Packages');

    await prisma.upcomingEvent.deleteMany({});
    console.log('✅ Wiped UpcomingEvents');

    await prisma.destination.deleteMany({});
    console.log('✅ Wiped Destinations');

    console.log('🎉 Database fully reset. Schemas and Hierarchy (Country/State/District) preserved.');
  } catch (err) {
    console.error('❌ Error during cleanup:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
