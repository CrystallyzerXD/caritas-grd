package com.caritas.grd.repository;

import com.caritas.grd.model.EventType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventTypeRepository extends JpaRepository<EventType, Long> {

    List<EventType> findByActiveTrue();

    Optional<EventType> findByName(String name);

    boolean existsByName(String name);
}
