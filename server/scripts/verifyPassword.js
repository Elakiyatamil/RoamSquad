const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  const email = args[0] || 'admin@roamsquad.com';
  const password = args[1] || 'RoamSquad_Admin_2026!';

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log(`User not found: ${email}`);
      process.exit(1);
    }

    console.log(`Found user: ${user.email} (role=${user.role})`);
    console.log(`Stored hash (first 60 chars): ${user.password.substring(0, 60)}...`);

    const match = await bcrypt.compare(password, user.password);
    console.log(`Password match: ${match}`);
    process.exit(match ? 0 : 2);
  } catch (err) {
    console.error('Verify Error:', err);
    process.exit(3);
  } finally {
    await prisma.$disconnect();
  }
}

main();
