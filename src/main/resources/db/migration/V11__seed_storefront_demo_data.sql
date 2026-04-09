-- Expand the demo storefront with richer catalog data and user history.
-- Every insert is guarded so the migration remains safe on existing databases.

UPDATE categories
SET image_url = 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80'
WHERE name = 'Electronics' AND (image_url IS NULL OR image_url = '');

UPDATE categories
SET image_url = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80'
WHERE name = 'Fashion' AND (image_url IS NULL OR image_url = '');

UPDATE categories
SET image_url = 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80'
WHERE name = 'Home' AND (image_url IS NULL OR image_url = '');

INSERT INTO categories (name, image_url)
SELECT 'Beauty', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Beauty');

INSERT INTO categories (name, image_url)
SELECT 'Travel', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Travel');

INSERT INTO categories (name, image_url)
SELECT 'Workspace', 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Workspace');

UPDATE products
SET image_url = 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80'
WHERE name = 'Wireless Headphones' AND (image_url IS NULL OR image_url = '');

UPDATE products
SET image_url = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80'
WHERE name = 'Smart Watch' AND (image_url IS NULL OR image_url = '');

UPDATE products
SET image_url = 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=900&q=80'
WHERE name = 'Classic Hoodie' AND (image_url IS NULL OR image_url = '');

UPDATE products
SET image_url = 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80'
WHERE name = 'Minimal Table Lamp' AND (image_url IS NULL OR image_url = '');

INSERT INTO products (name, price, description, category_id, image_url)
SELECT 'Noise Cancelling Earbuds', 2599.00, 'Pocket-friendly earbuds with balanced sound, low-latency mode and fast USB-C charging.', c.id,
       'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=900&q=80'
FROM categories c
WHERE c.name = 'Electronics'
  AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Noise Cancelling Earbuds');

INSERT INTO products (name, price, description, category_id, image_url)
SELECT 'Portable Bluetooth Speaker', 3199.00, 'Compact speaker with deep bass, splash resistance and an all-day battery.', c.id,
       'https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&w=900&q=80'
FROM categories c
WHERE c.name = 'Electronics'
  AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Portable Bluetooth Speaker');

INSERT INTO products (name, price, description, category_id, image_url)
SELECT 'Slim Laptop Backpack', 1899.00, 'Water-resistant backpack with a padded laptop sleeve and clean commuter styling.', c.id,
       'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80'
FROM categories c
WHERE c.name = 'Travel'
  AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Slim Laptop Backpack');

INSERT INTO products (name, price, description, category_id, image_url)
SELECT 'Weekend Duffel Bag', 2299.00, 'A structured travel duffel with shoe compartment and durable woven shell.', c.id,
       'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80'
FROM categories c
WHERE c.name = 'Travel'
  AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Weekend Duffel Bag');

INSERT INTO products (name, price, description, category_id, image_url)
SELECT 'Relaxed Linen Shirt', 1399.00, 'Breathable linen shirt tailored for warm weather and easy layering.', c.id,
       'https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=900&q=80'
FROM categories c
WHERE c.name = 'Fashion'
  AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Relaxed Linen Shirt');

INSERT INTO products (name, price, description, category_id, image_url)
SELECT 'Everyday Sneakers', 2799.00, 'Minimal sneakers with cushioned soles designed for daily wear.', c.id,
       'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80'
FROM categories c
WHERE c.name = 'Fashion'
  AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Everyday Sneakers');

INSERT INTO products (name, price, description, category_id, image_url)
SELECT 'Ceramic Dinner Set', 3499.00, 'Twelve-piece matte ceramic dinnerware set for modern dining tables.', c.id,
       'https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=900&q=80'
FROM categories c
WHERE c.name = 'Home'
  AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Ceramic Dinner Set');

INSERT INTO products (name, price, description, category_id, image_url)
SELECT 'Cotton Throw Blanket', 1199.00, 'Soft textured throw that works well on sofas, accent chairs and beds.', c.id,
       'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80'
FROM categories c
WHERE c.name = 'Home'
  AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Cotton Throw Blanket');

