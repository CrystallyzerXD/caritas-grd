package com.caritas.grd.controller;

import com.caritas.grd.dto.ApiResponse;
import com.caritas.grd.dto.brigadista.BrigadistaCreateDto;
import com.caritas.grd.dto.brigadista.BrigadistaDto;
import com.caritas.grd.service.BrigadistaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/brigadistas")
@RequiredArgsConstructor
public class BrigadistaController {

    private final BrigadistaService brigadistaService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<BrigadistaDto>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success("OK", brigadistaService.getAll(page, size)));
    }

    @GetMapping("/disponibles")
    public ResponseEntity<ApiResponse<List<BrigadistaDto>>> getAvailable() {
        return ResponseEntity.ok(ApiResponse.success("OK", brigadistaService.getAvailable()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BrigadistaDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("OK", brigadistaService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','GRD_SPECIALIST')")
    public ResponseEntity<ApiResponse<BrigadistaDto>> create(
            @Valid @RequestBody BrigadistaCreateDto dto,
            Authentication auth) {
        BrigadistaDto created = brigadistaService.create(dto, auth.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Brigadista registrado", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','GRD_SPECIALIST')")
    public ResponseEntity<ApiResponse<BrigadistaDto>> update(
            @PathVariable Long id,
            @RequestBody BrigadistaCreateDto dto,
            Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success("Brigadista actualizado", brigadistaService.update(id, dto, auth.getName())));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id, Authentication auth) {
        brigadistaService.delete(id, auth.getName());
        return ResponseEntity.ok(ApiResponse.success("Brigadista eliminado", null));
    }
}
