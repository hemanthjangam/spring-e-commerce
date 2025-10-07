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
        // Fetch User or throw the no-argument ProductNotFoundException (to fix the previous compilation error)
        User user = userRepository.findById(userId)
                .orElseThrow(ProductNotFoundException::new);

        return wishlistRepository.findByUser(user);
    }

    public WishlistItem addToWishlist(Long userId, Long productId) {
        // CORRECTED: Fetch User or throw ProductNotFoundException. The incorrect deletion logic is removed.
        User user = userRepository.findById(userId)
                .orElseThrow(ProductNotFoundException::new);

        // Fetch Product or throw ProductNotFoundException
        Product product = productRepository.findById(productId)
                .orElseThrow(ProductNotFoundException::new);

        // CRUCIAL DUPLICATE CHECK: Prevents the "infinite" addition problem
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
        // To resolve the previous compilation error, we must use the no-argument constructor
        // or a constructor that exists on ProductNotFoundException.
        // Assuming you fixed ProductNotFoundException to accept a String, we can keep the messages.
        // If not fixed, change to .orElseThrow(ProductNotFoundException::new);

        User user = userRepository.findById(userId)
                .orElseThrow(ProductNotFoundException::new); // Assuming no-arg is available
        Product product = productRepository.findById(productId)
                .orElseThrow(ProductNotFoundException::new); // Assuming no-arg is available

        if (!wishlistRepository.existsByUserAndProduct(user, product)) {
            // Throwing ProductNotFoundException without a message to use the no-argument constructor
            throw new ProductNotFoundException();
        }

        wishlistRepository.deleteByUserAndProduct(user, product);
    }
}