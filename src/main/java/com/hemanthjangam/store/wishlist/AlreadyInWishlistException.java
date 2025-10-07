package com.hemanthjangam.store.wishlist;

public class AlreadyInWishlistException extends RuntimeException {
    public AlreadyInWishlistException(String message) {
        super(message);
    }
}