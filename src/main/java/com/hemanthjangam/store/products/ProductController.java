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
import java.util.Optional;

@RestController
@AllArgsConstructor
@RequestMapping("/products")
public class ProductController {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final CategoryRepository categoryRepository;
    private final FileStorageService fileStorageService;

    @GetMapping
    public List<ProductDto> getAllProducts(
            @RequestParam(name = "categoryId", required = false) Long categoryId) {
        List<Product> products;
        if(categoryId != null) {
            products = productRepository.findByCategoryId(categoryId.byteValue());
        }else {
            products = productRepository.findAllWithCategory();
        }

        return products.stream().map(productMapper::toDto).toList();
    }

    @GetMapping("{id}")
    public ResponseEntity<ProductDto> getProduct(@PathVariable Long id) {
        return productRepository.findById(id)
                .map(productMapper::toDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Admin Write: Creates a new product (Multipart Form Data).
     * FIX: Revert to multipart to accept file and JSON part.
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDto> createProduct(
            @RequestPart("product") ProductDto productDto, // DTO part
            @RequestPart(value = "file", required = true) MultipartFile file, // File part (required for POST)
            UriComponentsBuilder uriBuilder) {

        var category = categoryRepository.findById(productDto.getCategoryId().byteValue());
        if(category.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        if (file != null && !file.isEmpty()) {
            String imageUrl = fileStorageService.storeFile(file);
            productDto.setImageUrl(imageUrl); // Save the URL to the DTO
        } else {
            // Return error if file is missing on creation
            return ResponseEntity.badRequest().body(null);
        }

        var product = productMapper.toEntity(productDto);
        product.setCategory(category.get());
        Product savedProduct = productRepository.save(product);

        var savedDto = productMapper.toDto(savedProduct);

        var uri = uriBuilder.path("/products/{id}")
                .buildAndExpand(savedDto.getId())
                .toUri();

        return ResponseEntity.created(uri).body(savedDto);
    }

    /**
     * Admin Write: Updates an existing product (Multipart Form Data).
     */
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDto> updateProduct(
            @PathVariable Long id,
            @RequestPart("product") ProductDto productDto,
            @RequestPart(value = "file", required = false) MultipartFile file) { // File is optional on update

        var product = productRepository.findById(id).orElse(null);
        if(product == null) {
            return ResponseEntity.notFound().build();
        }

        var category = categoryRepository.findById(productDto.getCategoryId().byteValue());
        if(category.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        if (file != null && !file.isEmpty()) {
            String imageUrl = fileStorageService.storeFile(file);
            productDto.setImageUrl(imageUrl);
        } else if (productDto.getImageUrl() == null && product.getImageUrl() != null) {
            // If DTO explicitly sets imageUrl to null (user removed existing image, though component doesn't currently support this directly)
            product.setImageUrl(null);
        }

        productMapper.update(productDto, product);
        product.setCategory(category.get());
        Product updatedProduct = productRepository.save(product);

        return ResponseEntity.ok(productMapper.toDto(updatedProduct));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        if(productRepository.existsById(id)) {
            productRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}