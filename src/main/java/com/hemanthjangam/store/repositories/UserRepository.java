package com.hemanthjangam.store.repositories;

import com.hemanthjangam.store.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}
