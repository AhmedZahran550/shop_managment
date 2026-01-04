-- Add search vector update function for products
-- This function updates the search vector to include:
-- - Product name (weight A - highest priority)
-- - Product size (weight B)
-- - Product weight (weight B)
-- - Category name (weight A - highest priority)

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

-- Create trigger to auto-update search vector on insert/update
DROP TRIGGER IF EXISTS product_search_vector_update ON products;

CREATE TRIGGER product_search_vector_update
BEFORE INSERT OR UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION update_product_search_vector();

-- Update all existing products to populate search vectors
UPDATE products SET updated_at = updated_at;

-- Create index on search_vector for performance
CREATE INDEX IF NOT EXISTS idx_products_search_vector ON products USING gin(search_vector);

-- Note: Run this migration manually in your PostgreSQL database
-- You can use a database client or run: psql -d your_database -f this_file.sql
