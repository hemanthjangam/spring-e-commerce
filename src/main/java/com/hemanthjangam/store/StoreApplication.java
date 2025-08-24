package com.hemanthjangam.store;

import com.hemanthjangam.store.entities.User;
import com.hemanthjangam.store.repositories.UserRepository;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;

@SpringBootApplication
public class StoreApplication {

	public static void main(String[] args) {
		ApplicationContext context =  SpringApplication.run(StoreApplication.class, args);
        var repository =  context.getBean(UserRepository.class);

        var user = User.builder()
                .name("Bunny")
                .email("bunny@example.com")
                .password("password")
                .build();

        repository.save(user);
	}

}
