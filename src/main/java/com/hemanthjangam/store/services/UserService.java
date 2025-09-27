package com.hemanthjangam.store.services;

import com.hemanthjangam.store.dtos.ChangePasswordRequest;
import com.hemanthjangam.store.dtos.RegisterUserRequest;
import com.hemanthjangam.store.dtos.UpdateUserRequest;
import com.hemanthjangam.store.dtos.UserDto;
import com.hemanthjangam.store.entities.Role;
import com.hemanthjangam.store.exceptions.EmailAlreadyRegisteredException;
import com.hemanthjangam.store.exceptions.UserNotFoundException;
import com.hemanthjangam.store.exceptions.UnauthorizedUserException;
import com.hemanthjangam.store.mappers.UserMapper;
import com.hemanthjangam.store.repositories.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
@AllArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    public Iterable<UserDto> getAllUsers(String sort) {
        if (!Set.of("name", "email").contains(sort))
            sort = "name";

        return userRepository.findAll(Sort.by(sort))
                .stream()
                .map(user -> new UserDto(user.getId(), user.getName(), user.getEmail()))
                .toList();
    }

    public UserDto getUser(Long id) {
        var user = userRepository.findById(id).orElse(null);
        if(user == null) {
            throw new UserNotFoundException();
        }

        return new UserDto(user.getId(), user.getName(), user.getEmail());
    }

    public UserDto registerUser(RegisterUserRequest request) {
        if(userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyRegisteredException();
        }

        var user = userMapper.toEntity(request);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole(Role.USER);
        userRepository.save(user);

        return userMapper.toDto(user);
    }

    public UserDto updateUser(Long id, UpdateUserRequest request) {
        var user = userRepository.findById(id).orElseThrow(UserNotFoundException::new);
        userMapper.update(request, user);
        userRepository.save(user);

        return userMapper.toDto(user);
    }

    public void deleteUser(Long id) {
        var user = userRepository.findById(id).orElseThrow(UserNotFoundException::new);
        userRepository.delete(user);
    }

    public void changePassword(Long id, ChangePasswordRequest request) {
        var user = userRepository.findById(id).orElseThrow(UserNotFoundException::new);
        if(!user.getPassword().equals(request.getOldPassword())) {
            throw new UnauthorizedUserException();
        }

        user.setPassword(request.getNewPassword());
        userRepository.save(user);
    }

}
