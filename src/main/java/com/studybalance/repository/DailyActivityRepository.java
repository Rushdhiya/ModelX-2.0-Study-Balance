
package com.studybalance.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.studybalance.model.DailyActivity;

public interface DailyActivityRepository
        extends JpaRepository<DailyActivity, Long> {

    // Get only the logged-in user's activities
    List<DailyActivity> findByUserId(Long userId);

    // Find a specific activity owned by the user
    Optional<DailyActivity> findByIdAndUserId(
            Long id,
            Long userId
    );
}
