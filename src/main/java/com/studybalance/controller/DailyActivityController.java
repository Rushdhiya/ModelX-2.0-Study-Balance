
package com.studybalance.controller;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import com.studybalance.model.DailyActivity;
import com.studybalance.model.User;
import com.studybalance.repository.DailyActivityRepository;
import com.studybalance.repository.UserRepository;

@RestController
@RequestMapping("/api/activities")
public class DailyActivityController {

    private final DailyActivityRepository repository;
    private final UserRepository userRepository;

    public DailyActivityController(
            DailyActivityRepository repository,
            UserRepository userRepository) {

        this.repository = repository;
        this.userRepository = userRepository;
    }

    // Get the currently logged-in user
    private User getCurrentUser(Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Login required"
            );
        }

        return userRepository
                .findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.UNAUTHORIZED,
                                "User not found"
                        )
                );
    }

    // Validate activity date
    private void validateActivityDate(DailyActivity activity) {

        if (activity.getActivityDate() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Activity date is required"
            );
        }
    }

    // Save an entry for the logged-in user
    @PostMapping
    public DailyActivity saveActivity(
            @RequestBody DailyActivity activity,
            Authentication authentication) {

        User user = getCurrentUser(authentication);

        validateActivityDate(activity);

        // Prevent client from choosing ID or owner
        activity.setId(null);
        activity.setUser(user);

        return repository.save(activity);
    }

    // Show only the logged-in user's history
    @GetMapping
    public List<DailyActivity> getAllActivities(
            Authentication authentication) {

        User user = getCurrentUser(authentication);

        return repository.findByUserId(user.getId());
    }

    // Update only an entry owned by the logged-in user
    @PutMapping("/{id}")
    public ResponseEntity<DailyActivity> updateActivity(
            @PathVariable Long id,
            @RequestBody DailyActivity updatedActivity,
            Authentication authentication) {

        User user = getCurrentUser(authentication);

        validateActivityDate(updatedActivity);

        return repository
                .findByIdAndUserId(id, user.getId())
                .map(activity -> {

                    activity.setActivityDate(
                            updatedActivity.getActivityDate()
                    );

                    activity.setStudyHours(
                            updatedActivity.getStudyHours()
                    );

                    activity.setSleepHours(
                            updatedActivity.getSleepHours()
                    );

                    activity.setExerciseMinutes(
                            updatedActivity.getExerciseMinutes()
                    );

                    activity.setScreenTimeHours(
                            updatedActivity.getScreenTimeHours()
                    );

                    activity.setWellbeingScore(
                            updatedActivity.getWellbeingScore()
                    );

                    DailyActivity saved = repository.save(activity);

                    return ResponseEntity.ok(saved);
                })
                .orElseGet(() ->
                        ResponseEntity
                                .<DailyActivity>notFound()
                                .build()
                );
    }

    // Delete only an entry owned by the logged-in user
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteActivity(
            @PathVariable Long id,
            Authentication authentication) {

        User user = getCurrentUser(authentication);

        var activity = repository.findByIdAndUserId(
                id,
                user.getId()
        );

        if (activity.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        repository.delete(activity.get());

        return ResponseEntity.noContent().build();
    }

    // Weekly insights for the logged-in user only
    @GetMapping("/weekly")
    public Map<String, Object> getWeeklyReport(
            Authentication authentication) {

        User user = getCurrentUser(authentication);

        LocalDate today = LocalDate.now();
        LocalDate startDate = today.minusDays(6);

        List<DailyActivity> activities =
                repository.findByUserId(user.getId())
                        .stream()
                        .filter(a ->
                                a.getActivityDate() != null
                        )
                        .filter(a ->
                                !a.getActivityDate().isBefore(startDate)
                                && !a.getActivityDate().isAfter(today)
                        )
                        .toList();

        Map<String, Object> report = new HashMap<>();

        report.put("totalEntries", activities.size());

        report.put("averageSleep",
                activities.stream()
                        .mapToDouble(DailyActivity::getSleepHours)
                        .average()
                        .orElse(0));

        report.put("averageStudy",
                activities.stream()
                        .mapToDouble(DailyActivity::getStudyHours)
                        .average()
                        .orElse(0));

        report.put("averageExercise",
                activities.stream()
                        .mapToInt(DailyActivity::getExerciseMinutes)
                        .average()
                        .orElse(0));

        report.put("averageScreenTime",
                activities.stream()
                        .mapToDouble(DailyActivity::getScreenTimeHours)
                        .average()
                        .orElse(0));

        report.put("averageWellbeing",
                activities.stream()
                        .mapToInt(DailyActivity::getWellbeingScore)
                        .average()
                        .orElse(0));

        return report;
    }
}
