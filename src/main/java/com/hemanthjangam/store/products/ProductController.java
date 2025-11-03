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
import java.util.stream.Collectors;

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

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDto> updateProduct(
            @PathVariable Long id,
            @RequestPart("product") ProductDto productDto,
            @RequestPart(value = "file", required = false) MultipartFile file) {

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

    @GetMapping("/search")
    public List<ProductDto> searchProducts(@RequestParam("q") String query) {
        List<Product> products = productRepository.searchProducts(query);

        return products.stream()
                .map(productMapper::toDto)
                .collect(Collectors.toList());
    }
}