package com.hemanthjangam.store.carts;

import com.hemanthjangam.store.products.ProductNotFoundException;
import com.hemanthjangam.store.products.ProductRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@AllArgsConstructor
@Transactional(readOnly = true)
public class CartService {
    private final CartRepository cartRepository;
    private final CartMapper cartMapper;
    private final ProductRepository productRepository;

    @Transactional
    public CartDto createCart() {
        var cart = new Cart();
        cartRepository.save(cart);

        return cartMapper.toDto(cart);
    }

    @Transactional
    public CartItemDto addToCart(UUID cartId, Long productId) {
        var cart = getCartEntity(cartId);
        var product = productRepository.findById(productId).orElseThrow(ProductNotFoundException::new);

        var cartItem = cart.addItem(product);

        cartRepository.save(cart);

        return cartMapper.toDto(cartItem);
    }

    public CartDto getCart(UUID cartId) {
        return cartMapper.toDto(getCartEntity(cartId));
    }

    @Transactional
    public CartItemDto updateItem(UUID cartId, Long productId, Integer quantity) {
        var cart = getCartEntity(cartId);

        var cartItem = cart.getItem(productId);
        if (cartItem == null) {
            throw new ProductNotFoundException();
        }

        cartItem.setQuantity(quantity);
        cartRepository.save(cart);

        return cartMapper.toDto(cartItem);
    }

    @Transactional
    public void removeItem(UUID cartId, Long productId) {
        var cart = getCartEntity(cartId);

        cart.removeItem(productId);

        cartRepository.save(cart);
    }

    @Transactional
    public void clearCart(UUID cartId) {
        var cart = getCartEntity(cartId);

        cart.clear();

        cartRepository.save(cart);
    }

    private Cart getCartEntity(UUID cartId) {
        return cartRepository.getCartWithItems(cartId)
                .orElseThrow(CartNotFoundException::new);
    }
}
