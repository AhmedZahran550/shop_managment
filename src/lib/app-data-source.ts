import "reflect-metadata";
import { DataSource } from "typeorm";
import fs from "fs";
import path from "path";

// Manually load .env.local if not in production and variables are missing
if (process.env.NODE_ENV !== "production") {
  try {
    const envPath = path.resolve(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
      const envConfig = fs.readFileSync(envPath, "utf-8");
      envConfig.split("\n").forEach((line) => {
        const parts = line.split("=");
        if (parts.length >= 2) {
          const key = parts[0].trim();
          const value = parts.slice(1).join("=").trim();
          if (key && value && !process.env[key]) {
            process.env[key] = value;
          }
        }
      });
    }
  } catch (err) {
    console.warn("Failed to load .env.local manually:", err);
  }
}

// Force disable TLS verification for self-signed certificates
// This is needed for development databases like Supabase or other hosted databases
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import { User } from "../entities/User";
import { Product } from "../entities/Product";
import { Category } from "../entities/Category";
import { Activity } from "../entities/Activity";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  host: process.env.DATABASE_HOST || "localhost",
  port: parseInt(process.env.DATABASE_PORT || "5432"),
  username: process.env.DATABASE_USER || "shop_user",
  password: process.env.DATABASE_PASSWORD || "shop_password",
  database: process.env.DATABASE_NAME || "shop_db",
  synchronize: true, // Enable temporarily to update schema
  logging: false,
  entities: [User, Product, Category, Activity],
  subscribers: [],
  migrations: [],
  ssl: {
    rejectUnauthorized: false,
  },
  extra: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
});
