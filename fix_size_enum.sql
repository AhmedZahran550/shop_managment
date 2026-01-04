-- Complete fix for enum and trigger errors
-- Run this SQL in your PostgreSQL database

-- Step 1: Drop the trigger first
DROP TRIGGER IF EXISTS product_search_vector_update ON products;

-- Step 2: Drop the trigger function
DROP FUNCTION IF EXISTS update_product_search_vector();

-- Step 3: Drop the existing enum type if it exists (WITHOUT CASCADE this time)
DO $$ 
BEGIN
  DROP TYPE IF EXISTS products_size_enum;
EXCEPTION
  WHEN OTHERS THEN
    -- If it fails, try with CASCADE
    DROP TYPE IF EXISTS products_size_enum CASCADE;
END $$;

-- Step 4: Create the enum type with Arabic values
CREATE TYPE products_size_enum AS ENUM ('صغير', 'متوسط', 'كبير');

-- Step 5: Add or update the size column
DO $$ 
BEGIN
  -- Try to add the column if it doesn't exist
  BEGIN
    ALTER TABLE products ADD COLUMN size products_size_enum;
  EXCEPTION
    WHEN duplicate_column THEN
      -- Column exists, just change its type
      ALTER TABLE products ALTER COLUMN size TYPE products_size_enum USING size::text::products_size_enum;
  END;
END $$;

-- Step 6: Add weight column if it doesn't exist
DO $$ 
BEGIN
  ALTER TABLE products ADD COLUMN weight TEXT;
EXCEPTION
  WHEN duplicate_column THEN
    NULL; -- Column already exists
END $$;

-- Step 7: Recreate the search vector update function
CREATE OR REPLACE FUNCTION update_product_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('simple', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(NEW.size::text, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(NEW.weight, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(
      (SELECT name FROM categories WHERE id = NEW.category_id), ''
    )), 'A');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Recreate the trigger
CREATE TRIGGER product_search_vector_update
BEFORE INSERT OR UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION update_product_search_vector();

-- Step 9: Update search vectors for all products
UPDATE products SET updated_at = updated_at;

-- Step 10: Verify the fix
SELECT COUNT(*) as total_products FROM products;
