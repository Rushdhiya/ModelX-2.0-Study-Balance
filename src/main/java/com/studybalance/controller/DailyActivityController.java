package com.studybalance.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.studybalance.model.DailyActivity;
import com.studybalance.repository.DailyActivityRepository;

@RestController
@RequestMapping("/api/activities")
public class DailyActivityController {

    private final DailyActivityRepository repository;

    public DailyActivityController(DailyActivityRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public DailyActivity saveActivity(@RequestBody DailyActivity activity) {
        return repository.save(activity);
    }

    @GetMapping
     public java.util.List<DailyActivity> getAllActivities() {
     return repository.findAll();
     }

     @GetMapping("/weekly")
public java.util.Map<String, Object> getWeeklyReport() {

    java.time.LocalDate today = java.time.LocalDate.now();
    java.time.LocalDate startDate = today.minusDays(6);

    java.util.List<DailyActivity> activities = repository.findAll()
        .stream()
        .filter(a -> a.getActivityDate() != null)
        .filter(a -> !a.getActivityDate().isBefore(startDate)
                  && !a.getActivityDate().isAfter(today))
        .toList();

    java.util.Map<String, Object> report = new java.util.HashMap<>();

    report.put("totalEntries", activities.size());

    report.put("averageSleep", activities.stream()
        .mapToDouble(DailyActivity::getSleepHours)
        .average().orElse(0));

    report.put("averageStudy", activities.stream()
        .mapToDouble(DailyActivity::getStudyHours)
        .average().orElse(0));

    report.put("averageExercise", activities.stream()
        .mapToInt(DailyActivity::getExerciseMinutes)
        .average().orElse(0));

    report.put("averageScreenTime", activities.stream()
        .mapToDouble(DailyActivity::getScreenTimeHours)
        .average().orElse(0));

    report.put("averageWellbeing", activities.stream()
        .mapToInt(DailyActivity::getWellbeingScore)
        .average().orElse(0));

    return report;
}
}
