package com.caritas.grd.repository;

import com.caritas.grd.model.District;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DistrictRepository extends JpaRepository<District, Long> {

    List<District> findByActiveTrueOrderByName();

    boolean existsByName(String name);
}
