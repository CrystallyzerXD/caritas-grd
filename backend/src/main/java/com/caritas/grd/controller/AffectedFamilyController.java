package com.caritas.grd.controller;

import com.caritas.grd.dto.ApiResponse;
import com.caritas.grd.dto.family.AffectedFamilyCreateDto;
import com.caritas.grd.dto.family.AffectedFamilyDto;
import com.caritas.grd.dto.person.AffectedPersonCreateDto;
import com.caritas.grd.dto.person.AffectedPersonDto;
import com.caritas.grd.service.AffectedFamilyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incidents/{incidentId}/families")
@RequiredArgsConstructor
public class AffectedFamilyController {

    private final AffectedFamilyService familyService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','GRD_SPECIALIST','BRIGADISTA','AUTHORIZED_USER','COMITE_DONACIONES')")
    public ResponseEntity<ApiResponse<List<AffectedFamilyDto>>> getAll(
            @PathVariable Long incidentId) {
        return ResponseEntity.ok(ApiResponse.success(familyService.getByIncident(incidentId)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','GRD_SPECIALIST','BRIGADISTA')")
    public ResponseEntity<ApiResponse<AffectedFamilyDto>> create(
            @PathVariable Long incidentId,
            @Valid @RequestBody AffectedFamilyCreateDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Family created", familyService.createFamily(incidentId, dto)));
    }

    @DeleteMapping("/{familyId}")
    @PreAuthorize("hasAnyRole('ADMIN','GRD_SPECIALIST')")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long incidentId,
            @PathVariable Long familyId) {
        familyService.deleteFamily(incidentId, familyId);
        return ResponseEntity.ok(ApiResponse.success("Family deleted", null));
    }

    // ── Members ──────────────────────────────────────────────────────────────

    @PostMapping("/{familyId}/members")
    @PreAuthorize("hasAnyRole('ADMIN','GRD_SPECIALIST','BRIGADISTA')")
    public ResponseEntity<ApiResponse<AffectedPersonDto>> addMember(
            @PathVariable Long incidentId,
            @PathVariable Long familyId,
            @Valid @RequestBody AffectedPersonCreateDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Member added", familyService.addMember(incidentId, familyId, dto)));
    }

    @DeleteMapping("/{familyId}/members/{personId}")
    @PreAuthorize("hasAnyRole('ADMIN','GRD_SPECIALIST')")
    public ResponseEntity<ApiResponse<Void>> removeMember(
            @PathVariable Long incidentId,
            @PathVariable Long familyId,
            @PathVariable Long personId) {
        familyService.removeMember(incidentId, familyId, personId);
        return ResponseEntity.ok(ApiResponse.success("Member removed", null));
    }
}
