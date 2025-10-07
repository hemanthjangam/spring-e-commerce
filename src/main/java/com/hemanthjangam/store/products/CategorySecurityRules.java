package com.hemanthjangam.store.products;

import com.hemanthjangam.store.common.SecurityRules;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AuthorizeHttpRequestsConfigurer;
import org.springframework.stereotype.Component;

@Component
public class CategorySecurityRules implements SecurityRules {
    @Override
    public void configure(AuthorizeHttpRequestsConfigurer<HttpSecurity>.AuthorizationManagerRequestMatcherRegistry registry) {
        // Allow all GET requests to fetch categories without requiring authentication.
        registry.requestMatchers(HttpMethod.GET, "/categories/**").permitAll();
    }
}