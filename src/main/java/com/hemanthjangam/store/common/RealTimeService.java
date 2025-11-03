package com.hemanthjangam.store.common;

import com.hemanthjangam.store.products.StockUpdateDto;
import lombok.AllArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class RealTimeService {
    private final SimpMessagingTemplate messagingTemplate;

    public void publishStockUpdate(Long productId, Integer newStock) {
        String topic = "/topic/inventory/" + productId;

        StockUpdateDto update = new StockUpdateDto(productId, newStock);

        messagingTemplate.convertAndSend(topic, update);
        System.out.printf("Published real-time stock update for Product %d: New Stock=%d%n", productId, newStock);
    }
}