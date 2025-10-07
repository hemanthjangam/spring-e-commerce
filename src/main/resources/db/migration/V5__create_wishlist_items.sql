CREATE TABLE wishlist_items (
  user_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  PRIMARY KEY (user_id, product_id),
  CONSTRAINT fk_wishlist_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_wishlist_product FOREIGN KEY (product_id) REFERENCES products(id)
);
