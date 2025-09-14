package com.hemanthjangam.store.mappers;

import com.hemanthjangam.store.dtos.ProductDto;
import com.hemanthjangam.store.entities.Product;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProductMapper {
    @Mapping(source = "category.id", target = "categoryId")
    ProductDto productDto(Product product);
}
