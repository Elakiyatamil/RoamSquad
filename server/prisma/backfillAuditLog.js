const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function backfill() {
    // Find the admin user to attribute logs to
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!admin) {
        console.error('No admin user found. Run seedAdmin first.');
        return;
    }
    console.log(`Using admin: ${admin.name || admin.email} (${admin.id})`);

    let count = 0;

    // Countries
    const countries = await prisma.country.findMany();
    for (const c of countries) {
        await prisma.auditLog.create({
            data: { userId: admin.id, userName: admin.name || admin.email, action: 'CREATE', entity: 'Country', entityId: c.id, entityName: c.name, details: 'Backfilled from existing data', createdAt: c.createdAt }
        });
        count++;
    }
    console.log(`  Countries: ${countries.length}`);

    // States
    const states = await prisma.state.findMany();
    for (const s of states) {
        await prisma.auditLog.create({
            data: { userId: admin.id, userName: admin.name || admin.email, action: 'CREATE', entity: 'State', entityId: s.id, entityName: s.name, details: 'Backfilled from existing data' }
        });
        count++;
    }
    console.log(`  States: ${states.length}`);

    // Districts
    const districts = await prisma.district.findMany();
    for (const d of districts) {
        await prisma.auditLog.create({
            data: { userId: admin.id, userName: admin.name || admin.email, action: 'CREATE', entity: 'District', entityId: d.id, entityName: d.name, details: 'Backfilled from existing data' }
        });
        count++;
    }
    console.log(`  Districts: ${districts.length}`);

    // Destinations
    const destinations = await prisma.destination.findMany();
    for (const d of destinations) {
        await prisma.auditLog.create({
            data: { userId: admin.id, userName: admin.name || admin.email, action: 'CREATE', entity: 'Destination', entityId: d.id, entityName: d.name, details: 'Backfilled from existing data', createdAt: d.createdAt }
        });
        count++;
    }
    console.log(`  Destinations: ${destinations.length}`);

    // Activities
    const activities = await prisma.activity.findMany();
    for (const a of activities) {
        await prisma.auditLog.create({
            data: { userId: admin.id, userName: admin.name || admin.email, action: 'CREATE', entity: 'Activity', entityId: a.id, entityName: a.name, details: 'Backfilled from existing data' }
        });
        count++;
    }
    console.log(`  Activities: ${activities.length}`);

    // FoodOptions
    const foods = await prisma.foodOption.findMany();
    for (const f of foods) {
        await prisma.auditLog.create({
            data: { userId: admin.id, userName: admin.name || admin.email, action: 'CREATE', entity: 'FoodOption', entityId: f.id, entityName: f.name, details: 'Backfilled from existing data' }
        });
        count++;
    }
    console.log(`  FoodOptions: ${foods.length}`);

    // Accommodations
    const accs = await prisma.accommodation.findMany();
    for (const a of accs) {
        await prisma.auditLog.create({
            data: { userId: admin.id, userName: admin.name || admin.email, action: 'CREATE', entity: 'Accommodation', entityId: a.id, entityName: `${a.tier} tier`, details: 'Backfilled from existing data' }
        });
        count++;
    }
    console.log(`  Accommodations: ${accs.length}`);

    // Packages
    const packages = await prisma.package.findMany();
    for (const p of packages) {
        await prisma.auditLog.create({
            data: { userId: admin.id, userName: admin.name || admin.email, action: 'CREATE', entity: 'Package', entityId: p.id, entityName: p.name, details: 'Backfilled from existing data', createdAt: p.createdAt }
        });
        count++;
    }
    console.log(`  Packages: ${packages.length}`);

    console.log(`\nDone! Backfilled ${count} audit log entries.`);
    await prisma.$disconnect();
}

backfill().catch(e => { console.error(e); prisma.$disconnect(); });
