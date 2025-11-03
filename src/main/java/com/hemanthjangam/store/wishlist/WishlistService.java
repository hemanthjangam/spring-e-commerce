package com.hemanthjangam.store.wishlist;

import com.hemanthjangam.store.products.Product;
import com.hemanthjangam.store.products.ProductNotFoundException;
import com.hemanthjangam.store.products.ProductRepository;
import com.hemanthjangam.store.users.User;
import com.hemanthjangam.store.users.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public List<WishlistItem> getWishlist(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(ProductNotFoundException::new);

        return wishlistRepository.findByUser(user);
    }

    public WishlistItem addToWishlist(Long userId, Long productId) {
        User user = userRepository.findById(userId)
                .orElseThrow(ProductNotFoundException::new);

        Product product = productRepository.findById(productId)
                .orElseThrow(ProductNotFoundException::new);

        if (wishlistRepository.existsByUserAndProduct(user, product)) {
            throw new AlreadyInWishlistException("Product already in wishlist");
        }

        WishlistItem item = WishlistItem.builder()
                .id(new WishlistItemId(userId, productId))
                .user(user)
                .product(product)
                .build();

        if (wishlistRepository.existsByUserAndProduct(user, product)) {
            throw new AlreadyInWishlistException("Product already in wishlist");
        }

        return wishlistRepository.save(item);
    }

    public void removeFromWishlist(Long userId, Long productId) {

        User user = userRepository.findById(userId)
                .orElseThrow(ProductNotFoundException::new); // Assuming no-arg is available
        Product product = productRepository.findById(productId)
                .orElseThrow(ProductNotFoundException::new); // Assuming no-arg is available

        if (!wishlistRepository.existsByUserAndProduct(user, product)) {
            throw new ProductNotFoundException();
        }

        wishlistRepository.deleteByUserAndProduct(user, product);
    }
}