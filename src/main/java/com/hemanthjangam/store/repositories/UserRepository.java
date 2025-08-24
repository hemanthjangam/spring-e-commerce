package com.hemanthjangam.store.repositories;

import com.hemanthjangam.store.entities.User;
import org.springframework.data.repository.CrudRepository;

public interface UserRepository extends CrudRepository<User, Long> {
}
