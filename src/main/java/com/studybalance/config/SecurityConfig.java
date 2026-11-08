
package com.studybalance.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        http
            // CSRF protection enabled for POST, PUT and DELETE.
            .csrf(csrf -> {})

            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/login.html",
                    "/register.html",
                    "/api/auth/login",
                    "/api/auth/register",
                    "/api/csrf",
                    "/css/**",
                    "/js/**",
                    "/images/**"
                ).permitAll()
                .anyRequest().authenticated()
            )

            // Custom login is handled by AuthController
            .formLogin(form -> form.disable())

            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(
                    (request, response, exception) ->
                        response.sendRedirect("/login.html")
                )
            )

            // Spring Security's built-in logout endpoint
            .logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessUrl("/login.html")
                .invalidateHttpSession(true)
                .clearAuthentication(true)
                .deleteCookies("JSESSIONID")
            );

        return http.build();
    }
}
