ALTER TABLE order_items
    MODIFY COLUMN unit_price DECIMAL(10, 2) NOT NULL;

INSERT IGNORE INTO wishlist_items (user_id, product_id)
SELECT user_id, product_id
FROM wishlist;

INSERT INTO categories (name, image_url)
SELECT 'Electronics', NULL
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Electronics');

INSERT INTO categories (name, image_url)
SELECT 'Fashion', NULL
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Fashion');

INSERT INTO categories (name, image_url)
SELECT 'Home', NULL
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Home');

INSERT INTO users (name, email, password, role)
SELECT 'Admin User', 'admin@store.local', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@store.local');

INSERT INTO users (name, email, password, role)
SELECT 'Demo User', 'demo@store.local', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'USER'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'demo@store.local');

INSERT INTO products (name, price, description, category_id, image_url)
SELECT 'Wireless Headphones', 2999.00, 'Comfortable over-ear headphones with clear sound and long battery life.', c.id, NULL
FROM categories c
WHERE c.name = 'Electronics'
  AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Wireless Headphones');

INSERT INTO products (name, price, description, category_id, image_url)
SELECT 'Smart Watch', 4999.00, 'Lightweight smartwatch for calls, fitness tracking and notifications.', c.id, NULL
FROM categories c
WHERE c.name = 'Electronics'
  AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Smart Watch');

INSERT INTO products (name, price, description, category_id, image_url)
SELECT 'Classic Hoodie', 1499.00, 'Soft everyday hoodie with a relaxed fit.', c.id, NULL
FROM categories c
WHERE c.name = 'Fashion'
  AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Classic Hoodie');

INSERT INTO products (name, price, description, category_id, image_url)
SELECT 'Minimal Table Lamp', 899.00, 'Simple modern table lamp for study and bedside use.', c.id, NULL
FROM categories c
WHERE c.name = 'Home'
  AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Minimal Table Lamp');
