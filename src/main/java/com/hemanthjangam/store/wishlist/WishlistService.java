package com.hemanthjangam.store.wishlist;

import com.hemanthjangam.store.products.Product;
import com.hemanthjangam.store.products.ProductMapper;
import com.hemanthjangam.store.products.ProductNotFoundException;
import com.hemanthjangam.store.products.ProductRepository;
import com.hemanthjangam.store.users.User;
import com.hemanthjangam.store.users.UserRepository;
import com.hemanthjangam.store.users.UserNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    public List<WishlistItemDto> getWishlist(Long userId) {
        return wishlistRepository.findByUser(findUser(userId)).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public WishlistItemDto addToWishlist(Long userId, Long productId) {
        User user = findUser(userId);
        Product product = findProduct(productId);

        if (wishlistRepository.existsByUserAndProduct(user, product)) {
            throw new AlreadyInWishlistException("Product already in wishlist");
        }

        WishlistItem item = WishlistItem.builder()
                .id(new WishlistItemId(userId, productId))
                .user(user)
                .product(product)
                .build();

        return toDto(wishlistRepository.save(item));
    }

    @Transactional
    public void removeFromWishlist(Long userId, Long productId) {
        User user = findUser(userId);
        Product product = findProduct(productId);

        if (!wishlistRepository.existsByUserAndProduct(user, product)) {
            throw new ItemNotFoundInWishlistException("Wishlist item not found");
        }

        wishlistRepository.deleteByUserAndProduct(user, product);
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(UserNotFoundException::new);
    }

    private Product findProduct(Long productId) {
        return productRepository.findById(productId)
                .orElseThrow(ProductNotFoundException::new);
    }

    private WishlistItemDto toDto(WishlistItem item) {
        return new WishlistItemDto(
                item.getId().getUserId(),
                item.getId().getProductId(),
                productMapper.toDto(item.getProduct())
        );
    }
}
