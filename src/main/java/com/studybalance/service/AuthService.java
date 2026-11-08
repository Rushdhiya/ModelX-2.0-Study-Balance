
package com.studybalance.service;

import com.studybalance.entity.User;
import com.studybalance.repository.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // Constructor
    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Register a new user
    public User register(
            String fullName,
            String email,
            String password) {

        // Check whether email already exists
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException(
                "Email is already registered."
            );
        }

        // Create a new user
        User user = new User();

        user.setFullName(fullName);
        user.setEmail(email);

        // Hash the password before saving
        user.setPassword(
            passwordEncoder.encode(password)
        );

        // Save user in MySQL
        return userRepository.save(user);
    }

    
    // Login an existing user
    public User login(String email, String password) {

        // Find user by email
        User user = userRepository.findByEmail(email)
            .orElseThrow(() ->
                new RuntimeException("Invalid email or password.")
            );

        // Check the entered password
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid email or password.");
        }

        // Return authenticated user
        return user;
    }

}

