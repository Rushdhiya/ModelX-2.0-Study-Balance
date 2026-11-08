
package com.studybalance.controller;

import com.studybalance.entity.User;
import com.studybalance.repository.UserRepository;
import com.studybalance.service.AuthService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final SecurityContextRepository securityContextRepository;

    public AuthController(
            AuthService authService,
            UserRepository userRepository,
            AuthenticationManager authenticationManager,
            SecurityContextRepository securityContextRepository) {

        this.authService = authService;
        this.userRepository = userRepository;
        this.authenticationManager = authenticationManager;
        this.securityContextRepository = securityContextRepository;
    }

    // Register a new user
    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody Map<String, String> request) {

        try {
            String fullName = request.get("fullName");
            String email = request.get("email");
            String password = request.get("password");
            String confirmPassword = request.get("confirmPassword");

            if (fullName == null || fullName.isBlank()
                    || email == null || email.isBlank()
                    || password == null || password.length() < 8) {

                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "message",
                                "Please provide valid registration details."
                        ));
            }

            if (!password.equals(confirmPassword)) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Passwords do not match."));
            }

            User user = authService.register(
                    fullName.trim(),
                    email.trim().toLowerCase(),
                    password
            );

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of(
                            "message", "Account created successfully!",
                            "userId", user.getId()
                    ));

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // Login an existing user
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody Map<String, String> request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {

        String email = request.get("email");
        String password = request.get("password");

        if (email == null || email.isBlank()
                || password == null || password.isBlank()) {

            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "Please enter your email and password."
                    ));
        }

        try {
            email = email.trim().toLowerCase();

            Authentication authentication =
                    authenticationManager.authenticate(
                            new UsernamePasswordAuthenticationToken(
                                    email,
                                    password
                            )
                    );

            SecurityContext context =
                    SecurityContextHolder.createEmptyContext();

            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);

            securityContextRepository.saveContext(
                    context,
                    httpRequest,
                    httpResponse
            );

            User user = userRepository.findByEmail(email)
                    .orElseThrow(() ->
                            new RuntimeException("User not found.")
                    );

            return ResponseEntity.ok()
                    .body(Map.of(
                            "message", "Login successful!",
                            "userId", user.getId(),
                            "fullName", user.getFullName(),
                            "email", user.getEmail()
                    ));

        } catch (AuthenticationException e) {

            SecurityContextHolder.clearContext();

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "message",
                            "Invalid email or password."
                    ));
        }
    }
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(
            org.springframework.security.core.Authentication authentication) {

        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Not logged in"));
        }

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(Map.of(
            "userId", user.getId(),
            "fullName", user.getFullName(),
            "email", user.getEmail()
        ));
    }

    // Logout the current user
@PostMapping("/logout")
public ResponseEntity<?> logout(
        HttpServletRequest request,
        HttpServletResponse response) {

    SecurityContextHolder.clearContext();

    request.getSession(false);

    return ResponseEntity.ok(
            Map.of("message", "Logout successful!")
    );
}
}