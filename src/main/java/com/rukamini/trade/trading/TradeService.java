package com.rukamini.trade.trading;

import com.rukamini.trade.market.MarketDataService;
import com.rukamini.trade.market.MarketQuote;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Comparator;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TradeService {

    private final MarketDataService marketDataService;
    private final Map<String, TradeOrder> orders = new ConcurrentHashMap<>();

    public TradeService(MarketDataService marketDataService) {
        this.marketDataService = marketDataService;
    }

    public java.util.List<TradeOrder> getOrders() {
        return orders.values().stream()
                .sorted(Comparator.comparing(TradeOrder::createdAt).reversed())
                .toList();
    }

    public TradeOrder placeOrder(OrderRequest request) {
        if (request == null || request.symbol() == null || request.side() == null || request.orderType() == null) {
            throw new IllegalArgumentException("Symbol, side, and order type are required");
        }

        String symbol = request.symbol().trim().toUpperCase();
        String side = request.side().trim().toUpperCase();
        String orderType = request.orderType().trim().toUpperCase();
        if (marketDataService.getQuote(symbol) == null) {
            throw new IllegalArgumentException("Unknown symbol: " + symbol);
        }
        if (!side.equals("BUY") && !side.equals("SELL")) {
            throw new IllegalArgumentException("Side must be BUY or SELL");
        }
        if (request.quantity() < 1 || request.quantity() > 100000) {
            throw new IllegalArgumentException("Quantity must be between 1 and 100000");
        }
        if (!orderType.equals("MARKET") && !orderType.equals("LIMIT")) {
            throw new IllegalArgumentException("Order type must be MARKET or LIMIT");
        }

        MarketQuote quote = marketDataService.getQuote(symbol);
        double price = orderType.equals("MARKET") ? quote.price() : request.price();
        if (price <= 0 || !Double.isFinite(price)) {
            throw new IllegalArgumentException("A positive limit price is required");
        }

        TradeOrder order = new TradeOrder(
                UUID.randomUUID().toString(), symbol, side, request.quantity(), orderType,
                Math.round(price * 100.0) / 100.0,
                orderType.equals("MARKET") ? "COMPLETE" : "OPEN",
                Instant.now()
        );
        orders.put(order.id(), order);
        return order;
    }

    public record OrderRequest(String symbol, String side, int quantity, String orderType, double price) {
    }
}