package com.hemanthjangam.store.mappers;


import com.hemanthjangam.store.dtos.RegisterUserRequest;
import com.hemanthjangam.store.dtos.UpdateUserRequest;
import com.hemanthjangam.store.dtos.UserDto;
import com.hemanthjangam.store.entities.User;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface UserMapper {
    UserDto toDto(User user);
    User toEntity(RegisterUserRequest request);
    void update(UpdateUserRequest request, @MappingTarget User user);
}
