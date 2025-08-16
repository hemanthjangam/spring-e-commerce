package com.hemanthjangam.store.mappers;

import com.hemanthjangam.store.dtos.UserDto;
import com.hemanthjangam.store.entities.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserDto toDto(User user);
}