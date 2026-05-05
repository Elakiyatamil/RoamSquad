require('dotenv').config();
const { Pool } = require('pg');

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    await client.query(`
      ALTER TABLE "Destination"
      ALTER COLUMN "districtId" DROP NOT NULL
    `);
    console.log('Destination.districtId is now nullable.');
  } catch (error) {
    console.error('Failed to alter districtId nullability:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
