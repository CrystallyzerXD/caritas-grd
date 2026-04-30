package com.caritas.grd.repository;

import com.caritas.grd.model.Parish;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ParishRepository extends JpaRepository<Parish, Long> {

    List<Parish> findByActiveTrueOrderByName();

    List<Parish> findByDistrictIdAndActiveTrue(Long districtId);
}
