import { MongoClient } from "mongodb";
import { records } from "../lib/records-data";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Set MONGODB_URI environment variable");
  process.exit(1);
}

const SUPER_ADMIN_EMAIL = process.argv[2];
if (!SUPER_ADMIN_EMAIL) {
  console.error("Usage: npx tsx scripts/seed.ts <your-email>");
  process.exit(1);
}

async function seed() {
  const client = new MongoClient(MONGODB_URI!);
  await client.connect();
  const db = client.db();

  console.log("Seeding records...");

  // Clear existing records
  await db.collection("records").deleteMany({});

  // Insert records with _order for sorting
  const recordDocs = records.map((r, i) => ({ ...r, _order: i }));
  await db.collection("records").insertMany(recordDocs);
  console.log(`  Inserted ${recordDocs.length} records`);

  // Create TTL indexes
  console.log("Creating indexes...");
  await db
    .collection("otpSessions")
    .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  await db
    .collection("sessions")
    .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  await db
    .collection("sessions")
    .createIndex({ sessionToken: 1 }, { unique: true });
  await db
    .collection("users")
    .createIndex({ email: 1 }, { unique: true });
  console.log("  Indexes created");

  // Upsert super admin user
  console.log(`Setting up super admin: ${SUPER_ADMIN_EMAIL}`);
  await db.collection("users").updateOne(
    { email: SUPER_ADMIN_EMAIL.toLowerCase().trim() },
    {
      $set: { roles: ["admin", "super_admin"] },
      $setOnInsert: {
        email: SUPER_ADMIN_EMAIL.toLowerCase().trim(),
        createdAt: new Date(),
      },
    },
    { upsert: true }
  );
  console.log("  Super admin ready");

  console.log("\nSeed complete!");
  await client.close();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
