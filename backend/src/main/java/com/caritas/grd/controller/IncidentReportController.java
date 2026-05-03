package com.caritas.grd.controller;

import com.caritas.grd.dto.ApiResponse;
import com.caritas.grd.dto.report.IncidentReportCreateDto;
import com.caritas.grd.dto.report.IncidentReportDto;
import com.caritas.grd.service.IncidentReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/incidents/{incidentId}/reports")
@RequiredArgsConstructor
public class IncidentReportController {

    private final IncidentReportService reportService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','GRD_SPECIALIST','JEFA_OGP','BRIGADISTA','AUTHORIZED_USER')")
    public ResponseEntity<ApiResponse<List<IncidentReportDto>>> getAll(@PathVariable Long incidentId) {
        return ResponseEntity.ok(ApiResponse.success(reportService.getByIncident(incidentId)));
    }

    @GetMapping("/{reportId}")
    @PreAuthorize("hasAnyRole('ADMIN','GRD_SPECIALIST','JEFA_OGP','AUTHORIZED_USER')")
    public ResponseEntity<ApiResponse<IncidentReportDto>> getById(
            @PathVariable Long incidentId, @PathVariable Long reportId) {
        return ResponseEntity.ok(ApiResponse.success(reportService.getById(reportId)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','GRD_SPECIALIST','JEFA_OGP')")
    public ResponseEntity<ApiResponse<IncidentReportDto>> create(
            @PathVariable Long incidentId,
            @Valid @RequestBody IncidentReportCreateDto dto,
            Principal principal) {
        return ResponseEntity.ok(ApiResponse.success("Report created", reportService.create(incidentId, dto, principal.getName())));
    }

    @DeleteMapping("/{reportId}")
    @PreAuthorize("hasAnyRole('ADMIN','GRD_SPECIALIST')")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long incidentId, @PathVariable Long reportId) {
        reportService.delete(reportId);
        return ResponseEntity.ok(ApiResponse.success("Report deleted", null));
    }
}
