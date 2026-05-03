const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const models = [
    { name: 'destination', fields: ['coverImage', 'image_url'] },
    { name: 'activity', fields: ['imageUrl', 'image_url'] },
    { name: 'foodOption', fields: ['imageUrl', 'image_url'] },
    { name: 'accommodation', fields: ['imageUrl', 'image_url'] },
    { name: 'upcomingEvent', fields: ['bannerImage', 'image', 'image_url'] },
    { name: 'package', fields: ['coverImage', 'image_url'] },
    { name: 'squadLove', fields: ['url', 'image_url'] },
  ];

  for (const model of models) {
    console.log(`Checking model: ${model.name}`);
    const records = await prisma[model.name].findMany();
    
    for (const record of records) {
      const updates = {};
      let hasUpdate = false;
      
      for (const field of model.fields) {
        const val = record[field];
        if (typeof val === 'string' && val.includes(':5005')) {
          updates[field] = val.replace(':5005', ':5000');
          hasUpdate = true;
        }
      }

      // Also handle arrays (Destination.images, Activity.images)
      if (model.name === 'destination' || model.name === 'activity') {
        const images = record.images;
        if (Array.isArray(images)) {
          const newImages = images.map(img => 
            typeof img === 'string' ? img.replace(':5005', ':5000') : img
          );
          if (JSON.stringify(images) !== JSON.stringify(newImages)) {
            updates.images = newImages;
            hasUpdate = true;
          }
        }
      }

      if (hasUpdate) {
        console.log(`Updating ${model.name} ID ${record.id}...`);
        await prisma[model.name].update({
          where: { id: record.id },
          data: updates
        });
      }
    }
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
