import { Pool } from "pg";

// Read the PostgreSQL connection URL from the environment.
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured");
}

// Create a pool of reusable database connections.
export const pool = new Pool({
  connectionString,
});