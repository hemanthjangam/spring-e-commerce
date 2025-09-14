package com.hemanthjangam.store.controllers;

import com.hemanthjangam.store.dtos.ProductDto;
import com.hemanthjangam.store.entities.Product;
import com.hemanthjangam.store.mappers.ProductMapper;
import com.hemanthjangam.store.repositories.ProductRepository;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.function.EntityResponse;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/products")
public class ProductController {
    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    @GetMapping
    public List<ProductDto> getAllProducts(
           @RequestParam(name = "categoryId", required = false) Byte categoryId
    ) {
        List<Product> products;
        if(categoryId != null) {
            products = productRepository.findByCategoryId(categoryId);
        }else {
            products = productRepository.findAllWithCategory();
        }

        return products.stream().map(productMapper::productDto).toList();
    }

    @GetMapping("{id}")
    public ResponseEntity<ProductDto> getProduct(@PathVariable Long id) {
        var product = productRepository.findById(id).orElse(null);
        if(product == null) {
            return ResponseEntity.notFound().build();
        }

        var productDto = productMapper.productDto(product);
        return ResponseEntity.ok(productDto);
    }
}
