import { query } from "../index";
import bcrypt from "bcryptjs";
import { ShopCategory } from "../../constants/categories";

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
    const categoryValues = Object.values(ShopCategory);

    // Construct values string for SQL
    const valuesString = categoryValues.map((_, i) => `($${i + 1})`).join(", ");

    const categoriesResult = await query(
      `
        INSERT INTO categories (name)
        VALUES ${valuesString}
        ON CONFLICT DO NOTHING
        RETURNING id, name
    `,
      categoryValues
    );

    // If no categories returned (already existed), fetch them
    let categories = categoriesResult.rows;
    if (categories.length === 0) {
      const res = await query("SELECT id, name FROM categories");
      categories = res.rows;
    }
    console.log("✅ Categories seeded");

    // 3. Create Products
    const detergent = categories.find(
      (c: any) => c.name === ShopCategory.LAUNDRY_POWDER
    );
    const shampoo = categories.find(
      (c: any) => c.name === ShopCategory.SHAMPOO
    );

    if (detergent) {
      await query(
        `
            INSERT INTO products (name, category_id, base_price, selling_price, image_url)
            VALUES 
            ('مسحوق غسيل أوتوماتيك 5 كيلو', $1, 200.00, 250.00, 'https://placehold.co/400x400'),
            ('مسحوق غسيل يدوي 1 كيلو', $1, 25.00, 35.00, 'https://placehold.co/400x400')
            ON CONFLICT DO NOTHING
        `,
        [detergent.id]
      );
    }

    if (shampoo) {
      await query(
        `
            INSERT INTO products (name, category_id, base_price, selling_price, image_url)
            VALUES 
            ('شامبو بالصبار 400 مل', $1, 50.00, 75.00, 'https://placehold.co/400x400')
            ON CONFLICT DO NOTHING
        `,
        [shampoo.id]
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
