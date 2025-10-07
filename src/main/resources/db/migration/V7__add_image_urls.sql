ALTER TABLE products
ADD COLUMN image_url VARCHAR(2048);

-- Add image_url column to the categories table
ALTER TABLE categories
ADD COLUMN image_url VARCHAR(2048);