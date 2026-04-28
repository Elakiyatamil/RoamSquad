require('dotenv').config();
const { Pool } = require('pg');

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1) Add missing stateId column if needed.
    await client.query(`
      ALTER TABLE "Destination"
      ADD COLUMN IF NOT EXISTS "stateId" TEXT
    `);

    // 2) Backfill stateId from District for existing destination rows.
    await client.query(`
      UPDATE "Destination" d
      SET "stateId" = dist."stateId"
      FROM "District" dist
      WHERE d."districtId" = dist."id"
        AND d."stateId" IS NULL
    `);

    // 3) Add FK if missing.
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'Destination_stateId_fkey'
        ) THEN
          ALTER TABLE "Destination"
          ADD CONSTRAINT "Destination_stateId_fkey"
          FOREIGN KEY ("stateId") REFERENCES "State"("id")
          ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END$$;
    `);

    // 4) Add index to keep lookups fast.
    await client.query(`
      CREATE INDEX IF NOT EXISTS "Destination_stateId_idx"
      ON "Destination"("stateId")
    `);

    // 5) Set NOT NULL only when safe.
    const { rows } = await client.query(`
      SELECT COUNT(*)::int AS missing_count
      FROM "Destination"
      WHERE "stateId" IS NULL
    `);
    const missingCount = rows[0]?.missing_count ?? 0;

    if (missingCount === 0) {
      await client.query(`
        ALTER TABLE "Destination"
        ALTER COLUMN "stateId" SET NOT NULL
      `);
      console.log('stateId column is now NOT NULL.');
    } else {
      console.log(`stateId still NULL for ${missingCount} row(s); left nullable for now.`);
    }

    await client.query('COMMIT');
    console.log('Destination.stateId migration patch complete.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration patch failed:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
