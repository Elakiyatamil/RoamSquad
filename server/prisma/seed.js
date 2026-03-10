const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Clear existing data
    await prisma.itineraryRequest.deleteMany();
    await prisma.seasonalOffer.deleteMany();
    await prisma.specialPackage.deleteMany();
    await prisma.mustVisitSpot.deleteMany();
    await prisma.travelOption.deleteMany();
    await prisma.accommodation.deleteMany();
    await prisma.foodOption.deleteMany();
    await prisma.activity.deleteMany();
    await prisma.destination.deleteMany();
    await prisma.district.deleteMany();
    await prisma.state.deleteMany();
    await prisma.country.deleteMany();

    // 1. Create Country
    const india = await prisma.country.create({
        data: { name: 'India' }
    });

    // 2. Create States
    const kerala = await prisma.state.create({
        data: { name: 'Kerala', countryId: india.id }
    });

    const karnataka = await prisma.state.create({
        data: { name: 'Karnataka', countryId: india.id }
    });

    // 3. Create Districts for Kerala
    const idukki = await prisma.district.create({
        data: { name: 'Idukki', stateId: kerala.id }
    });

    const pathanamthitta = await prisma.district.create({
        data: { name: 'Pathanamthitta', stateId: kerala.id }
    });

    // 4. Create Destination: Munnar (Idukki, Kerala)
    const munnar = await prisma.destination.create({
        data: {
            name: 'Munnar',
            districtId: idukki.id,
            activities: {
                create: [
                    { name: 'Tea Plantation Walk', price: 450, duration: '2 Hours', difficulty: 'Easy' },
                    { name: 'Anamudi Peak Trek', price: 1200, duration: '6 Hours', difficulty: 'Hard' }
                ]
            },
            foodOptions: {
                create: [
                    { mealType: 'breakfast', name: 'Appam & Stew', price: 150, dietaryTags: ['Vegetarian'] },
                    { mealType: 'lunch', name: 'Kerala Sadhya', price: 350, dietaryTags: ['Vegetarian', 'Traditional'] }
                ]
            },
            accommodations: {
                create: [
                    { tier: 'luxury', vibeDescription: 'Misty peak views with private plunge pool', pricePerNight: 12000 },
                    { tier: 'mid_range', vibeDescription: 'Cozy cottage amidst tea gardens', pricePerNight: 4500 }
                ]
            }
        }
    });

    // 5. Create Destination: Gavi (Pathanamthitta, Kerala)
    const gavi = await prisma.destination.create({
        data: {
            name: 'Gavi',
            districtId: pathanamthitta.id,
            activities: {
                create: [
                    { name: 'Jungle Safari', price: 1500, duration: '4 Hours', difficulty: 'Medium' }
                ]
            }
        }
    });

    // 6. Create District for Karnataka
    const kodagu = await prisma.district.create({
        data: { name: 'Kodagu (Coorg)', stateId: karnataka.id }
    });

    // 7. Create Destination: Madikeri (Kodagu, Karnataka)
    const madikeri = await prisma.destination.create({
        data: {
            name: 'Madikeri',
            districtId: kodagu.id,
            activities: {
                create: [
                    { name: 'Coffee Plantation Tour', price: 500, duration: '3 Hours', difficulty: 'Easy' }
                ]
            }
        }
    });

    // 8. Create some Itinerary Requests
    await prisma.itineraryRequest.createMany({
        data: [
            { userName: 'Arjun Mehta', userEmail: 'arjun@example.com', destination: 'Munnar', status: 'PENDING' },
            { userName: 'Sarah Khan', userEmail: 'sarah@example.com', destination: 'Munnar', status: 'PENDING' },
            { userName: 'Rohan Sharma', userEmail: 'rohan@example.com', destination: 'Gavi', status: 'REVIEWING' }
        ]
    });

    console.log('Database seeded successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
