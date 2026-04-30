package com.caritas.grd.controller;

import com.caritas.grd.dto.ApiResponse;
import com.caritas.grd.dto.environmental.EnvironmentalCreateDto;
import com.caritas.grd.dto.environmental.EnvironmentalFilterDto;
import com.caritas.grd.dto.environmental.EnvironmentalInitiativeDto;
import com.caritas.grd.model.InitiativeStatus;
import com.caritas.grd.service.EnvironmentalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/environmental")
@RequiredArgsConstructor
public class EnvironmentalController {

    private final EnvironmentalService environmentalService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','GRD_SPECIALIST','BRIGADISTA','AUTHORIZED_USER')")
    public ResponseEntity<ApiResponse<Page<EnvironmentalInitiativeDto>>> getAll(
            @RequestParam(required = false) InitiativeStatus status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Long districtId,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        EnvironmentalFilterDto filter = new EnvironmentalFilterDto();
        filter.setStatus(status);
        filter.setCategory(category);
        filter.setDistrictId(districtId);
        filter.setSearch(search);
        filter.setPage(page);
        filter.setSize(size);
        filter.setSortBy(sortBy);
        filter.setSortDir(sortDir);

        Page<EnvironmentalInitiativeDto> initiatives = environmentalService.getInitiatives(filter);
        return ResponseEntity.ok(ApiResponse.success(initiatives));
    }

    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('ADMIN','GRD_SPECIALIST','BRIGADISTA','AUTHORIZED_USER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStatistics() {
        return ResponseEntity.ok(ApiResponse.success(environmentalService.getStatistics()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','GRD_SPECIALIST','BRIGADISTA','AUTHORIZED_USER')")
    public ResponseEntity<ApiResponse<EnvironmentalInitiativeDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(environmentalService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','GRD_SPECIALIST')")
    public ResponseEntity<ApiResponse<EnvironmentalInitiativeDto>> create(
            @Valid @RequestBody EnvironmentalCreateDto dto,
            Principal principal) {
        EnvironmentalInitiativeDto initiative = environmentalService.create(dto, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Initiative created successfully", initiative));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','GRD_SPECIALIST')")
    public ResponseEntity<ApiResponse<EnvironmentalInitiativeDto>> update(
            @PathVariable Long id,
            @RequestBody EnvironmentalCreateDto dto,
            Principal principal) {
        EnvironmentalInitiativeDto initiative = environmentalService.update(id, dto, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Initiative updated successfully", initiative));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','GRD_SPECIALIST')")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long id,
            Principal principal) {
        environmentalService.delete(id, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Initiative deleted successfully", null));
    }
}
