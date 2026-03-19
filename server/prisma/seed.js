require('dotenv').config();
const prisma = require('../utils/prisma');
const bcrypt = require('bcrypt');

async function main() {
    console.log('1. Clearing database...');
    // Clear in order (children first)
    await prisma.itineraryRequest.deleteMany();
    await prisma.package.deleteMany();
    await prisma.mustVisitSpot.deleteMany();
    await prisma.upcomingEvent.deleteMany();
    await prisma.travelOption.deleteMany();
    await prisma.accommodation.deleteMany();
    await prisma.foodOption.deleteMany();
    await prisma.activity.deleteMany();
    await prisma.destination.deleteMany();
    await prisma.district.deleteMany();
    await prisma.state.deleteMany();
    await prisma.country.deleteMany();
    await prisma.user.deleteMany();

    console.log('2. Creating country...');
    const india = await prisma.country.create({
        data: { name: 'India' }
    });

    console.log('3. Creating states...');
    const states = await Promise.all([
        prisma.state.create({ data: { name: 'Kerala', countryId: india.id } }),
        prisma.state.create({ data: { name: 'Karnataka', countryId: india.id } })
    ]);
    const [kerala, karnataka] = states;

    console.log('4. Creating districts...');
    const klDistrictNames = ['Idukki', 'Wayanad', 'Kozhikode', 'Kasaragod', 'Ernakulam', 'Thrissur', 'Palakkad'];
    const kaDistrictNames = ['Mysuru', 'Kodagu', 'Uttara Kannada', 'Dharwad', 'Shimoga', 'Udupi'];

    const districtsMap = {};

    const [klDistricts, kaDistricts] = await Promise.all([
        Promise.all(klDistrictNames.map(name => prisma.district.create({ data: { name, stateId: kerala.id } }))),
        Promise.all(kaDistrictNames.map(name => prisma.district.create({ data: { name, stateId: karnataka.id } })))
    ]);

    klDistricts.forEach(d => districtsMap[d.name] = d);
    kaDistricts.forEach(d => districtsMap[d.name] = d);

    console.log('5. Creating destinations...');
    const munnar = await prisma.destination.create({
        data: {
            name: 'Munnar',
            slug: 'munnar',
            category: 'inside_india',
            rating: 4.8,
            districtId: districtsMap['Idukki'].id,
            description: 'The tea capital of Kerala.'
        }
    });

    const coorg = await prisma.destination.create({
        data: {
            name: 'Coorg',
            slug: 'coorg',
            category: 'inside_india',
            rating: 4.7,
            districtId: districtsMap['Kodagu'].id,
            description: 'The Scotland of India.'
        }
    });

    const gokarna = await prisma.destination.create({
        data: {
            name: 'Gokarna',
            slug: 'gokarna',
            category: 'inside_india',
            rating: 4.5,
            districtId: districtsMap['Uttara Kannada'].id,
            description: 'Temple town with pristine beaches.'
        }
    });

    const mysorePalace = await prisma.destination.create({
        data: {
            name: 'Mysore Palace',
            slug: 'mysore-palace',
            category: 'inside_india',
            rating: 4.9,
            districtId: districtsMap['Mysuru'].id,
            description: 'Historical royal residence.'
        }
    });

    console.log('6. Creating activities...');
    const activities = [
        { destinationId: munnar.id, name: 'Tea Garden Trek', icon: '🍵', price: 600, duration: '3h', description: 'A beautiful trek through tea plantations.', images: [] },
        { destinationId: munnar.id, name: 'Eravikulam Safari', icon: '🦌', price: 1200, duration: '4h', description: 'See the Nilgiri Tahr in their natural habitat.', images: [] },
        { destinationId: coorg.id, name: 'Coffee Plantation Tour', icon: '☕', price: 500, duration: '2h', description: 'Learn about coffee processing.', images: [] },
        { destinationId: gokarna.id, name: 'Beach Trek', icon: '🏖️', price: 800, duration: '3h', description: 'Scenic trek along the coastline.', images: [] }
    ];

    for (const act of activities) {
        await prisma.activity.create({ data: act });
    }

    console.log('7. Creating food options...');
    const foodItems = [
        { destinationId: munnar.id, type: 'BREAKFAST', name: 'Appam & Egg Roast', icon: '🍳', price: 120, dietaryTags: ['Non-Veg'], description: 'Classic Kerala breakfast.' },
        { destinationId: munnar.id, type: 'LUNCH', name: 'Banana Leaf Meal', icon: '🍱', price: 250, dietaryTags: ['Veg'], description: 'Authentic Sadhya experience.' },
        { destinationId: coorg.id, type: 'DINNER', name: 'Pandi Curry', icon: '🥘', price: 400, dietaryTags: ['Non-Veg'], description: 'Famous Coorg pork curry.' },
        { destinationId: gokarna.id, type: 'BREAKFAST', name: 'Tatty Idli', icon: '⚪', price: 80, dietaryTags: ['Veg'], description: 'Soft idlis with spicy chutney.' }
    ];


    for (const item of foodItems) {
        await prisma.foodOption.create({ data: item });
    }

    console.log('8. Creating accommodation...');
    const rooms = [
        { destinationId: munnar.id, tier: 'Luxury', hotelNameInternal: 'Blanket Hotel', description: 'Foggy tea garden views', stars: 5, price: 12000, includes: ['High Tea', 'Infinity Pool'] },
        { destinationId: coorg.id, tier: 'Comfort', hotelNameInternal: 'Coorg Cliffs', description: 'Mist-covered valleys', stars: 4, price: 8000, includes: ['Estate Walk'] }
    ];


    for (const room of rooms) {
        await prisma.accommodation.create({ data: room });
    }

    console.log('9. Creating travel options...');
    await prisma.travelOption.create({
        data: {
            destinationId: munnar.id,
            mode: 'private_car',
            icon: '🚘',
            description: 'Direct pickup from Kochi',
            cost: 4500,
            duration: '4h'
        }
    });


    console.log('10. Creating must visit spots...');
    await prisma.mustVisitSpot.createMany({
        data: [
            { name: 'Kolukkumalai Peak', districtId: districtsMap['Idukki'].id },
            { name: 'Meesapulimala', districtId: districtsMap['Idukki'].id },
            { name: 'Edakkal Caves', districtId: districtsMap['Wayanad'].id },
            { name: 'Kappad Beach', districtId: districtsMap['Kozhikode'].id },
            { name: 'Abbey Falls', districtId: districtsMap['Kodagu'].id },
            { name: 'Chamundi Hills', districtId: districtsMap['Mysuru'].id }
        ]
    });

    console.log('11. Creating upcoming events...');
    await prisma.upcomingEvent.createMany({
        data: [
            {
                name: 'Munnar Tea Festival',
                description: 'Annual tea culture festival',
                startDate: new Date('2026-02-10'),
                endDate: new Date('2026-02-12'),
                districtId: districtsMap['Idukki'].id
            },
            {
                name: 'Kodagu Coffee Harvest',
                description: 'Celebrating the season of coffee',
                startDate: new Date('2026-03-20'),
                endDate: new Date('2026-03-25'),
                districtId: districtsMap['Kodagu'].id
            },
            {
                name: 'Thrissur Pooram',
                description: 'Festival of elephants and umbrellas',
                startDate: new Date('2026-04-15'),
                endDate: new Date('2026-04-16'),
                districtId: districtsMap['Thrissur'].id
            },
            {
                name: 'Kochi Biennale',
                description: 'International contemporary art exhibition',
                startDate: new Date('2026-12-12'),
                endDate: new Date('2027-04-10'),
                districtId: districtsMap['Ernakulam'].id
            }
        ]
    });

    console.log('12. Creating packages...');
    await prisma.package.create({
        data: {
            name: 'Grand South India Tour',
            daysCount: 10,
            totalPrice: 45000,
            highlights: ['Luxury Stays', 'Private SUV', 'Beach Dinner'],
            coverImage: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=1000'
        }
    });

    console.log('13. Creating itinerary requests...');
    await prisma.itineraryRequest.create({
        data: {
            userName: 'John Doe',
            userEmail: 'john@example.com',
            destination: 'Kerala & Karnataka',
            travelDates: 'Dec 2024',
            budget: '₹80,000',
            travelers: 2,
            status: 'new'
        }
    });

    console.log('14. Creating admin user...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    await prisma.user.create({
        data: {
            email: 'admin@roamsquad.com',
            name: 'Roam Squad Admin',
            password: hashedPassword,
            role: 'ADMIN'
        }
    });

    console.log('Database seeded successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
