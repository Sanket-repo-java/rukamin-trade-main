import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { MarketQuote } from './market.service';

export type MarketConnectionState = 'connecting' | 'live' | 'disconnected';

@Injectable({ providedIn: 'root' })
export class WebsocketService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly quoteSubject = new Subject<MarketQuote>();
  private readonly stateSubject = new BehaviorSubject<MarketConnectionState>('disconnected');
  private socket?: WebSocket;
  private reconnectTimer?: ReturnType<typeof setTimeout>;

  readonly quotes$ = this.quoteSubject.asObservable();
  readonly state$ = this.stateSubject.asObservable();

  connect(): void {
    if (!isPlatformBrowser(this.platformId) || this.socket) {
      return;
    }

    this.stateSubject.next('connecting');
    this.socket = new WebSocket('ws://localhost:8080/ws/market');
    this.socket.onopen = () => this.stateSubject.next('live');
    this.socket.onmessage = (event: MessageEvent<string>) => {
      try {
        this.quoteSubject.next(JSON.parse(event.data) as MarketQuote);
      } catch {
        this.stateSubject.next('disconnected');
      }
    };
    this.socket.onclose = () => {
      this.socket = undefined;
      this.stateSubject.next('disconnected');
      this.reconnectTimer = setTimeout(() => this.connect(), 1500);
    };
    this.socket.onerror = () => this.socket?.close();
  }
}
