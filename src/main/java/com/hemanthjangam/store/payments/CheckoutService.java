package com.hemanthjangam.store.payments;

import com.hemanthjangam.store.orders.Order;
import com.hemanthjangam.store.carts.CartEmptyException;
import com.hemanthjangam.store.carts.CartNotFoundException;
import com.hemanthjangam.store.carts.CartRepository;
import com.hemanthjangam.store.orders.OrderRepository;
import com.hemanthjangam.store.auth.AuthService;
import com.hemanthjangam.store.carts.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@RequiredArgsConstructor
@Service
public class CheckoutService {
    private final CartRepository cartRepository;
    private final OrderRepository orderRepository;
    private final CartService cartService;
    private final AuthService authService;
    private final PaymentGateway paymentGateway;


    @Transactional
    public CheckoutResponse checkout(@Valid CheckoutRequest request) {
        var cart = cartRepository.getCartWithItems(request.getCartId())
                .orElseThrow(CartNotFoundException::new);

        if (cart.isEmpty()) {
            throw new CartEmptyException();
        }

        var order = Order.fromCart(cart, authService.getCurrentUser());

        orderRepository.save(order);

        try {
            var session = paymentGateway.createCheckoutSession(order);

            cartService.clearCart(cart.getId());

            return new CheckoutResponse(order.getId(), session.getCheckoutUrl());
        }
        catch (PaymentException exception) {
            log.warn("Checkout session creation failed for order {}", order.getId(), exception);
            orderRepository.delete(order);
            throw exception;
        }
    }

    public void handleWebhookEvent(WebhookRequest request) {
        paymentGateway
                .parseWebhookRequest(request)
                .ifPresent(paymentResult -> {
                    var order = orderRepository.findById(paymentResult.getOrderId()).orElseThrow();
                    order.setStatus(paymentResult.getPaymentStatus());
                    orderRepository.save(order);
                });
    }
}
