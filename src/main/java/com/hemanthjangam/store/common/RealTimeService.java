package com.hemanthjangam.store.common;

import com.hemanthjangam.store.products.StockUpdateDto;
import lombok.AllArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class RealTimeService {
    // SimpMessagingTemplate is the tool used to send messages to subscribed WebSocket clients.
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Publishes a stock update message to all subscribed clients for a specific product.
     * The clients subscribe to the topic: /topic/inventory/{productId}
     *
     * @param productId The ID of the product whose stock changed.
     * @param newStock The new, current stock level.
     */
    public void publishStockUpdate(Long productId, Integer newStock) {
        // Define the specific topic path
        String topic = "/topic/inventory/" + productId;

        // Create the message payload
        StockUpdateDto update = new StockUpdateDto(productId, newStock);

        // Send the message
        messagingTemplate.convertAndSend(topic, update);
        System.out.printf("Published real-time stock update for Product %d: New Stock=%d%n", productId, newStock);
    }
}