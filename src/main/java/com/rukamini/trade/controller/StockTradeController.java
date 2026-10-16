package com.rukamini.trade.controller;
import com.rukamini.trade.market.MarketDataService;
import com.rukamini.trade.market.MarketQuote;
import com.rukamini.trade.trading.TradeOrder;
import com.rukamini.trade.trading.TradeService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collection;

@RestController
@RequestMapping("${app.api.base-path}")
@CrossOrigin(origins = "${app.cors.allowed-origin}")
public class StockTradeController {

	private final MarketDataService marketDataService;
	private final TradeService tradeService;

	public StockTradeController(MarketDataService marketDataService, TradeService tradeService) {
		this.marketDataService = marketDataService;
		this.tradeService = tradeService;
	}

	@GetMapping("/market/quotes")
	public Collection<MarketQuote> getQuotes() {
		return marketDataService.getQuotes();
	}

	@GetMapping("/orders")
	public Collection<TradeOrder> getOrders() {
		return tradeService.getOrders();
	}

	@PostMapping("/orders")
	public TradeOrder placeOrder(@RequestBody TradeService.OrderRequest request) {
		try {
			return tradeService.placeOrder(request);
		} catch (IllegalArgumentException exception) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, exception.getMessage());
		}
	}
}
