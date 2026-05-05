const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');

async function restore() {
  try {
    console.log('Starting data restoration...');

    const requestsData = JSON.parse(fs.readFileSync('./backups/requests_backup.json', 'utf8'));
    console.log(`Loaded ${requestsData.length} requests from backup.`);

    for (const req of requestsData) {
      // Ensure we don't conflict with existing data if any
      await prisma.itineraryRequest.upsert({
        where: { id: req.id },
        update: {
          ...req,
          createdAt: new Date(req.createdAt)
        },
        create: {
          ...req,
          createdAt: new Date(req.createdAt)
        }
      });
    }

    console.log('Restoration completed successfully.');
  } catch (error) {
    console.error('Restoration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restore();
