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
@RequestMapping("/profile") // This matches your React app's API call
public class ProfileController {

    private final UserService userService;

    /**
     * Gets the profile details for the currently authenticated user.
     * The user ID is retrieved from the security context, which was
     * populated by the JwtAuthenticationFilter.
     */
    @GetMapping
    public ResponseEntity<UserDto> getProfile() {
        // 1. Get the authentication object from Spring's security context
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        // 2. Get the principal's name, which you set as the userId in your filter
        //
        Long userId = Long.parseLong(auth.getName());

        // 3. Use your existing service to fetch the user data
        UserDto userDto = userService.getUser(userId);

        return ResponseEntity.ok(userDto);
    }
}