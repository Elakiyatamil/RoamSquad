require('dotenv').config(); // Load .env
const prisma = require('./utils/prisma');

async function main() {
    console.log('--- Database Hierarchy Check ---');
    try {
        const countries = await prisma.country.findMany();
        console.log(`Found ${countries.length} countries:`);
        countries.forEach(c => console.log(`  - ${c.name} (${c.id})`));

        const states = await prisma.state.findMany();
        console.log(`Found ${states.length} states:`);
        states.forEach(s => console.log(`  - ${s.name} (${s.id}) -> Country: ${s.countryId}`));

        const districts = await prisma.district.findMany();
        console.log(`Found ${districts.length} districts:`);
        districts.forEach(d => console.log(`  - ${d.name} (${d.id}) -> State: ${d.stateId}`));
    } catch (err) {
        console.error('Error during hierarchy check:', err.message);
    } finally {
        console.log('--- Check Complete ---');
        await prisma.$disconnect();
    }
}
main();
