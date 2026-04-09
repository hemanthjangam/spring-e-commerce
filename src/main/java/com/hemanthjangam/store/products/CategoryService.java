package com.hemanthjangam.store.products;

import com.hemanthjangam.store.common.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.StreamSupport;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final FileStorageService fileStorageService;

    public List<Category> getAllCategories() {
        return StreamSupport.stream(categoryRepository.findAll().spliterator(), false)
                .toList();
    }

    public Category getCategory(Byte id) {
        return categoryRepository.findById(id)
                .orElseThrow(CategoryNotFoundException::new);
    }

    @Transactional
    public Category createCategory(CategoryDto categoryDto, MultipartFile file) {
        Category category = new Category();
        category.setName(categoryDto.getName());
        category.setImageUrl(storeImage(file));

        return categoryRepository.save(category);
    }

    private String storeImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Category image is required");
        }

        return fileStorageService.storeFile(file);
    }
}
