package com.hemanthjangam.store.services;

import com.hemanthjangam.store.entities.User;
import com.hemanthjangam.store.repositories.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@AllArgsConstructor
@Service
public class AuthService {
    private final UserRepository userRepository;
    public User getCurrentUser() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        var userId = (Long) authentication.getPrincipal();
        var user = userRepository.findById(userId).orElse(null);

        return userRepository.findById(userId).orElse(null);
    }
}
