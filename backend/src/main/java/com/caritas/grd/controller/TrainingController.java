package com.caritas.grd.controller;

import com.caritas.grd.dto.ApiResponse;
import com.caritas.grd.dto.training.*;
import com.caritas.grd.model.TrainingStatus;
import com.caritas.grd.service.TrainingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trainings")
@RequiredArgsConstructor
public class TrainingController {

    private final TrainingService trainingService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','GRD_SPECIALIST','JEFA_OGP','AUTHORIZED_USER')")
    public ResponseEntity<ApiResponse<Page<TrainingDto>>> getAll(
            @RequestParam(required = false) TrainingStatus status,
            @RequestParam(required = false) Long parishId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(trainingService.getTrainings(status, parishId, page, size)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','GRD_SPECIALIST','JEFA_OGP','BRIGADISTA','AUTHORIZED_USER')")
    public ResponseEntity<ApiResponse<TrainingDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(trainingService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','GRD_SPECIALIST','JEFA_OGP')")
    public ResponseEntity<ApiResponse<TrainingDto>> create(@Valid @RequestBody TrainingCreateDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Training created successfully", trainingService.create(dto)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','GRD_SPECIALIST','JEFA_OGP')")
    public ResponseEntity<ApiResponse<TrainingDto>> update(@PathVariable Long id, @RequestBody TrainingUpdateDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Training updated successfully", trainingService.update(id, dto)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        trainingService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Training deleted successfully", null));
    }

    // Participants
    @GetMapping("/{id}/participants")
    @PreAuthorize("hasAnyRole('ADMIN','GRD_SPECIALIST','JEFA_OGP','BRIGADISTA','AUTHORIZED_USER')")
    public ResponseEntity<ApiResponse<List<TrainingParticipantDto>>> getParticipants(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(trainingService.getParticipants(id)));
    }

    @PostMapping("/{id}/participants")
    @PreAuthorize("hasAnyRole('ADMIN','GRD_SPECIALIST','JEFA_OGP','BRIGADISTA')")
    public ResponseEntity<ApiResponse<TrainingParticipantDto>> addParticipant(
            @PathVariable Long id, @Valid @RequestBody TrainingParticipantCreateDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Participant added", trainingService.addParticipant(id, dto)));
    }

    @PutMapping("/participants/{participantId}")
    @PreAuthorize("hasAnyRole('ADMIN','GRD_SPECIALIST','JEFA_OGP')")
    public ResponseEntity<ApiResponse<TrainingParticipantDto>> updateParticipant(
            @PathVariable Long participantId, @RequestBody TrainingParticipantCreateDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Participant updated", trainingService.updateParticipant(participantId, dto)));
    }

    @DeleteMapping("/participants/{participantId}")
    @PreAuthorize("hasAnyRole('ADMIN','GRD_SPECIALIST')")
    public ResponseEntity<ApiResponse<Void>> deleteParticipant(@PathVariable Long participantId) {
        trainingService.deleteParticipant(participantId);
        return ResponseEntity.ok(ApiResponse.success("Participant deleted", null));
    }
}
