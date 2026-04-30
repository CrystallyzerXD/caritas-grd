package com.caritas.grd.repository;

import com.caritas.grd.model.EnvironmentalInitiative;
import com.caritas.grd.model.InitiativeStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EnvironmentalInitiativeRepository
        extends JpaRepository<EnvironmentalInitiative, Long>,
                JpaSpecificationExecutor<EnvironmentalInitiative> {

    @Query("SELECT COUNT(e) FROM EnvironmentalInitiative e WHERE e.status = :status")
    Long countByStatus(@Param("status") InitiativeStatus status);

    @Query("SELECT e.category, COUNT(e) FROM EnvironmentalInitiative e WHERE e.category IS NOT NULL GROUP BY e.category")
    List<Object[]> countByCategory();

    @Query("SELECT e FROM EnvironmentalInitiative e LEFT JOIN FETCH e.district LEFT JOIN FETCH e.createdBy")
    List<EnvironmentalInitiative> findAllForReport();
}
