package com.hemanthjangam.store.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Defines the prefix for destinations handled by the message broker (server -> client)
        config.enableSimpleBroker("/topic");

        // Registers the prefix for client-to-server messages
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Registers the main WebSocket endpoint for connection handshake (http://localhost:8080/ws)
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*") // IMPORTANT: Allow frontend origin
                .withSockJS(); // Use SockJS for broader browser support
    }
}