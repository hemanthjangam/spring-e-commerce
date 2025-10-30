package com.hemanthjangam.store.products;

import com.hemanthjangam.store.carts.CartProductDto;
import com.hemanthjangam.store.common.FileStorageService;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        imports = {FileStorageService.class}
)
public interface ProductMapper {
    @Mapping(source = "category.id", target = "categoryId")
    ProductDto toDto(Product product);

    @Mapping(target = "imageUrl", expression = "java(FileStorageService.BASE_URL_PATH + product.getImageUrl())")
    CartProductDto toCartProductDto(Product product);

    Product toEntity(ProductDto productDto);

    @Mapping(target = "id", ignore = true)
    void update(ProductDto productDto, @MappingTarget Product product);
}
