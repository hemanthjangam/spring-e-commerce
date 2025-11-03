package com.hemanthjangam.store.wishlist;

import com.hemanthjangam.store.products.ProductNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/wishlist")
@AllArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    private void ensureAuthenticated(Long userId) {
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User authentication required");
        }
    }

    @GetMapping
    public List<WishlistItem> getWishlist(@AuthenticationPrincipal Long userId) {
        ensureAuthenticated(userId);
        return wishlistService.getWishlist(userId);
    }

    @PostMapping("/{productId}")
    @ResponseStatus(HttpStatus.CREATED)
    public WishlistItem addToWishlist(@AuthenticationPrincipal Long userId, @PathVariable Long productId) {
        ensureAuthenticated(userId);
        try {
            return wishlistService.addToWishlist(userId, productId);
        } catch (AlreadyInWishlistException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage());
        }
    }

    @DeleteMapping("/{productId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeFromWishlist(@AuthenticationPrincipal Long userId, @PathVariable Long productId) {
        ensureAuthenticated(userId);
        try {
            wishlistService.removeFromWishlist(userId, productId);
        } catch (ProductNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }
}