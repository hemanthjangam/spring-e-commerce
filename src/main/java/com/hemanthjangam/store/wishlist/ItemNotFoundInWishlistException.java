package com.hemanthjangam.store.wishlist;

public class ItemNotFoundInWishlistException extends RuntimeException {
    public ItemNotFoundInWishlistException(String message) {
        super(message);
    }
}