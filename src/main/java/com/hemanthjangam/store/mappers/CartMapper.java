package com.hemanthjangam.store.mappers;

import com.hemanthjangam.store.dtos.CartDto;
import com.hemanthjangam.store.dtos.CartItemDto;
import com.hemanthjangam.store.entities.Cart;
import com.hemanthjangam.store.entities.CartItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CartMapper {
    @Mapping(target = "items", source = "items")
    @Mapping(target = "totalPrice", expression = "java(cart.getTotalPrice())")
    CartDto toDto(Cart cart);

    @Mapping(target = "totalPrice", expression = "java(cartItem.getTotalPrice())")
    CartItemDto toDto(CartItem cartItem);
}
