package com.caritas.grd.controller;

import com.caritas.grd.dto.ApiResponse;
import com.caritas.grd.dto.incident.*;
import com.caritas.grd.dto.report.IncidentStatsDto;
import com.caritas.grd.model.IncidentStatus;
import com.caritas.grd.service.IncidentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/incidents")
@RequiredArgsConstructor
public class IncidentController {

    private final IncidentService incidentService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','GRD_SPECIALIST','BRIGADISTA','AUTHORIZED_USER')")
    public ResponseEntity<ApiResponse<Page<IncidentDto>>> getAll(
            @RequestParam(required = false) IncidentStatus status,
            @RequestParam(required = false) Long eventTypeId,
            @RequestParam(required = false) Long districtId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(required = false) Long createdById,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        IncidentFilterDto filter = new IncidentFilterDto();
        filter.setStatus(status);
        filter.setEventTypeId(eventTypeId);
        filter.setDistrictId(districtId);
        filter.setDateFrom(dateFrom);
        filter.setDateTo(dateTo);
        filter.setCreatedById(createdById);
        filter.setPage(page);
        filter.setSize(size);
        filter.setSortBy(sortBy);
        filter.setSortDir(sortDir);

        Page<IncidentDto> incidents = incidentService.getIncidents(filter);
        return ResponseEntity.ok(ApiResponse.success(incidents));
    }

    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('ADMIN','GRD_SPECIALIST','AUTHORIZED_USER')")
    public ResponseEntity<ApiResponse<IncidentStatsDto>> getStatistics() {
        return ResponseEntity.ok(ApiResponse.success(incidentService.getStatistics()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','GRD_SPECIALIST','BRIGADISTA','AUTHORIZED_USER')")
    public ResponseEntity<ApiResponse<IncidentDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(incidentService.getIncidentById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','GRD_SPECIALIST','BRIGADISTA')")
    public ResponseEntity<ApiResponse<IncidentDto>> create(
            @Valid @RequestBody IncidentCreateDto dto,
            Principal principal) {
        IncidentDto incident = incidentService.createIncident(dto, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Incident created successfully", incident));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','GRD_SPECIALIST')")
    public ResponseEntity<ApiResponse<IncidentDto>> update(
            @PathVariable Long id,
            @RequestBody IncidentUpdateDto dto,
            Principal principal) {
        IncidentDto incident = incidentService.updateIncident(id, dto, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Incident updated successfully", incident));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long id,
            Principal principal) {
        incidentService.deleteIncident(id, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Incident deleted successfully", null));
    }
}
