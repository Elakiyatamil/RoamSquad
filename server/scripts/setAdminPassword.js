const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  const email = args[0] || 'admin@roamsquad.com';
  const password = args[1];

  if (!password) {
    console.error('Usage: node scripts/setAdminPassword.js <email> <newPassword>');
    process.exit(1);
  }

  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.upsert({
      where: { email },
      update: { password: hashed },
      create: { email, password: hashed, name: 'Admin', role: 'ADMIN' }
    });
    console.log(`Password updated for ${user.email}`);
    process.exit(0);
  } catch (err) {
    console.error('Error setting password:', err);
    process.exit(2);
  } finally {
    await prisma.$disconnect();
  }
}

main();
