package com.caritas.grd.controller;

import com.caritas.grd.dto.ApiResponse;
import com.caritas.grd.dto.catalog.DistrictDto;
import com.caritas.grd.dto.catalog.EventTypeDto;
import com.caritas.grd.dto.catalog.ParishDto;
import com.caritas.grd.service.CatalogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/catalogs")
@RequiredArgsConstructor
public class CatalogController {

    private final CatalogService catalogService;

    // Event Types
    @GetMapping("/event-types")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<EventTypeDto>>> getEventTypes() {
        return ResponseEntity.ok(ApiResponse.success(catalogService.getEventTypes()));
    }

    @PostMapping("/event-types")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<EventTypeDto>> createEventType(
            @Valid @RequestBody EventTypeDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Event type created", catalogService.createEventType(dto)));
    }

    @PutMapping("/event-types/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<EventTypeDto>> updateEventType(
            @PathVariable Long id,
            @RequestBody EventTypeDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Event type updated", catalogService.updateEventType(id, dto)));
    }

    // Districts
    @GetMapping("/districts")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<DistrictDto>>> getDistricts() {
        return ResponseEntity.ok(ApiResponse.success(catalogService.getDistricts()));
    }

    @PostMapping("/districts")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DistrictDto>> createDistrict(
            @Valid @RequestBody DistrictDto dto) {
        return ResponseEntity.ok(ApiResponse.success("District created", catalogService.createDistrict(dto)));
    }

    // Parishes
    @GetMapping("/parishes")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<ParishDto>>> getParishes(
            @RequestParam(required = false) Long districtId) {
        return ResponseEntity.ok(ApiResponse.success(catalogService.getParishes(districtId)));
    }

    @PostMapping("/parishes")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ParishDto>> createParish(
            @Valid @RequestBody ParishDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Parish created", catalogService.createParish(dto)));
    }
}