INSERT INTO products (name, price, description, category_id, image_url)
SELECT 'Vitamin C Face Serum', 899.00, 'Brightening serum for a simple morning routine with lightweight hydration.', c.id,
       'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=80'
FROM categories c
WHERE c.name = 'Beauty'
  AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Vitamin C Face Serum');

INSERT INTO products (name, price, description, category_id, image_url)
SELECT 'Hydrating Gel Moisturizer', 1099.00, 'Daily moisturizer with a clean finish that layers well under sunscreen.', c.id,
       'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=80'
FROM categories c
WHERE c.name = 'Beauty'
  AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Hydrating Gel Moisturizer');

INSERT INTO products (name, price, description, category_id, image_url)
SELECT 'Walnut Desk Organizer', 1499.00, 'Solid wood organizer with trays for notebooks, pens and charging cables.', c.id,
       'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=80'
FROM categories c
WHERE c.name = 'Workspace'
  AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Walnut Desk Organizer');

INSERT INTO products (name, price, description, category_id, image_url)
SELECT 'Ergonomic Office Chair', 8999.00, 'Supportive home-office chair with breathable mesh back and adjustable height.', c.id,
       'https://images.unsplash.com/photo-1505843513577-22bb7d21e455?auto=format&fit=crop&w=900&q=80'
FROM categories c
WHERE c.name = 'Workspace'
  AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Ergonomic Office Chair');

INSERT INTO users (name, email, password, role)
SELECT 'Maya Customer', 'maya@store.local', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'USER'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'maya@store.local');

INSERT INTO users (name, email, password, role)
SELECT 'Arjun Customer', 'arjun@store.local', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'USER'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'arjun@store.local');

INSERT INTO orders (customer_id, status, created_at, total_price)
SELECT u.id, 'PAID', '2026-01-06 10:15:00', 5798.00
FROM users u
WHERE u.email = 'demo@store.local'
  AND NOT EXISTS (
    SELECT 1
    FROM orders o
    WHERE o.customer_id = u.id AND o.created_at = '2026-01-06 10:15:00'
  );

INSERT INTO orders (customer_id, status, created_at, total_price)
SELECT u.id, 'PAID', '2026-02-14 19:45:00', 4498.00
FROM users u
WHERE u.email = 'demo@store.local'
  AND NOT EXISTS (
    SELECT 1
    FROM orders o
    WHERE o.customer_id = u.id AND o.created_at = '2026-02-14 19:45:00'
  );

INSERT INTO orders (customer_id, status, created_at, total_price)
SELECT u.id, 'PENDING', '2026-03-03 12:30:00', 1199.00
FROM users u
WHERE u.email = 'maya@store.local'
  AND NOT EXISTS (
    SELECT 1
    FROM orders o
    WHERE o.customer_id = u.id AND o.created_at = '2026-03-03 12:30:00'
  );

INSERT INTO orders (customer_id, status, created_at, total_price)
SELECT u.id, 'PAID', '2026-03-18 09:10:00', 11298.00
FROM users u
WHERE u.email = 'admin@store.local'
  AND NOT EXISTS (
    SELECT 1
    FROM orders o
    WHERE o.customer_id = u.id AND o.created_at = '2026-03-18 09:10:00'
  );

INSERT INTO order_items (order_id, product_id, unit_price, quantity, total_price)
SELECT o.id, p.id, 2999.00, 1, 2999.00
FROM orders o
JOIN users u ON u.id = o.customer_id
JOIN products p ON p.name = 'Wireless Headphones'
WHERE u.email = 'demo@store.local'
  AND o.created_at = '2026-01-06 10:15:00'
  AND NOT EXISTS (
    SELECT 1 FROM order_items oi WHERE oi.order_id = o.id AND oi.product_id = p.id
  );

INSERT INTO order_items (order_id, product_id, unit_price, quantity, total_price)
SELECT o.id, p.id, 2799.00, 1, 2799.00
FROM orders o
JOIN users u ON u.id = o.customer_id
JOIN products p ON p.name = 'Everyday Sneakers'
WHERE u.email = 'demo@store.local'
  AND o.created_at = '2026-01-06 10:15:00'
  AND NOT EXISTS (
    SELECT 1 FROM order_items oi WHERE oi.order_id = o.id AND oi.product_id = p.id
  );

