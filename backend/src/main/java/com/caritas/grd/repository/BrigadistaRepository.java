package com.caritas.grd.repository;

import com.caritas.grd.model.Brigadista;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface BrigadistaRepository extends JpaRepository<Brigadista, Long>, JpaSpecificationExecutor<Brigadista> {

    Page<Brigadista> findByActiveTrue(Pageable pageable);

    List<Brigadista> findByAvailableTrueAndActiveTrue();

    long countByActiveTrue();

    long countByAvailableTrueAndActiveTrue();

    @Query("SELECT b FROM Brigadista b WHERE b.active = true AND b.available = true " +
           "ORDER BY (6371 * acos(cos(radians(:lat)) * cos(radians(b.latitude)) * " +
           "cos(radians(b.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(b.latitude))))")
    List<Brigadista> findNearestAvailable(double lat, double lng, Pageable pageable);
}
