package com.hemanthjangam.store.products;

import com.hemanthjangam.store.common.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final CategoryService categoryService;
    private final FileStorageService fileStorageService;

    public List<ProductDto> getAllProducts(Long categoryId) {
        List<Product> products = categoryId == null
                ? productRepository.findAllWithCategory()
                : productRepository.findByCategoryId(categoryId.byteValue());

        return products.stream()
                .map(productMapper::toDto)
                .toList();
    }

    public ProductDto getProduct(Long id) {
        return productMapper.toDto(findProduct(id));
    }

    public List<ProductDto> searchProducts(String query) {
        return productRepository.searchProducts(query).stream()
                .map(productMapper::toDto)
                .toList();
    }

    @Transactional
    public ProductDto createProduct(ProductDto productDto, MultipartFile file) {
        Product product = productMapper.toEntity(productDto);
        product.setCategory(categoryService.getCategory(productDto.getCategoryId()));
        product.setImageUrl(storeRequiredImage(file));

        return productMapper.toDto(productRepository.save(product));
    }

    @Transactional
    public ProductDto updateProduct(Long id, ProductDto productDto, MultipartFile file) {
        Product existingProduct = findProduct(id);

        productMapper.update(productDto, existingProduct);
        existingProduct.setCategory(categoryService.getCategory(productDto.getCategoryId()));

        if (file != null && !file.isEmpty()) {
            existingProduct.setImageUrl(fileStorageService.storeFile(file));
        } else if (productDto.getImageUrl() == null || productDto.getImageUrl().isBlank()) {
            existingProduct.setImageUrl(null);
        }

        return productMapper.toDto(productRepository.save(existingProduct));
    }

    @Transactional
    public void deleteProduct(Long id) {
        productRepository.delete(findProduct(id));
    }

    private Product findProduct(Long id) {
        return productRepository.findById(id)
                .orElseThrow(ProductNotFoundException::new);
    }

    private String storeRequiredImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Product image is required");
        }

        return fileStorageService.storeFile(file);
    }
}
