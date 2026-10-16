package com.rukamini.trade.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.List;

@Configuration
public class CorsConfig {
    @Bean
        public SecurityFilterChain securityFilterChain(
                        HttpSecurity http,
                        @Value("${app.security.trade-api-enabled:true}") boolean tradeApiEnabled,
                        @Value("${app.api.base-path:/api}") String apiBasePath,
                        @Value("${app.market.websocket-path:/ws/market}") String websocketPath) throws Exception {

        http
                                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                                .httpBasic(AbstractHttpConfigurer::disable)
                                .formLogin(AbstractHttpConfigurer::disable)
                                .logout(AbstractHttpConfigurer::disable)
                                .authorizeHttpRequests(auth -> {
                                        auth.requestMatchers("/", "/error").permitAll();
                                        if (tradeApiEnabled) {
                                                auth.requestMatchers(apiBasePath + "/**", websocketPath).permitAll();
                                                auth.anyRequest().denyAll();
                                        } else {
                                                auth.requestMatchers(apiBasePath + "/public/**").permitAll();
                                                auth.anyRequest().authenticated();
                                        }
                                });

                if (!tradeApiEnabled) {
                        http.oauth2ResourceServer(oauth -> oauth.jwt(Customizer.withDefaults()));
                }

        return http.build();
    }

    @Bean
        public CorsConfigurationSource corsConfigurationSource(
                        @Value("${app.cors.allowed-origin:http://localhost:4200}") String allowedOrigin) {

        CorsConfiguration configuration = new CorsConfiguration();

                configuration.setAllowedOrigins(List.of(allowedOrigin));

        configuration.setAllowedMethods(
                List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        configuration.setAllowedHeaders(List.of("*"));

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
