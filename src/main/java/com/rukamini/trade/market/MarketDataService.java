package com.rukamini.trade.market;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class MarketDataService {

    private final Map<String, MarketQuote> quotes = new LinkedHashMap<>();
    private final MarketStreamHandler marketStreamHandler;

    public MarketDataService(MarketStreamHandler marketStreamHandler) {
        this.marketStreamHandler = marketStreamHandler;
        addQuote("RELIANCE", "Reliance Industries", 2980.00, 2962.50);
        addQuote("TCS", "Tata Consultancy Services", 4125.00, 4154.20);
        addQuote("INFY", "Infosys", 1890.00, 1872.80);
        addQuote("HDFCBANK", "HDFC Bank", 1678.00, 1691.50);
        addQuote("ICICIBANK", "ICICI Bank", 1265.00, 1257.35);
        addQuote("TATAMOTORS", "Tata Motors", 984.00, 971.20);
    }

    public synchronized Collection<MarketQuote> getQuotes() {
        return quotes.values().stream().toList();
    }

    public synchronized MarketQuote getQuote(String symbol) {
        return quotes.get(symbol);
    }

    @Scheduled(fixedRate = 1000)
    public synchronized void updateQuotes() {
        quotes.replaceAll((symbol, previous) -> {
            double change = ThreadLocalRandom.current().nextDouble(-0.0018, 0.0018);
            double price = Math.max(0.05, previous.price() * (1 + change));
            double previousClose = previous.price() - previous.change();
            double dayChange = price - previousClose;
            MarketQuote updated = new MarketQuote(
                    previous.symbol(),
                    previous.name(),
                    previous.exchange(),
                    round(price),
                round(dayChange),
                round((dayChange / previousClose) * 100),
                    Instant.now()
            );
            marketStreamHandler.publish(updated);
            return updated;
        });
    }

    private void addQuote(String symbol, String name, double price, double previousClose) {
        double change = price - previousClose;
        quotes.put(symbol, new MarketQuote(
                symbol, name, "NSE", price, round(change), round(change / previousClose * 100), Instant.now()
        ));
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}