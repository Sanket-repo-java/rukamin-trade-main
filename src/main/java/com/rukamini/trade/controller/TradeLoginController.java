package com.rukamini.trade.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.servlet.view.RedirectView;

@Controller
public class TradeLoginController {

    private final String frontendUrl;

    public TradeLoginController(@Value("${app.frontend-url}") String frontendUrl) {
        this.frontendUrl = frontendUrl;
    }

    @GetMapping("/")
    public RedirectView home() {
        return new RedirectView(frontendUrl);
    }
}