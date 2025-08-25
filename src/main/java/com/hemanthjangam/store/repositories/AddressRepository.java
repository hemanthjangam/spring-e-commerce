package com.hemanthjangam.store.repositories;

import com.hemanthjangam.store.entities.Address;
import org.springframework.data.repository.CrudRepository;

public interface AddressRepository extends CrudRepository<Address, Long> {
}
