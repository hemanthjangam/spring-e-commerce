CREATE TABLE carts (
    id BINARY(16) NOT NULL PRIMARY KEY DEFAULT (UUID_TO_BIN(UUID())),
    date_created DATE NOT NULL DEFAULT (CURDATE())
);

CREATE TABLE cart_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cart_id BINARY(16) NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    CONSTRAINT cart_items_carts_id_fk
        FOREIGN KEY (cart_id) REFERENCES carts (id)
        ON DELETE CASCADE,
    CONSTRAINT cart_items_products_id_fk
        FOREIGN KEY (product_id) REFERENCES products (id)
        ON DELETE CASCADE
);
