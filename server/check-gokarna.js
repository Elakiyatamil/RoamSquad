const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const dest = await prisma.destination.findFirst({
    where: { name: 'Gokarna' },
    include: {
        activities: true,
        foodOptions: true,
        accommodations: true
    }
  });
  console.log(JSON.stringify(dest, null, 2));
  await prisma.$disconnect();
}

check();
