package com.hemanthjangam.store.repositories;

import com.hemanthjangam.store.dtos.UserSummary;
import com.hemanthjangam.store.entities.Profile;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface ProfileRepository extends CrudRepository<Profile, Long> {
}
