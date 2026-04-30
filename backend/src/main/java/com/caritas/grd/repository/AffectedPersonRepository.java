package com.caritas.grd.repository;

import com.caritas.grd.model.AffectedPerson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AffectedPersonRepository extends JpaRepository<AffectedPerson, Long> {

    List<AffectedPerson> findByIncidentId(Long incidentId);

    Optional<AffectedPerson> findByIdAndIncidentId(Long id, Long incidentId);

    @Query("SELECT ap FROM AffectedPerson ap LEFT JOIN FETCH ap.incident i LEFT JOIN FETCH i.eventType LEFT JOIN FETCH i.district")
    List<AffectedPerson> findAllForReport();

    Long countByIncidentId(Long incidentId);
}
