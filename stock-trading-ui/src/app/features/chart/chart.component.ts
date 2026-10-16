declare const TradingView: any;
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-trading-dashboard',
  template: '...'
})
export class TradingDashboardComponent implements OnInit {
  ngOnInit() {

    new TradingView.widget({
      autosize: true,
      symbol: "NSE:RELIANCE",
      interval: "5",
      timezone: "Asia/Kolkata",
      theme: "dark",
      style: "1",
      locale: "en",
      container_id: "tradingview_chart"
    });
  }
}
