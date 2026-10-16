import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MarketQuote {
  symbol: string;
  name: string;
  exchange: string;
  price: number;
  change: number;
  changePercent: number;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class MarketService {
  private readonly apiUrl = 'http://localhost:8080/api/market';

  constructor(private http: HttpClient) {}

  getMarketData(): Observable<MarketQuote[]> {
    return this.http.get<MarketQuote[]>(`${this.apiUrl}/quotes`);
  }
}
