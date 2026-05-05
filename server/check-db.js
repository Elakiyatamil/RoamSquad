const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const countries = await prisma.country.count();
    const states = await prisma.state.count();
    const districts = await prisma.district.count();
    const destinations = await prisma.destination.count();
    const activities = await prisma.activity.count();
    const foods = await prisma.foodOption.count();
    const accs = await prisma.accommodation.count();
    console.log('=== DATABASE STATUS ===');
    console.log('Countries:', countries);
    console.log('States:', states);
    console.log('Districts:', districts);
    console.log('Destinations:', destinations);
    console.log('Activities:', activities);
    console.log('FoodOptions:', foods);
    console.log('Accommodations:', accs);
    console.log('======================');
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}
check();
