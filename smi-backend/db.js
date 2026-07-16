// smi-backend/config/db.js

const { Pool } = require("pg");

const isProduction = process.env.NODE_ENV === "production";

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: isProduction
          ? {
              rejectUnauthorized: false,
            }
          : false,
      }
    : {
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT || 5432),
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || "smi_coop_db",
      }
);

module.exports = pool;