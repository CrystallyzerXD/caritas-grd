package com.caritas.grd.repository;

import com.caritas.grd.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmailAndActiveTrue(String email);

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByDni(String dni);

    @Query("SELECT u FROM User u WHERE u.active = true " +
           "AND (:search IS NULL OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<User> findAllActiveWithSearch(@Param("search") String search, Pageable pageable);

    Page<User> findByActiveTrue(Pageable pageable);
}
