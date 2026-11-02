package studyBalance.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import studyBalance.model.DailyActivity;

public interface DailyActivityRepository extends JpaRepository<DailyActivity, Long> {

}