const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = await prisma.user.upsert({
        where: { email: 'admin@roamsquad.com' },
        update: {},
        create: {
            email: 'admin@roamsquad.com',
            password: hashedPassword,
            name: 'Admin',
            role: 'ADMIN'
        }
    });

    console.log('Admin user created:', admin.email);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
