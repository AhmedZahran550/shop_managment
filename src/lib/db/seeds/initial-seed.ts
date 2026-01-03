import { query } from "../index";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("🌱 Starting seed...");

  try {
    // 1. Create Users
    const adminPass = await bcrypt.hash("admin123", 10);
    const workerPass = await bcrypt.hash("worker123", 10);

    // Using ON CONFLICT DO NOTHING to avoid errors if re-running
    await query(
      `
      INSERT INTO users (username, password, role)
      VALUES 
        ('admin', $1, 'admin'),
        ('worker', $2, 'worker')
      ON CONFLICT (username) DO NOTHING
    `,
      [adminPass, workerPass]
    );
    console.log("✅ Users seeded");

    // 2. Create Categories
    const categoriesResult = await query(`
        INSERT INTO categories (name)
        VALUES ('Electronics'), ('Clothing'), ('Groceries')
        ON CONFLICT DO NOTHING
        RETURNING id, name
    `);

    // If no categories returned (already existed), fetch them
    let categories = categoriesResult.rows;
    if (categories.length === 0) {
      const res = await query("SELECT id, name FROM categories");
      categories = res.rows;
    }
    console.log("✅ Categories seeded");

    // 3. Create Products
    const electronics = categories.find((c) => c.name === "Electronics");
    if (electronics) {
      await query(
        `
            INSERT INTO products (name, category_id, base_price, selling_price, image_url)
            VALUES 
            ('Smartphone X', $1, 500.00, 699.99, 'https://placehold.co/400x400'),
            ('Laptop Pro', $1, 900.00, 1199.99, 'https://placehold.co/400x400')
            ON CONFLICT DO NOTHING
        `,
        [electronics.id]
      );
    }
    console.log("✅ Products seeded");

    console.log("🎉 Database seeded successfully!");
  } catch (error) {
    console.error("❌ Seed error:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

seed();
