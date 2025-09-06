package com.hemanthjangam.store.services;

import com.hemanthjangam.store.entities.Address;
import com.hemanthjangam.store.entities.Category;
import com.hemanthjangam.store.entities.Product;
import com.hemanthjangam.store.entities.User;
import com.hemanthjangam.store.repositories.*;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@AllArgsConstructor
@Service
public class UserService {
    private final UserRepository userRepository;
    private final EntityManager entityManager;
    private final ProfileRepository profileRepository;
    private final AddressRepository addressRepository;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Transactional
    public void showEntityStates() {
        var user = User.builder()
                .name("name")
                .email("name@example.com")
                .password("password")
                .build();

        if(entityManager.contains(user))
            System.out.println("Persistent");
        else
            System.out.println("Transient / Detached");

        userRepository.save(user);

        if(entityManager.contains(user))
            System.out.println("Persistent");
        else
            System.out.println("Transient / Detached");
    }

    @Transactional
    public void showRelatedEntities() {
        var profile = profileRepository.findById(2L).orElseThrow();
        System.out.println(profile.getUser().getEmail());
    }

    public void fetchAddress() {
       var address =  addressRepository.findById(1L).orElseThrow();
    }

    public void persistRelated() {
        var user = User.builder()
                .name("name")
                .email("name@example.com")
                .password("password")
                .build();

        var address = Address.builder()
                .street("street")
                .city("city")
                .state("state")
                .zip("zip")
                .build();

        user.addAddress(address);

        userRepository.save(user);
    }

    @Transactional
    public void deleteRelated() {
        var user = userRepository.findById(1L).orElseThrow();
        var address = user.getAddresses().getFirst();
        user.removeAddress(address);
        userRepository.save(user);
    }

    @Transactional
    public void manageProducts() {
         productRepository.deleteById(2L);
    }

    @Transactional
    public void updateProductPrices() {
        productRepository.updatePriceByCategory(BigDecimal.valueOf(10), (byte)1);
    }

    public void fetchProducts() {
        var products = productRepository.findByCategory(new Category((byte)1));
        products.forEach(System.out::println);
    }

    @Transactional
    public void fetchUser() {
        var user = userRepository.findByEmail("name@example1.com").orElseThrow();
        System.out.println(user);
    }
}
