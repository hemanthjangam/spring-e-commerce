package com.hemanthjangam.store.products;

import lombok.Data;
import jakarta.validation.constraints.NotEmpty;

@Data
public class CategoryDto {
    private Byte id;

    @NotEmpty
    private String name;

    private String imageUrl;
}