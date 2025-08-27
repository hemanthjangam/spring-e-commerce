 ALTER TABLE wishList
 DROP FOREIGN KEY fk_wishList_on_product;

 ALTER TABLE wishList
    ADD CONSTRAINT fk_wishList_on_product
        FOREIGN KEY (product_id) REFERENCES products (id)
            ON DELETE CASCADE;