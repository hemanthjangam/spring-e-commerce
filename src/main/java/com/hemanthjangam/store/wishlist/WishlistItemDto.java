package com.hemanthjangam.store.wishlist;

import com.hemanthjangam.store.products.ProductDto;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class WishlistItemDto {
    private Long userId;
    private Long productId;
    private ProductDto product;
}
