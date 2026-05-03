package com.caritas.grd.repository;

import com.caritas.grd.model.AffectedFamily;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AffectedFamilyRepository extends JpaRepository<AffectedFamily, Long> {

    List<AffectedFamily> findByIncidentIdOrderByCreatedAtAsc(Long incidentId);

    Optional<AffectedFamily> findByIdAndIncidentId(Long id, Long incidentId);
}
