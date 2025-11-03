package com.hemanthjangam.store.products;

import com.hemanthjangam.store.common.FileStorageService;
import lombok.AllArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;
import java.util.stream.StreamSupport;

@RestController
@AllArgsConstructor
@RequestMapping("/categories")
public class CategoryController {

    private final CategoryRepository categoryRepository;
    private final FileStorageService fileStorageService;

    @GetMapping
    public List<Category> getAllCategories() {
        return StreamSupport.stream(categoryRepository.findAll().spliterator(), false)
                .toList();
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Category> createCategory(
            @RequestPart("category") CategoryDto categoryDto,
            @RequestPart("file") MultipartFile file,
            UriComponentsBuilder uriBuilder) {

        Category category = new Category();
        category.setName(categoryDto.getName());

        if (file != null && !file.isEmpty()) {
            String imageUrl = fileStorageService.storeFile(file);
            category.setImageUrl(imageUrl); // Save the relative path
        } else {
            return ResponseEntity.badRequest().body(null);
        }

        Category savedCategory = categoryRepository.save(category);

        var uri = uriBuilder.path("/categories/{id}")
                .buildAndExpand(savedCategory.getId())
                .toUri();

        return ResponseEntity.created(uri).body(savedCategory);
    }
}
