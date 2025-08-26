package com.hemanthjangam.store.services;


import com.hemanthjangam.store.entities.Address;
import com.hemanthjangam.store.repositories.AddressRepository;
import com.hemanthjangam.store.repositories.UserRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class AddressService {
    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    public void showEntityStates() {
        var address = Address.builder()
                .state("state")
                .street("street")
                .zip("zip")
                .city("city")
                .build();

        addressRepository.save(address);
    }
}
