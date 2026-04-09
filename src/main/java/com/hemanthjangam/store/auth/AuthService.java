package com.hemanthjangam.store.auth;

import com.hemanthjangam.store.users.User;
import com.hemanthjangam.store.users.UserNotFoundException;
import com.hemanthjangam.store.users.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class AuthService {
    private final UserRepository userRepository;

    public User getCurrentUser() {
        return userRepository.findById(getCurrentUserId())
                .orElseThrow(UserNotFoundException::new);
    }

    public Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken
                || !(authentication.getPrincipal() instanceof Long userId)) {
            throw new IllegalStateException("Authenticated user not found in security context");
        }

        return userId;
    }
}
