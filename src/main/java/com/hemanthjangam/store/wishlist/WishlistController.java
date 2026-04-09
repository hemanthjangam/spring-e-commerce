package com.hemanthjangam.store.wishlist;

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
    public List<WishlistItemDto> getWishlist(@AuthenticationPrincipal Long userId) {
        ensureAuthenticated(userId);
        return wishlistService.getWishlist(userId);
    }

    @PostMapping("/{productId}")
    @ResponseStatus(HttpStatus.CREATED)
    public WishlistItemDto addToWishlist(@AuthenticationPrincipal Long userId, @PathVariable Long productId) {
        ensureAuthenticated(userId);
        return wishlistService.addToWishlist(userId, productId);
    }

    @DeleteMapping("/{productId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeFromWishlist(@AuthenticationPrincipal Long userId, @PathVariable Long productId) {
        ensureAuthenticated(userId);
        wishlistService.removeFromWishlist(userId, productId);
    }
}
