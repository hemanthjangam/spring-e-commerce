ALTER TABLE wishlist_items
ADD CONSTRAINT unique_user_product UNIQUE (user_id, product_id);
