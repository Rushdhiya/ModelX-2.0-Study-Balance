package com.studybalance.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class DailyActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private java.time.LocalDate activityDate;

    private double sleepHours;
    private double studyHours;
    private int exerciseMinutes;
    private double screenTimeHours;
    private int wellbeingScore;

    public DailyActivity() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public double getSleepHours() {
        return sleepHours;
    }

    public void setSleepHours(double sleepHours) {
        this.sleepHours = sleepHours;
    }

    public double getStudyHours() {
        return studyHours;
    }

    public void setStudyHours(double studyHours) {
        this.studyHours = studyHours;
    }

    public int getExerciseMinutes() {
        return exerciseMinutes;
    }

    public void setExerciseMinutes(int exerciseMinutes) {
        this.exerciseMinutes = exerciseMinutes;
    }

    public double getScreenTimeHours() {
        return screenTimeHours;
    }

    public void setScreenTimeHours(double screenTimeHours) {
        this.screenTimeHours = screenTimeHours;
    }

    public int getWellbeingScore() {
        return wellbeingScore;
    }

    public void setWellbeingScore(int wellbeingScore) {
        this.wellbeingScore = wellbeingScore;
    }
    public java.time.LocalDate getActivityDate() {
    return activityDate;
}

public void setActivityDate(java.time.LocalDate activityDate) {
    this.activityDate = activityDate;
}
}
