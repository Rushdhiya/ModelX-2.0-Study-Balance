package com.studybalance.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.studybalance.model.DailyActivity;

public interface DailyActivityRepository extends JpaRepository<DailyActivity, Long> {

}
