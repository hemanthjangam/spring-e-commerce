package com.hemanthjangam.store.mappers;

import com.hemanthjangam.store.dtos.UserDto;
import com.hemanthjangam.store.entities.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserDto toDto(User user);
}