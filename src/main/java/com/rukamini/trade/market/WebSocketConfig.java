package com.rukamini.trade.market;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final MarketStreamHandler marketStreamHandler;
    private final String websocketPath;
    private final String allowedOrigin;

    public WebSocketConfig(
            MarketStreamHandler marketStreamHandler,
            @Value("${app.market.websocket-path}") String websocketPath,
            @Value("${app.cors.allowed-origin}") String allowedOrigin) {
        this.marketStreamHandler = marketStreamHandler;
        this.websocketPath = websocketPath;
        this.allowedOrigin = allowedOrigin;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(marketStreamHandler, websocketPath)
            .setAllowedOrigins(allowedOrigin);
    }
}