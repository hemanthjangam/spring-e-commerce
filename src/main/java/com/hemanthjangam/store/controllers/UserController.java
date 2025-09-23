package com.hemanthjangam.store.controllers;

import com.hemanthjangam.store.dtos.ChangePasswordRequest;
import com.hemanthjangam.store.dtos.RegisterUserRequest;
import com.hemanthjangam.store.dtos.UpdateUserRequest;
import com.hemanthjangam.store.dtos.UserDto;
import com.hemanthjangam.store.exceptions.EmailAlreadyRegisteredException;
import com.hemanthjangam.store.exceptions.UnauthorizedUserException;
import com.hemanthjangam.store.exceptions.UserNotFoundException;
import com.hemanthjangam.store.mappers.UserMapper;
import com.hemanthjangam.store.repositories.UserRepository;
import com.hemanthjangam.store.services.UserService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Map;

@RestController
@AllArgsConstructor
@RequestMapping("/users")
public class UserController {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final UserService userService;

    @GetMapping
    public Iterable<UserDto> getAllUsers(
            @RequestParam(required = false, defaultValue = "", name = "sort") String sort) {
        return userService.getAllUsers(sort);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUser(@PathVariable Long id) {
         var user = userService.getUser(id);
         return ResponseEntity.ok(user);
    }

    @PostMapping
    public ResponseEntity<?> registerUser(
            @Valid @RequestBody RegisterUserRequest request,
            UriComponentsBuilder uriBuilder) {
        var user = userService.registerUser(request);

        var uri = uriBuilder.path("/users/{id}")
                .buildAndExpand(user.getId())
                .toUri();

        return ResponseEntity.created(uri).body(user);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDto> updateUser(
            @PathVariable(name = "id") Long id,
            @RequestBody UpdateUserRequest request) {
        var user = userService.updateUser(id, request);

        return ResponseEntity.ok(userMapper.toDto(user));
    }

    @DeleteMapping("{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/change-password")
    public ResponseEntity<Void> changePassword(
            @PathVariable Long id,
            @RequestBody ChangePasswordRequest request) {
        userService.changePassword(id, request);

        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<Map<String , String>> handleUserNotFound() {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
    }

    @ExceptionHandler(EmailAlreadyRegisteredException.class)
    public ResponseEntity<Map<String, String>> emailAlreadyExists() {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Email already registered."));
    }

    @ExceptionHandler(UnauthorizedUserException.class)
    public ResponseEntity<HttpStatus> unauthorized() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

}
