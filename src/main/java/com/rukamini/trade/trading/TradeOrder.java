package com.rukamini.trade.trading;

import java.time.Instant;

public record TradeOrder(
        String id,
        String symbol,
        String side,
        int quantity,
        String orderType,
        double price,
        String status,
        Instant createdAt
) {
}