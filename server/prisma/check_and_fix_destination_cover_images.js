require('dotenv').config();
const prisma = require('../utils/prisma');

const DESTINATION_SCENIC_COVERS = {
    'lonavala-khandala': 'https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?q=80&w=1200',
    'ajanta-ellora-caves': 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?q=80&w=1200',
    'mahabalipuram': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=1200',
    'ooty': 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=1200',
    'coorg': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1200',
    'hampi': 'https://images.unsplash.com/photo-1620766182966-c6eb5ed2b788?q=80&w=1200',
    'old-town-royal-mile': 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=1200',
    'arthurs-seat-holyrood-park': 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?q=80&w=1200',
    'westminster-south-bank': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1200',
    'covent-garden-soho': 'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?q=80&w=1200',
    'eiffel-tower-champs-elysees': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1200',
    'montmartre-sacre-coeur': 'https://images.unsplash.com/photo-1549144511-f099e773c147?q=80&w=1200',
    'st-marks-square-grand-canal': 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?q=80&w=1200',
    'murano-burano-islands': 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200',
    'central-park-museum-mile': 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=1200',
    'lower-manhattan-statue-of-liberty': 'https://images.unsplash.com/photo-1534430480872-3498386e7856?q=80&w=1200',
    'national-mall-monuments': 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=1200',
    'historic-georgetown': 'https://images.unsplash.com/photo-1555109307-f7d9da25c244?q=80&w=1200',
    'gyeongbokgung-palace-bukchon-hanok-village': 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=1200',
    'gangnam-coex': 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?q=80&w=1200',
    'haeundae-beach-dongbaek-island': 'https://images.unsplash.com/photo-1535189043414-47a3c49a0bed?q=80&w=1200',
    'gamcheon-culture-village': 'https://images.unsplash.com/photo-1546874177-9e664107314e?q=80&w=1200',
    'shibuya-crossing-scramble-square': 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=1200',
    'yoyogi-park-meiji-jingu-shrine': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200',
    'senso-ji-asakusa': 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=1200',
    'akihabara-ginza': 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1200'
};

async function main() {
    console.log('Ensuring all 26 destinations have pristine scenic landscape cover photos...');
    for (const [slug, scenicCover] of Object.entries(DESTINATION_SCENIC_COVERS)) {
        await prisma.destination.updateMany({
            where: { slug },
            data: {
                coverImage: scenicCover,
                image_url: scenicCover,
                images: [scenicCover]
            }
        });
    }
    console.log('All destination cover images updated with authentic scenic landscapes!');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
