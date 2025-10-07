package com.hemanthjangam.store.wishlist;

import com.hemanthjangam.store.products.Product;
import com.hemanthjangam.store.users.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface WishlistRepository extends JpaRepository<WishlistItem, WishlistItemId> {

    List<WishlistItem> findByUser(User user);

    boolean existsByUserAndProduct(User user, Product product);

    @Transactional
    void deleteByUserAndProduct(User user, Product product);
}
