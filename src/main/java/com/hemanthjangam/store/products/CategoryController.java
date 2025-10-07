package com.hemanthjangam.store.products;

import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.StreamSupport;

@RestController
@AllArgsConstructor
@RequestMapping("/categories")
public class CategoryController {

    private final CategoryRepository categoryRepository;

    /**
     * Retrieves all product categories.
     * Maps the Iterable result from CrudRepository to a List for DTO serialization.
     * This endpoint is intended to be publicly accessible (permitAll).
     */
    @GetMapping
    public List<Category> getAllCategories() {
        // CrudRepository returns Iterable, convert it to a List
        return StreamSupport.stream(categoryRepository.findAll().spliterator(), false)
                .toList();
    }
}
