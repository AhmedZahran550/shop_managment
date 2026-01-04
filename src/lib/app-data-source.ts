import "reflect-metadata";
import { DataSource } from "typeorm";

// Force disable TLS verification for self-signed certificates (Supabase/Dev)
if (process.env.NODE_ENV !== "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}
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
  synchronize: false, // Don't auto-sync schema in production safe mode
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
