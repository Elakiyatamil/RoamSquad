const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    const newPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updated = await prisma.user.update({
        where: { email: 'admin@roamsquad.com' },
        data: { password: hashedPassword }
    });

    console.log(`Password reset for: ${updated.email}`);
    console.log(`New password: ${newPassword}`);
    await prisma.$disconnect();
}

main().catch(e => {
    console.error(e.message);
    prisma.$disconnect();
});
