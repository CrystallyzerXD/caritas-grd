package com.caritas.grd.controller;

import com.caritas.grd.dto.ApiResponse;
import com.caritas.grd.dto.person.AffectedPersonCreateDto;
import com.caritas.grd.dto.person.AffectedPersonDto;
import com.caritas.grd.service.AffectedPersonService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incidents/{incidentId}/affected-persons")
@RequiredArgsConstructor
public class AffectedPersonController {

    private final AffectedPersonService affectedPersonService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','GRD_SPECIALIST','BRIGADISTA','AUTHORIZED_USER')")
    public ResponseEntity<ApiResponse<List<AffectedPersonDto>>> getAll(
            @PathVariable Long incidentId) {
        return ResponseEntity.ok(ApiResponse.success(
                affectedPersonService.getByIncident(incidentId)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','GRD_SPECIALIST','BRIGADISTA')")
    public ResponseEntity<ApiResponse<AffectedPersonDto>> add(
            @PathVariable Long incidentId,
            @Valid @RequestBody AffectedPersonCreateDto dto) {
        AffectedPersonDto person = affectedPersonService.addPerson(incidentId, dto);
        return ResponseEntity.ok(ApiResponse.success("Person added successfully", person));
    }

    @PutMapping("/{personId}")
    @PreAuthorize("hasAnyRole('ADMIN','GRD_SPECIALIST')")
    public ResponseEntity<ApiResponse<AffectedPersonDto>> update(
            @PathVariable Long incidentId,
            @PathVariable Long personId,
            @RequestBody AffectedPersonCreateDto dto) {
        AffectedPersonDto person = affectedPersonService.updatePerson(incidentId, personId, dto);
        return ResponseEntity.ok(ApiResponse.success("Person updated successfully", person));
    }

    @DeleteMapping("/{personId}")
    @PreAuthorize("hasAnyRole('ADMIN','GRD_SPECIALIST')")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long incidentId,
            @PathVariable Long personId) {
        affectedPersonService.deletePerson(incidentId, personId);
        return ResponseEntity.ok(ApiResponse.success("Person removed successfully", null));
    }
}
