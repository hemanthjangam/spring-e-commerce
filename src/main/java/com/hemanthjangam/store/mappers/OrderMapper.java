package com.hemanthjangam.store.mappers;

import com.hemanthjangam.store.dtos.OrderDto;
import com.hemanthjangam.store.entities.Order;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface OrderMapper {
    OrderDto toDto(Order order);
}
