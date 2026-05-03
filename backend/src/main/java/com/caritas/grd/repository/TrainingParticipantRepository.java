package com.caritas.grd.repository;

import com.caritas.grd.model.CertificationStatus;
import com.caritas.grd.model.TrainingParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TrainingParticipantRepository extends JpaRepository<TrainingParticipant, Long> {
    List<TrainingParticipant> findByTrainingId(Long trainingId);
    void deleteByTrainingId(Long trainingId);
    long countByTrainingId(Long trainingId);
    long countByCertificationStatus(CertificationStatus certificationStatus);
}
