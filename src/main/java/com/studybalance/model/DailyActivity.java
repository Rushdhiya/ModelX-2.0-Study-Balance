
package com.studybalance.model;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
public class DailyActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate activityDate;

    private double sleepHours;
    private double studyHours;
    private int exerciseMinutes;
    private double screenTimeHours;
    private int wellbeingScore;

    // Each daily activity belongs to one user
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
@JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    public DailyActivity() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getActivityDate() {
        return activityDate;
    }

    public void setActivityDate(LocalDate activityDate) {
        this.activityDate = activityDate;
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

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
