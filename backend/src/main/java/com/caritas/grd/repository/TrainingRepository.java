package com.caritas.grd.repository;

import com.caritas.grd.model.Training;
import com.caritas.grd.model.TrainingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TrainingRepository extends JpaRepository<Training, Long> {

    @Query("SELECT t FROM Training t LEFT JOIN FETCH t.parish LEFT JOIN FETCH t.responsible " +
           "WHERE (:status IS NULL OR t.status = :status) " +
           "AND (:parishId IS NULL OR t.parish.id = :parishId)")
    Page<Training> findWithFilters(
            @Param("status") TrainingStatus status,
            @Param("parishId") Long parishId,
            Pageable pageable);

    @Query("SELECT COUNT(t) FROM Training t WHERE t.status = :status")
    Long countByStatus(@Param("status") TrainingStatus status);

    boolean existsByTrainingCode(String trainingCode);

    @Query("SELECT MAX(t.id) FROM Training t")
    Long findMaxId();
}
