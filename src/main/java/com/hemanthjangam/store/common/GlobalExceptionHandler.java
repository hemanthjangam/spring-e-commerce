package com.hemanthjangam.store.common;

import com.hemanthjangam.store.carts.CartEmptyException;
import com.hemanthjangam.store.carts.CartNotFoundException;
import com.hemanthjangam.store.orders.OrderNotFoundException;
import com.hemanthjangam.store.payments.PaymentException;
import com.hemanthjangam.store.products.CategoryNotFoundException;
import com.hemanthjangam.store.products.ProductNotFoundException;
import com.hemanthjangam.store.users.EmailAlreadyRegisteredException;
import com.hemanthjangam.store.users.UserNotFoundException;
import com.hemanthjangam.store.wishlist.AlreadyInWishlistException;
import com.hemanthjangam.store.wishlist.ItemNotFoundInWishlistException;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorDto> handleUnreadableMessage() {
        return ResponseEntity.badRequest().body(
                new ErrorDto("Invalid request body"));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationErrors(
            MethodArgumentNotValidException exception) {
        var errors = new HashMap<String, String>();

        exception.getBindingResult().getFieldErrors().forEach(error -> {
            errors.put(error.getField(), error.getDefaultMessage());
        });

        return ResponseEntity.badRequest().body(errors);
    }

    @ExceptionHandler({
            EmailAlreadyRegisteredException.class,
            CartEmptyException.class,
            PaymentException.class,
            IllegalArgumentException.class
    })
    public ResponseEntity<ErrorDto> handleBadRequest(RuntimeException exception) {
        return ResponseEntity.badRequest().body(new ErrorDto(exception.getMessage()));
    }

    @ExceptionHandler({
            UserNotFoundException.class,
            ProductNotFoundException.class,
            CategoryNotFoundException.class,
            CartNotFoundException.class,
            OrderNotFoundException.class,
            ItemNotFoundInWishlistException.class
    })
    public ResponseEntity<ErrorDto> handleNotFound(RuntimeException exception) {
        return ResponseEntity.status(404).body(new ErrorDto(exception.getMessage()));
    }

    @ExceptionHandler(AlreadyInWishlistException.class)
    public ResponseEntity<ErrorDto> handleConflict(AlreadyInWishlistException exception) {
        return ResponseEntity.status(409).body(new ErrorDto(exception.getMessage()));
    }

    @ExceptionHandler({BadCredentialsException.class, IllegalStateException.class})
    public ResponseEntity<ErrorDto> handleUnauthorized(RuntimeException exception) {
        return ResponseEntity.status(401).body(new ErrorDto(exception.getMessage()));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorDto> handleAccessDenied() {
        return ResponseEntity.status(403).body(new ErrorDto("Access denied."));
    }
}
