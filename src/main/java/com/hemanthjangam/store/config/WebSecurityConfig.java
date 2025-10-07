package com.hemanthjangam.store.config;

import com.hemanthjangam.store.common.SecurityRules;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AuthorizeHttpRequestsConfigurer;
import org.springframework.stereotype.Component;

@Component
public class WebSecurityConfig implements SecurityRules {
    @Override
    public void configure(AuthorizeHttpRequestsConfigurer<HttpSecurity>.AuthorizationManagerRequestMatcherRegistry registry) {
        // 1. Allow WebSocket Handshake (must be public for all users/guests)
        registry.requestMatchers("/ws/**").permitAll();

        // 2. Allow access to static image files saved on the local file system
        // The path /images/** is mapped to the physical upload directory in WebMvcConfig.
        registry.requestMatchers(HttpMethod.GET, "/images/**").permitAll();
    }
}