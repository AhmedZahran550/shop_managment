import { Pool } from "pg";

const pool = new Pool({
  host: process.env.DATABASE_HOST || "localhost",
  port: parseInt(process.env.DATABASE_PORT || "5432"),
  user: process.env.DATABASE_USER || "shop_user",
  password: process.env.DATABASE_PASSWORD || "shop_password",
  database: process.env.DATABASE_NAME || "shop_db",
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
export default pool;
