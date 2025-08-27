package com.hemanthjangam.store.repositories;

import com.hemanthjangam.store.entities.Category;
import org.springframework.data.repository.CrudRepository;

public interface CategoryRepository extends CrudRepository<Category, Byte> {
}
