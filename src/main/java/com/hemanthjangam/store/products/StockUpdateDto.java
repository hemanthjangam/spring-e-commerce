package com.hemanthjangam.store.products;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StockUpdateDto {
    private Long productId;
    private Integer newStock;
}
