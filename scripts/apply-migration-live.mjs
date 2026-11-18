import pg from "pg";
import fs from "node:fs";
import path from "node:path";

const password = process.env.SUPABASE_DB_PASSWORD;
if (!password) {
  console.error("Error: SUPABASE_DB_PASSWORD environment variable is required to run migrations.");
  console.error("Never commit credentials to repository files.");
  process.exit(1);
}

const client = new pg.Client({
  host: process.env.SUPABASE_DB_HOST || "aws-0-eu-west-1.pooler.supabase.com",
  port: parseInt(process.env.SUPABASE_DB_PORT || "5432", 10),
  user: process.env.SUPABASE_DB_USER || "postgres.wpyfguutcbcutvsarwir",
  password,
  database: process.env.SUPABASE_DB_NAME || "postgres",
  ssl: { rejectUnauthorized: false },
});

async function main() {
  console.log("Connecting to live Supabase PostgreSQL (project wpyfguutcbcutvsarwir)...");
  await client.connect();
  console.log("Connected successfully.");

  const migrationPath = path.join(process.cwd(), "supabase", "migrations", "20261117180000_private_evidence_cloud.sql");
  const sql = fs.readFileSync(migrationPath, "utf8");

  console.log(`Executing migration ${path.basename(migrationPath)} (${sql.length} bytes)...`);

  try {
    await client.query("BEGIN;");
    await client.query(sql);
    await client.query("COMMIT;");
    console.log("Migration applied successfully!");
  } catch (err) {
    await client.query("ROLLBACK;");
    console.error("Migration failed, rolled back:", err);
    process.exitCode = 1;
    return;
  }

  // Verify created tables in public schema
  const res = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `);

  console.log("\nTables created in public schema:");
  console.table(res.rows);

  // Verify RLS status on each table
  const rlsRes = await client.query(`
    SELECT tablename, rowsecurity 
    FROM pg_tables 
    WHERE schemaname = 'public'
    ORDER BY tablename;
  `);

  console.log("\nRow Level Security (rowsecurity) on public tables:");
  console.table(rlsRes.rows);

  // Verify RLS policies
  const policyRes = await client.query(`
    SELECT tablename, policyname, permissive, roles, cmd
    FROM pg_policies
    WHERE schemaname = 'public'
    ORDER BY tablename, policyname;
  `);

  console.log("\nRLS Policies on public tables:");
  console.table(policyRes.rows);

  await client.end();
}

main().catch(console.error);
