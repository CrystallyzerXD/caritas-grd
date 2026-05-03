package com.caritas.grd.service;

import com.caritas.grd.dto.brigadista.BrigadistaCreateDto;
import com.caritas.grd.dto.brigadista.BrigadistaDto;
import com.caritas.grd.exception.ResourceNotFoundException;
import com.caritas.grd.model.Brigadista;
import com.caritas.grd.model.Parish;
import com.caritas.grd.repository.BrigadistaRepository;
import com.caritas.grd.repository.ParishRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BrigadistaService {

    private final BrigadistaRepository brigadistaRepository;
    private final ParishRepository parishRepository;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public Page<BrigadistaDto> getAll(int page, int size) {
        PageRequest pr = PageRequest.of(page, size, Sort.by("fullName").ascending());
        return brigadistaRepository.findAll(pr).map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public BrigadistaDto getById(Long id) {
        return mapToDto(findOrThrow(id));
    }

    @Transactional(readOnly = true)
    public List<BrigadistaDto> getAvailable() {
        return brigadistaRepository.findByAvailableTrueAndActiveTrue()
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional
    public BrigadistaDto create(BrigadistaCreateDto dto, String createdByEmail) {
        Parish parish = null;
        if (dto.getParishId() != null) {
            parish = parishRepository.findById(dto.getParishId()).orElse(null);
        }
        Brigadista b = Brigadista.builder()
                .fullName(dto.getFullName())
                .dni(dto.getDni())
                .phone(dto.getPhone())
                .email(dto.getEmail())
                .parish(parish)
                .pastoralRole(dto.getPastoralRole())
                .available(dto.getAvailable() != null ? dto.getAvailable() : true)
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .active(dto.getActive() != null ? dto.getActive() : true)
                .observations(dto.getObservations())
                .build();
        b = brigadistaRepository.save(b);
        auditService.log("Brigadista", b.getId(), "CREATE", createdByEmail, null, b.getFullName());
        return mapToDto(b);
    }

    @Transactional
    public BrigadistaDto update(Long id, BrigadistaCreateDto dto, String updatedByEmail) {
        Brigadista b = findOrThrow(id);
        if (dto.getFullName() != null) b.setFullName(dto.getFullName());
        if (dto.getDni() != null) b.setDni(dto.getDni());
        if (dto.getPhone() != null) b.setPhone(dto.getPhone());
        if (dto.getEmail() != null) b.setEmail(dto.getEmail());
        if (dto.getParishId() != null) {
            Parish parish = parishRepository.findById(dto.getParishId()).orElse(null);
            b.setParish(parish);
        }
        if (dto.getPastoralRole() != null) b.setPastoralRole(dto.getPastoralRole());
        if (dto.getAvailable() != null) b.setAvailable(dto.getAvailable());
        if (dto.getLatitude() != null) b.setLatitude(dto.getLatitude());
        if (dto.getLongitude() != null) b.setLongitude(dto.getLongitude());
        if (dto.getActive() != null) b.setActive(dto.getActive());
        if (dto.getObservations() != null) b.setObservations(dto.getObservations());
        b = brigadistaRepository.save(b);
        auditService.log("Brigadista", b.getId(), "UPDATE", updatedByEmail, null, b.getFullName());
        return mapToDto(b);
    }

    @Transactional
    public void delete(Long id, String deletedByEmail) {
        Brigadista b = findOrThrow(id);
        b.setActive(false);
        brigadistaRepository.save(b);
        auditService.log("Brigadista", id, "DELETE", deletedByEmail, null, b.getFullName());
    }

    private Brigadista findOrThrow(Long id) {
        return brigadistaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brigadista", "id", id));
    }

    public BrigadistaDto mapToDto(Brigadista b) {
        BrigadistaDto dto = new BrigadistaDto();
        dto.setId(b.getId());
        dto.setFullName(b.getFullName());
        dto.setDni(b.getDni());
        dto.setPhone(b.getPhone());
        dto.setEmail(b.getEmail());
        if (b.getParish() != null) {
            dto.setParishId(b.getParish().getId());
            dto.setParish(b.getParish().getName());
        }
        dto.setPastoralRole(b.getPastoralRole());
        dto.setAvailable(b.getAvailable());
        dto.setLatitude(b.getLatitude());
        dto.setLongitude(b.getLongitude());
        dto.setActive(b.getActive());
        dto.setObservations(b.getObservations());
        dto.setCreatedAt(b.getCreatedAt());
        dto.setUpdatedAt(b.getUpdatedAt());
        return dto;
    }
}
