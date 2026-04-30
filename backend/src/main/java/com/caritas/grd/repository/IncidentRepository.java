package com.caritas.grd.repository;

import com.caritas.grd.model.Incident;
import com.caritas.grd.model.IncidentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, Long> {

    @Query("SELECT i FROM Incident i " +
           "LEFT JOIN FETCH i.eventType " +
           "LEFT JOIN FETCH i.district " +
           "WHERE (:status IS NULL OR i.status = :status) " +
           "AND (:eventTypeId IS NULL OR i.eventType.id = :eventTypeId) " +
           "AND (:districtId IS NULL OR i.district.id = :districtId) " +
           "AND (:dateFrom IS NULL OR i.incidentDate >= :dateFrom) " +
           "AND (:dateTo IS NULL OR i.incidentDate <= :dateTo) " +
           "AND (:createdById IS NULL OR i.createdBy.id = :createdById)")
    Page<Incident> findWithFilters(
            @Param("status") IncidentStatus status,
            @Param("eventTypeId") Long eventTypeId,
            @Param("districtId") Long districtId,
            @Param("dateFrom") LocalDate dateFrom,
            @Param("dateTo") LocalDate dateTo,
            @Param("createdById") Long createdById,
            Pageable pageable);

    @Query("SELECT COUNT(i) FROM Incident i WHERE i.status = :status")
    Long countByStatus(@Param("status") IncidentStatus status);

    @Query("SELECT i.eventType.name, COUNT(i) FROM Incident i GROUP BY i.eventType.name")
    List<Object[]> countByEventType();

    @Query("SELECT i.district.name, COUNT(i) FROM Incident i WHERE i.district IS NOT NULL GROUP BY i.district.name ORDER BY COUNT(i) DESC")
    List<Object[]> countByDistrict();

    @Query("SELECT i FROM Incident i LEFT JOIN FETCH i.eventType LEFT JOIN FETCH i.district " +
           "LEFT JOIN FETCH i.createdBy WHERE i.id = :id")
    java.util.Optional<Incident> findByIdWithDetails(@Param("id") Long id);

    @Query("SELECT i FROM Incident i LEFT JOIN FETCH i.eventType LEFT JOIN FETCH i.district " +
           "LEFT JOIN FETCH i.createdBy")
    List<Incident> findAllForReport();
}
