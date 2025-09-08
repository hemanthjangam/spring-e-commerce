CREATE PROCEDURE findProductsByPrice(
    IN minPrice DECIMAL(10, 2),
    IN maxPrice DECIMAL(10, 2)
)
BEGIN
    SELECT id, name, description, price, category_id
    FROM products
    WHERE price BETWEEN minPrice AND maxPrice
    ORDER BY name;
END;
