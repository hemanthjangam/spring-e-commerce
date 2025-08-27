package com.hemanthjangam.store.repositories;

import com.hemanthjangam.store.entities.Product;
import org.springframework.data.repository.CrudRepository;

import java.math.BigDecimal;
import java.util.List;

public interface ProductRepository extends CrudRepository<Product, Long> {
    List<Product> findByName(String name);
    List<Product> findByNameLike(String name);
    List<Product> findByNameNotLike(String name);
    List<Product> findByContaining(String name);
    List<Product> findByStartingWith(String name);
    List<Product> findByEndingWithIgnoreCase(String name);

    List<Product> findByPrice(BigDecimal price);
    List<Product> findByPriceGreaterThan(BigDecimal price);
    List<Product> findByGreaterThanEqual(BigDecimal price);
    List<Product> findByLessThanEqual(BigDecimal price);
    List<Product> findByPriceBetween(BigDecimal min, BigDecimal max);

    List<Product> findByDescriptionNull();
    List<Product> findByDescriptionNotNull();

    List<Product> findByDescriptionNullAndNameNull();

    List<Product> findByNameOrderByPriceDesc(String name);

}
