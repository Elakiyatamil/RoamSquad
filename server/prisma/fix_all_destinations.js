require('dotenv').config();
const prisma = require('../utils/prisma');
const pilotData = require('./pilot_seed.json');

async function main() {
    console.log('Starting full database fix & publication sync...');

    // 1. Force update all existing destinations to ACTIVE status and valid cover images
    for (const countryObj of pilotData.countries) {
        for (const stateObj of countryObj.states) {
            for (const destObj of stateObj.destinations) {
                const slug = destObj.destination_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                
                const cover = destObj.cover_image || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1200";

                await prisma.destination.updateMany({
                    where: {
                        OR: [
                            { slug },
                            { name: destObj.destination_name }
                        ]
                    },
                    data: {
                        status: 'ACTIVE',
                        active: true,
                        coverImage: cover,
                        image_url: cover,
                        images: [cover]
                    }
                });
            }
        }
    }

    // 2. Also ensure any leftover destinations in the database are published with valid images
    const remainingDests = await prisma.destination.findMany({
        where: {
            OR: [
                { coverImage: null },
                { coverImage: "" },
                { images: { isEmpty: true } },
                { status: { not: 'ACTIVE' } }
            ]
        }
    });

    console.log(`Fixing ${remainingDests.length} additional destinations...`);
    for (const d of remainingDests) {
        const fallbackCover = d.coverImage || d.image_url || (d.images && d.images[0]) || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1200";
        await prisma.destination.update({
            where: { id: d.id },
            data: {
                status: 'ACTIVE',
                active: true,
                coverImage: fallbackCover,
                image_url: fallbackCover,
                images: [fallbackCover]
            }
        });
    }

    // 3. Fix Activities images
    const activitiesWithoutImage = await prisma.activity.findMany({
        where: {
            OR: [
                { imageUrl: null },
                { imageUrl: "" }
            ]
        }
    });
    console.log(`Fixing ${activitiesWithoutImage.length} activities missing image URLs...`);
    for (const act of activitiesWithoutImage) {
        const actImg = act.image_url || (act.images && act.images[0]) || "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800";
        await prisma.activity.update({
            where: { id: act.id },
            data: {
                imageUrl: actImg,
                image_url: actImg,
                images: [actImg]
            }
        });
    }

    // 4. Fix FoodOptions images
    const foodWithoutImage = await prisma.foodOption.findMany({
        where: {
            OR: [
                { imageUrl: null },
                { imageUrl: "" }
            ]
        }
    });
    console.log(`Fixing ${foodWithoutImage.length} food options missing image URLs...`);
    for (const f of foodWithoutImage) {
        const foodImg = f.image_url || "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=800";
        await prisma.foodOption.update({
            where: { id: f.id },
            data: {
                imageUrl: foodImg,
                image_url: foodImg
            }
        });
    }

    // 5. Fix Accommodations images
    const accWithoutImage = await prisma.accommodation.findMany({
        where: {
            OR: [
                { imageUrl: null },
                { imageUrl: "" }
            ]
        }
    });
    console.log(`Fixing ${accWithoutImage.length} accommodations missing image URLs...`);
    for (const acc of accWithoutImage) {
        const accImg = acc.image_url || "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800";
        await prisma.accommodation.update({
            where: { id: acc.id },
            data: {
                imageUrl: accImg,
                image_url: accImg
            }
        });
    }

    console.log('Database fix & publication complete! All destinations are ACTIVE and fully populated with images.');
}

main()
    .catch(e => {
        console.error('Error during database fix:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
