package com.hemanthjangam.store.users; // Or your new profile package

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
@RequestMapping("/profile")
public class ProfileController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<UserDto> getProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        Long userId = Long.parseLong(auth.getName());

        UserDto userDto = userService.getUser(userId);

        return ResponseEntity.ok(userDto);
    }
}