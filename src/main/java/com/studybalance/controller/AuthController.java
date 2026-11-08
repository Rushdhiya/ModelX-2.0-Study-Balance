
package com.studybalance.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.studybalance.model.User;
import com.studybalance.repository.UserRepository;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;

    private final BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Register a new user
    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody RegisterRequest request) {

        if (request.fullName() == null ||
            request.fullName().isBlank() ||
            request.email() == null ||
            request.email().isBlank() ||
            request.password() == null ||
            request.password().length() < 8) {

            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "Invalid registration details"
                    ));
        }

        String email = request.email().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "Email already registered"
                    ));
        }

        User user = new User();
        user.setFullName(request.fullName().trim());
        user.setEmail(email);
        user.setPasswordHash(
                passwordEncoder.encode(request.password())
        );

        userRepository.save(user);

        return ResponseEntity.ok(
                Map.of("message", "Registration successful")
        );
    }

    public record RegisterRequest(
            String fullName,
            String email,
            String password
    ) {}

    // Login and create an authenticated session
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {

        if (request.email() == null ||
            request.password() == null) {

            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "Email and password required"
                    ));
        }

        String email = request.email().trim().toLowerCase();

        return userRepository.findByEmail(email)
                .filter(user -> passwordEncoder.matches(
                        request.password(),
                        user.getPasswordHash()
                ))
                .<ResponseEntity<?>>map(user -> {

                    var authentication =
                            new UsernamePasswordAuthenticationToken(
                                    user.getEmail(),
                                    null,
                                    List.of(
                                            new SimpleGrantedAuthority(
                                                    "ROLE_USER"
                                            )
                                    )
                            );

                    SecurityContext context =
                            SecurityContextHolder.createEmptyContext();

                    context.setAuthentication(authentication);
                    SecurityContextHolder.setContext(context);

                    var repository =
                            new HttpSessionSecurityContextRepository();

                    // Prevent session fixation:
                    // rotate the session ID after successful login
                    if (httpRequest.getSession(false) != null) {
                        httpRequest.changeSessionId();
                    } else {
                        httpRequest.getSession(true);
                    }

                    repository.saveContext(
                            context,
                            httpRequest,
                            httpResponse
                    );

                    return ResponseEntity.ok(Map.of(
                            "message", "Login successful",
                            "fullName", user.getFullName()
                    ));
                })
                .orElseGet(() ->
                        ResponseEntity.status(401)
                                .body(Map.of(
                                        "message",
                                        "Invalid email or password"
                                ))
                );
    }

    public record LoginRequest(
            String email,
            String password
    ) {}

    // Logout and invalidate the session
    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            HttpServletRequest request) {

        var session = request.getSession(false);

        if (session != null) {
            session.invalidate();
        }

        SecurityContextHolder.clearContext();

        return ResponseEntity.ok(
                Map.of("message", "Logout successful")
        );
    }
}
