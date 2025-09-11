package com.hemanthjangam.store.repositories;

import com.hemanthjangam.store.entities.Profile;
import org.springframework.data.repository.CrudRepository;

public interface ProfileRepository extends CrudRepository<Profile, Long> {
}
