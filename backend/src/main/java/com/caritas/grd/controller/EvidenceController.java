package com.caritas.grd.controller;

import com.caritas.grd.dto.ApiResponse;
import com.caritas.grd.dto.evidence.EvidenceDto;
import com.caritas.grd.service.EvidenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/incidents/{incidentId}/evidences")
@RequiredArgsConstructor
public class EvidenceController {

    private final EvidenceService evidenceService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','GRD_SPECIALIST','BRIGADISTA','AUTHORIZED_USER')")
    public ResponseEntity<ApiResponse<List<EvidenceDto>>> getAll(
            @PathVariable Long incidentId) {
        return ResponseEntity.ok(ApiResponse.success(
                evidenceService.getByIncident(incidentId)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','GRD_SPECIALIST','BRIGADISTA')")
    public ResponseEntity<ApiResponse<EvidenceDto>> upload(
            @PathVariable Long incidentId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "description", required = false) String description,
            Principal principal) {
        EvidenceDto evidence = evidenceService.uploadEvidence(
                incidentId, file, description, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Evidence uploaded successfully", evidence));
    }

    @DeleteMapping("/{evidenceId}")
    @PreAuthorize("hasAnyRole('ADMIN','GRD_SPECIALIST')")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long incidentId,
            @PathVariable Long evidenceId) {
        evidenceService.deleteEvidence(incidentId, evidenceId);
        return ResponseEntity.ok(ApiResponse.success("Evidence deleted successfully", null));
    }
}
