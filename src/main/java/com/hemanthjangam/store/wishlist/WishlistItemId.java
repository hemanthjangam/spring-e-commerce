package com.hemanthjangam.store.wishlist;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class WishlistItemId implements Serializable {

    @EqualsAndHashCode.Include
    private Long userId;

    @EqualsAndHashCode.Include
    private Long productId;

}