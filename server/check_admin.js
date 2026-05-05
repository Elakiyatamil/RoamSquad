const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        select: { email: true, role: true, password: true },
        take: 10
    });
    console.log('Users in DB:');
    users.forEach(u => {
        console.log(`  Email: ${u.email} | Role: ${u.role} | Hash: ${u.password.substring(0, 20)}...`);
    });
    await prisma.$disconnect();
}

main().catch(e => {
    console.error(e.message);
    prisma.$disconnect();
});