INSERT INTO order_items (order_id, product_id, unit_price, quantity, total_price)
SELECT o.id, p.id, 2299.00, 1, 2299.00
FROM orders o
JOIN users u ON u.id = o.customer_id
JOIN products p ON p.name = 'Weekend Duffel Bag'
WHERE u.email = 'demo@store.local'
  AND o.created_at = '2026-02-14 19:45:00'
  AND NOT EXISTS (
    SELECT 1 FROM order_items oi WHERE oi.order_id = o.id AND oi.product_id = p.id
  );

INSERT INTO order_items (order_id, product_id, unit_price, quantity, total_price)
SELECT o.id, p.id, 1099.00, 2, 2198.00
FROM orders o
JOIN users u ON u.id = o.customer_id
JOIN products p ON p.name = 'Hydrating Gel Moisturizer'
WHERE u.email = 'demo@store.local'
  AND o.created_at = '2026-02-14 19:45:00'
  AND NOT EXISTS (
    SELECT 1 FROM order_items oi WHERE oi.order_id = o.id AND oi.product_id = p.id
  );

INSERT INTO order_items (order_id, product_id, unit_price, quantity, total_price)
SELECT o.id, p.id, 1199.00, 1, 1199.00
FROM orders o
JOIN users u ON u.id = o.customer_id
JOIN products p ON p.name = 'Cotton Throw Blanket'
WHERE u.email = 'maya@store.local'
  AND o.created_at = '2026-03-03 12:30:00'
  AND NOT EXISTS (
    SELECT 1 FROM order_items oi WHERE oi.order_id = o.id AND oi.product_id = p.id
  );

INSERT INTO order_items (order_id, product_id, unit_price, quantity, total_price)
SELECT o.id, p.id, 8999.00, 1, 8999.00
FROM orders o
JOIN users u ON u.id = o.customer_id
JOIN products p ON p.name = 'Ergonomic Office Chair'
WHERE u.email = 'admin@store.local'
  AND o.created_at = '2026-03-18 09:10:00'
  AND NOT EXISTS (
    SELECT 1 FROM order_items oi WHERE oi.order_id = o.id AND oi.product_id = p.id
  );

INSERT INTO order_items (order_id, product_id, unit_price, quantity, total_price)
SELECT o.id, p.id, 2299.00, 1, 2299.00
FROM orders o
JOIN users u ON u.id = o.customer_id
JOIN products p ON p.name = 'Weekend Duffel Bag'
WHERE u.email = 'admin@store.local'
  AND o.created_at = '2026-03-18 09:10:00'
  AND NOT EXISTS (
    SELECT 1 FROM order_items oi WHERE oi.order_id = o.id AND oi.product_id = p.id
  );

INSERT INTO wishlist_items (user_id, product_id)
SELECT u.id, p.id
FROM users u
JOIN products p ON p.name = 'Portable Bluetooth Speaker'
WHERE u.email = 'demo@store.local'
  AND NOT EXISTS (
    SELECT 1 FROM wishlist_items w WHERE w.user_id = u.id AND w.product_id = p.id
  );

INSERT INTO wishlist_items (user_id, product_id)
SELECT u.id, p.id
FROM users u
JOIN products p ON p.name = 'Walnut Desk Organizer'
WHERE u.email = 'demo@store.local'
  AND NOT EXISTS (
    SELECT 1 FROM wishlist_items w WHERE w.user_id = u.id AND w.product_id = p.id
  );

INSERT INTO wishlist_items (user_id, product_id)
SELECT u.id, p.id
FROM users u
JOIN products p ON p.name = 'Vitamin C Face Serum'
WHERE u.email = 'maya@store.local'
  AND NOT EXISTS (
    SELECT 1 FROM wishlist_items w WHERE w.user_id = u.id AND w.product_id = p.id
  );
