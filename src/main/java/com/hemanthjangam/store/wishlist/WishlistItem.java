package com.hemanthjangam.store.wishlist;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.hemanthjangam.store.products.Product;
import com.hemanthjangam.store.users.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "wishlist_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class WishlistItem {

    @EmbeddedId
    private WishlistItemId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JsonIgnoreProperties({"wishlistItems", "orders", "password", "hibernateLazyInitializer"})
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("productId")
    @JsonIgnoreProperties({"wishlistItems", "category", "hibernateLazyInitializer"})
    private Product product;

    // equals(), hashCode() based on id omitted for brevity
}
