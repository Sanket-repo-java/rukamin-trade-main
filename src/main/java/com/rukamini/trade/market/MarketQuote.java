package com.rukamini.trade.market;

import java.time.Instant;

public record MarketQuote(
        String symbol,
        String name,
        String exchange,
        double price,
        double change,
        double changePercent,
        Instant updatedAt
) {
}