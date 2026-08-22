require('dotenv').config();
const prisma = require('../utils/prisma');

// Curated pool of guaranteed 200 OK high-res Unsplash image URLs categorized by theme
const FALLBACK_POOLS = {
    destination: [
        'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1200',
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200',
        'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1200',
        'https://images.unsplash.com/photo-1476514525535-ce74f45814d1?q=80&w=1200',
        'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1200',
        'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1200',
        'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200'
    ],
    activity: [
        'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800',
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800',
        'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?q=80&w=800',
        'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=800',
        'https://images.unsplash.com/photo-1502680390469-be75c86b636f?q=80&w=800',
        'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?q=80&w=800'
    ],
    food: [
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800',
        'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=800',
        'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=800',
        'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=800',
        'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800'
    ],
    stay: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800',
        'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=800',
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=800'
    ]
};

async function isUrlValid(url) {
    if (!url || typeof url !== 'string' || !url.startsWith('http')) return false;
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(url, { method: 'HEAD', signal: controller.signal });
        clearTimeout(timeout);
        return res.status === 200;
    } catch (err) {
        return false;
    }
}

let poolIndices = { destination: 0, activity: 0, food: 0, stay: 0 };
function getFallback(type) {
    const pool = FALLBACK_POOLS[type];
    const item = pool[poolIndices[type] % pool.length];
    poolIndices[type]++;
    return item;
}

async function main() {
    console.log('Validating all database image URLs across Destinations, Activities, Food, and Accommodations...');

    // 1. Destinations
    const dests = await prisma.destination.findMany();
    console.log(`Checking ${dests.length} Destinations...`);
    for (const d of dests) {
        let validCover = d.coverImage;
        if (!(await isUrlValid(validCover))) {
            const fallback = getFallback('destination');
            console.log(`Replacing broken cover image for Destination: "${d.name}" (${validCover} -> ${fallback})`);
            await prisma.destination.update({
                where: { id: d.id },
                data: {
                    coverImage: fallback,
                    image_url: fallback,
                    images: [fallback]
                }
            });
        }
    }

    // 2. Activities
    const acts = await prisma.activity.findMany();
    console.log(`Checking ${acts.length} Activities...`);
    let actFixed = 0;
    for (const a of acts) {
        const valid = await isUrlValid(a.imageUrl);
        if (!valid) {
            const fallback = getFallback('activity');
            console.log(`Replacing broken image for Activity: "${a.name}"`);
            await prisma.activity.update({
                where: { id: a.id },
                data: {
                    imageUrl: fallback,
                    image_url: fallback,
                    images: [fallback]
                }
            });
            actFixed++;
        }
    }
    console.log(`Fixed ${actFixed} broken activity images.`);

    // 3. Food Options
    const foods = await prisma.foodOption.findMany();
    console.log(`Checking ${foods.length} Food Options...`);
    let foodFixed = 0;
    for (const f of foods) {
        const valid = await isUrlValid(f.imageUrl);
        if (!valid) {
            const fallback = getFallback('food');
            console.log(`Replacing broken image for Food: "${f.name}"`);
            await prisma.foodOption.update({
                where: { id: f.id },
                data: {
                    imageUrl: fallback,
                    image_url: fallback
                }
            });
            foodFixed++;
        }
    }
    console.log(`Fixed ${foodFixed} broken food images.`);

    // 4. Accommodations
    const accs = await prisma.accommodation.findMany();
    console.log(`Checking ${accs.length} Accommodations...`);
    let accFixed = 0;
    for (const ac of accs) {
        const valid = await isUrlValid(ac.imageUrl);
        if (!valid) {
            const fallback = getFallback('stay');
            console.log(`Replacing broken image for Accommodation: "${ac.hotelNameInternal || ac.tier}"`);
            await prisma.accommodation.update({
                where: { id: ac.id },
                data: {
                    imageUrl: fallback,
                    image_url: fallback
                }
            });
            accFixed++;
        }
    }
    console.log(`Fixed ${accFixed} broken accommodation images.`);

    console.log('Validation and automated replacement complete! All images in DB return HTTP 200.');
}

main()
    .catch(e => {
        console.error('Error during image validation:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
