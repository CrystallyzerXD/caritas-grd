package com.caritas.grd.repository;

import com.caritas.grd.model.Evidence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EvidenceRepository extends JpaRepository<Evidence, Long> {

    List<Evidence> findByIncidentId(Long incidentId);

    Optional<Evidence> findByIdAndIncidentId(Long id, Long incidentId);
}
