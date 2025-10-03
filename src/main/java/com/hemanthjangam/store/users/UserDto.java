package com.hemanthjangam.store.users;

import lombok.*;

@AllArgsConstructor
@Getter
public class UserDto {
    private Long id;
    private String name;
    private String email;
}