import { DatePipe, DecimalPipe, isPlatformBrowser } from '@angular/common';
import { Component, computed, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MarketQuote, MarketService } from '../../core/services/market.service';
import { OrderRequest, OrderService, TradeOrder } from '../../core/services/order.service';
import { WebsocketService } from '../../core/services/websocket.service';
import { AuthService } from '../../core/auth/auth.service';

type TradingPage = 'home' | 'watchlist' | 'orders' | 'positions' | 'holdings' | 'catalogue' | 'tool';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DatePipe, DecimalPipe],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly marketService = inject(MarketService);
  private readonly orderService = inject(OrderService);
  private readonly websocketService = inject(WebsocketService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly quotes = signal<MarketQuote[]>([]);
  readonly orders = signal<TradeOrder[]>([]);
  readonly selectedSymbol = signal('RELIANCE');
  readonly side = signal<'BUY' | 'SELL'>('BUY');
  readonly orderType = signal<'MARKET' | 'LIMIT'>('MARKET');
  readonly quantity = signal(1);
  readonly limitPrice = signal(0);
  readonly connectionState = signal<'connecting' | 'live' | 'disconnected'>('connecting');
  readonly notice = signal('');
  readonly activePage = signal<TradingPage>('home');
  readonly activeCategory = signal('Ideas');
  readonly activeSession = signal('Upcoming');
  readonly activeTool = signal('');
  readonly searchTerm = signal('');
  readonly selectedQuote = computed(() => this.quotes().find((quote) => quote.symbol === this.selectedSymbol()));
  readonly filteredQuotes = computed(() => {
    const query = this.searchTerm().trim().toLowerCase();
    return this.quotes().filter((quote) => !query
      || quote.symbol.toLowerCase().includes(query)
      || quote.name.toLowerCase().includes(query));
  });

  readonly categories = ['Ideas', 'Stocks', 'Options', 'MF', 'US Stocks'];
  readonly shortcuts = ['MTF', 'IPO', 'Advisory', 'Algoverse', 'Chart 360', 'Scalper', 'Intraday Screeners'];
  readonly pages: { id: TradingPage; label: string; icon: string }[] = [
    { id: 'home', label: 'Home', icon: '⌂' },
    { id: 'watchlist', label: 'My Lists', icon: '☷' },
    { id: 'orders', label: 'Orders', icon: '▤' },
    { id: 'positions', label: 'Positions', icon: '↕' },
    { id: 'holdings', label: 'Holdings', icon: '▧' }
  ];

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.marketService.getMarketData().subscribe({
      next: (quotes) => {
        this.quotes.set(quotes);
        const selected = quotes.find((quote) => quote.symbol === this.selectedSymbol()) ?? quotes[0];
        if (selected) {
          this.selectedSymbol.set(selected.symbol);
          this.limitPrice.set(selected.price);
        }
      },
      error: () => this.notice.set('Market API unavailable. Start the Spring Boot service to receive quotes.')
    });
    this.orderService.getOrders().subscribe({
      next: (orders) => this.orders.set(orders),
      error: () => this.notice.set('Orders are unavailable until the trading API is running.')
    });
    this.websocketService.quotes$.subscribe((updatedQuote) => {
      this.quotes.update((quotes) => quotes.map((quote) => quote.symbol === updatedQuote.symbol ? updatedQuote : quote));
    });
    this.websocketService.state$.subscribe((state) => this.connectionState.set(state));
    this.websocketService.connect();
  }

  selectQuote(quote: MarketQuote): void {
    this.selectedSymbol.set(quote.symbol);
    this.limitPrice.set(quote.price);
    this.notice.set('');
  }

  submitOrder(): void {
    const quote = this.selectedQuote();
    if (!quote || !Number.isInteger(this.quantity()) || this.quantity() < 1) {
      this.notice.set('Enter a valid quantity to place this order.');
      return;
    }

    const request: OrderRequest = {
      symbol: quote.symbol,
      side: this.side(),
      quantity: this.quantity(),
      orderType: this.orderType(),
      price: this.orderType() === 'MARKET' ? quote.price : this.limitPrice()
    };
    this.orderService.placeOrder(request).subscribe({
      next: (order) => {
        this.orders.update((orders) => [order, ...orders]);
        this.notice.set(`${order.side} order ${order.status.toLowerCase()} for ${order.quantity} ${order.symbol}.`);
      },
      error: (error: { error?: { message?: string }; message?: string }) => {
        this.notice.set(error.error?.message ?? error.message ?? 'Order could not be placed.');
      }
    });
  }

  setOrderType(value: string): void {
    this.orderType.set(value === 'LIMIT' ? 'LIMIT' : 'MARKET');
  }

  updateQuantity(value: string): void {
    this.quantity.set(Number(value));
  }

  updateLimitPrice(value: string): void {
    this.limitPrice.set(Number(value));
  }

  setPage(page: TradingPage): void {
    this.activePage.set(page);
    this.notice.set('');
    if (page === 'home') {
      this.activeCategory.set('Ideas');
    }
  }

  selectCategory(category: string): void {
    this.activeCategory.set(category);
    if (category === 'Ideas') {
      this.activePage.set('home');
    } else if (category === 'Stocks') {
      this.activePage.set('watchlist');
    } else {
      this.activePage.set('catalogue');
    }
  }

  openShortcut(shortcut: string): void {
    this.activeTool.set(shortcut);
    this.activePage.set('tool');
  }

  updateSearch(value: string): void {
    this.searchTerm.set(value);
    if (value.trim()) {
      this.activePage.set('watchlist');
      this.activeCategory.set('Stocks');
    }
  }

  showWatchlist(): void {
    this.searchTerm.set('');
    this.selectCategory('Stocks');
  }

  signOut(): void {
    this.authService.endSession();
    void this.router.navigateByUrl('/login');
  }
}