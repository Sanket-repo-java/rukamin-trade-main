import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface OrderRequest {
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  orderType: 'MARKET' | 'LIMIT';
  price: number;
}

export interface TradeOrder extends OrderRequest {
  id: string;
  status: 'COMPLETE' | 'OPEN';
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly apiUrl = 'http://localhost:8080/api/orders';

  constructor(private http: HttpClient) {}

  getOrders(): Observable<TradeOrder[]> {
    return this.http.get<TradeOrder[]>(this.apiUrl);
  }

  placeOrder(order: OrderRequest): Observable<TradeOrder> {
    return this.http.post<TradeOrder>(this.apiUrl, order);
  }
}
