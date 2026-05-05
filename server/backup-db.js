const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');

async function backup() {
  try {
    const backupDir = './backups';
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);

    const inquiries = await prisma.inquiry.findMany().catch(() => []);
    const requests = await prisma.itineraryRequest.findMany().catch(() => []);
    const countries = await prisma.country.findMany().catch(() => []);
    const states = await prisma.state.findMany().catch(() => []);
    const districts = await prisma.district.findMany().catch(() => []);
    const destinations = await prisma.destination.findMany().catch(() => []);

    fs.writeFileSync('./backups/inquiries_backup.json', JSON.stringify(inquiries, null, 2));
    fs.writeFileSync('./backups/requests_backup.json', JSON.stringify(requests, null, 2));
    fs.writeFileSync('./backups/countries_backup.json', JSON.stringify(countries, null, 2));
    fs.writeFileSync('./backups/states_backup.json', JSON.stringify(states, null, 2));
    fs.writeFileSync('./backups/districts_backup.json', JSON.stringify(districts, null, 2));
    fs.writeFileSync('./backups/destinations_backup.json', JSON.stringify(destinations, null, 2));

    console.log('Backup completed successfully.');
    console.log(`Inquiries: ${inquiries.length}`);
    console.log(`Requests: ${requests.length}`);
    console.log(`Countries: ${countries.length}`);
  } catch (error) {
    console.error('Backup failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

backup();
