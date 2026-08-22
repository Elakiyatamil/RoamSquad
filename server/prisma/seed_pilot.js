require('dotenv').config();
const prisma = require('../utils/prisma');
const pilotData = require('./pilot_seed.json');

async function main() {
    console.log('Starting Pilot Data & Image Ingestion...');

    for (const countryObj of pilotData.countries) {
        console.log(`Processing Country: ${countryObj.country_name}`);
        const country = await prisma.country.upsert({
            where: { name: countryObj.country_name },
            update: { active: true },
            create: { name: countryObj.country_name, active: true }
        });

        for (const stateObj of countryObj.states) {
            console.log(`  Processing State/City: ${stateObj.state_name}`);
            const state = await prisma.state.upsert({
                where: {
                    name_countryId: {
                        name: stateObj.state_name,
                        countryId: country.id
                    }
                },
                update: { active: true },
                create: {
                    name: stateObj.state_name,
                    countryId: country.id,
                    active: true
                }
            });

            for (const destObj of stateObj.destinations) {
                const slug = destObj.destination_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                
                // Remove pre-existing destination with same slug to cleanly re-seed
                await prisma.destination.deleteMany({
                    where: { slug }
                });

                console.log(`    Seeding Destination with Cover Image: ${destObj.destination_name}`);
                const destination = await prisma.destination.create({
                    data: {
                        name: destObj.destination_name,
                        slug: slug,
                        category: destObj.category,
                        status: destObj.status,
                        rating: destObj.rating,
                        description: destObj.description,
                        coverImage: destObj.cover_image,
                        image_url: destObj.cover_image,
                        images: destObj.cover_image ? [destObj.cover_image] : [],
                        stateId: state.id,
                        active: true
                    }
                });

                // Insert Experiences (Activities) with Image URLs
                for (const exp of destObj.experiences) {
                    await prisma.activity.create({
                        data: {
                            name: exp.activity_name,
                            duration: exp.duration,
                            price: exp.price_inr,
                            description: exp.short_description,
                            imageUrl: exp.image_url,
                            image_url: exp.image_url,
                            images: exp.image_url ? [exp.image_url] : [],
                            isFeatured: exp.mark_as_featured,
                            destinationId: destination.id
                        }
                    });
                }

                // Insert Food Options with Image URLs
                for (const food of destObj.food_options) {
                    await prisma.foodOption.create({
                        data: {
                            name: food.dish_name,
                            type: food.meal_type.toUpperCase().replace(/\s+/g, '_'),
                            mealType: food.meal_type,
                            price: food.avg_price_inr,
                            description: food.short_description,
                            imageUrl: food.image_url,
                            image_url: food.image_url,
                            isFeatured: food.mark_as_featured,
                            destinationId: destination.id
                        }
                    });
                }

                // Insert Accommodations with Image URLs
                for (const acc of destObj.accommodations) {
                    const starCount = parseInt(acc.stars) || 3;
                    await prisma.accommodation.create({
                        data: {
                            tier: acc.stay_tier,
                            stars: starCount,
                            price: acc.price_per_night_inr,
                            hotelNameInternal: acc.hotel_name_private,
                            description: acc.description,
                            includes: acc.inclusions.split(',').map(s => s.trim()),
                            imageUrl: acc.image_url,
                            image_url: acc.image_url,
                            isFeatured: acc.mark_as_featured,
                            destinationId: destination.id
                        }
                    });
                }
            }
        }
    }

    console.log('Successfully injected pilot destinations, activities, food options & stay tiers with high-quality images into the database!');
}

main()
    .catch((e) => {
        console.error('Ingestion failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
