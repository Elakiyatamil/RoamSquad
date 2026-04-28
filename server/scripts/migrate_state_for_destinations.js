const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    const destinations = await prisma.destination.findMany({ where: { districtId: { not: null } }, select: { id: true, districtId: true } });
    console.log(`Found ${destinations.length} destinations with districtId`);

    let updated = 0;
    for (const dest of destinations) {
      const district = await prisma.district.findUnique({ where: { id: dest.districtId }, select: { stateId: true } });
      if (district && district.stateId) {
        await prisma.destination.update({ where: { id: dest.id }, data: { stateId: district.stateId } });
        updated++;
      }
    }
    console.log(`Updated stateId for ${updated} destinations`);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
