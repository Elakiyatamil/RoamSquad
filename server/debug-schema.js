const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    console.log('Checking database status...');
    const result = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
    console.log('Tables:', result.map(t => t.table_name));
    
    // Check Activity columns
    const columns = await prisma.$queryRaw`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'Activity'`;
    console.log('Activity columns:', columns);
  } catch (error) {
    console.error('Check failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

check();
