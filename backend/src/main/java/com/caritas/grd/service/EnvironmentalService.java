package com.caritas.grd.service;

import com.caritas.grd.dto.environmental.EnvironmentalCreateDto;
import com.caritas.grd.dto.environmental.EnvironmentalFilterDto;
import com.caritas.grd.dto.environmental.EnvironmentalInitiativeDto;
import com.caritas.grd.exception.ResourceNotFoundException;
import com.caritas.grd.model.*;
import com.caritas.grd.repository.DistrictRepository;
import com.caritas.grd.repository.EnvironmentalInitiativeRepository;
import com.caritas.grd.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EnvironmentalService {

    private final EnvironmentalInitiativeRepository environmentalRepository;
    private final DistrictRepository districtRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public Page<EnvironmentalInitiativeDto> getInitiatives(EnvironmentalFilterDto filter) {
        Sort sort = filter.getSortDir().equalsIgnoreCase("asc")
                ? Sort.by(filter.getSortBy()).ascending()
                : Sort.by(filter.getSortBy()).descending();
        Pageable pageable = PageRequest.of(filter.getPage(), filter.getSize(), sort);

        Specification<EnvironmentalInitiative> spec = Specification.where(null);
        if (filter.getStatus() != null) {
            spec = spec.and((root, q, cb) -> cb.equal(root.get("status"), filter.getStatus()));
        }
        if (filter.getCategory() != null && !filter.getCategory().isBlank()) {
            spec = spec.and((root, q, cb) -> cb.equal(root.get("category"), filter.getCategory()));
        }
        if (filter.getDistrictId() != null) {
            spec = spec.and((root, q, cb) -> cb.equal(root.get("district").get("id"), filter.getDistrictId()));
        }
        if (filter.getSearch() != null && !filter.getSearch().isBlank()) {
            String pattern = "%" + filter.getSearch().toLowerCase() + "%";
            spec = spec.and((root, q, cb) -> cb.like(cb.lower(root.get("title")), pattern));
        }

        Page<EnvironmentalInitiative> initiatives = environmentalRepository.findAll(spec, pageable);
        return initiatives.map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public EnvironmentalInitiativeDto getById(Long id) {
        EnvironmentalInitiative initiative = environmentalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("EnvironmentalInitiative", "id", id));
        return mapToDto(initiative);
    }

    @Transactional
    public EnvironmentalInitiativeDto create(EnvironmentalCreateDto dto, String createdByEmail) {
        User createdBy = userRepository.findByEmail(createdByEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", createdByEmail));

        District district = null;
        if (dto.getDistrictId() != null) {
            district = districtRepository.findById(dto.getDistrictId()).orElse(null);
        }

        EnvironmentalInitiative initiative = EnvironmentalInitiative.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .responsible(dto.getResponsible())
                .location(dto.getLocation())
                .district(district)
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .status(dto.getStatus() != null ? dto.getStatus() : InitiativeStatus.PLANNED)
                .category(dto.getCategory())
                .createdBy(createdBy)
                .build();

        initiative = environmentalRepository.save(initiative);
        auditService.log("EnvironmentalInitiative", initiative.getId(), "CREATE",
                createdByEmail, null, initiative.getTitle());
        return mapToDto(initiative);
    }

    @Transactional
    public EnvironmentalInitiativeDto update(Long id, EnvironmentalCreateDto dto, String updatedByEmail) {
        EnvironmentalInitiative initiative = environmentalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("EnvironmentalInitiative", "id", id));

        User updatedBy = userRepository.findByEmail(updatedByEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", updatedByEmail));

        if (dto.getTitle() != null) initiative.setTitle(dto.getTitle());
        if (dto.getDescription() != null) initiative.setDescription(dto.getDescription());
        if (dto.getResponsible() != null) initiative.setResponsible(dto.getResponsible());
        if (dto.getLocation() != null) initiative.setLocation(dto.getLocation());
        if (dto.getDistrictId() != null) {
            District district = districtRepository.findById(dto.getDistrictId()).orElse(null);
            initiative.setDistrict(district);
        }
        if (dto.getStartDate() != null) initiative.setStartDate(dto.getStartDate());
        if (dto.getEndDate() != null) initiative.setEndDate(dto.getEndDate());
        if (dto.getStatus() != null) initiative.setStatus(dto.getStatus());
        if (dto.getCategory() != null) initiative.setCategory(dto.getCategory());
        initiative.setUpdatedBy(updatedBy);

        initiative = environmentalRepository.save(initiative);
        auditService.log("EnvironmentalInitiative", initiative.getId(), "UPDATE",
                updatedByEmail, null, initiative.getTitle());
        return mapToDto(initiative);
    }

    @Transactional
    public void delete(Long id, String deletedBy) {
        if (!environmentalRepository.existsById(id)) {
            throw new ResourceNotFoundException("EnvironmentalInitiative", "id", id);
        }
        environmentalRepository.deleteById(id);
        auditService.log("EnvironmentalInitiative", id, "DELETE", deletedBy, null, null);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getStatistics() {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("total", environmentalRepository.count());
        stats.put("planned", environmentalRepository.countByStatus(InitiativeStatus.PLANNED));
        stats.put("inProgress", environmentalRepository.countByStatus(InitiativeStatus.IN_PROGRESS));
        stats.put("completed", environmentalRepository.countByStatus(InitiativeStatus.COMPLETED));
        stats.put("cancelled", environmentalRepository.countByStatus(InitiativeStatus.CANCELLED));

        Map<String, Long> byCategory = environmentalRepository.countByCategory().stream()
                .collect(Collectors.toMap(
                        row -> (String) row[0],
                        row -> (Long) row[1],
                        (a, b) -> a,
                        LinkedHashMap::new
                ));
        stats.put("byCategory", byCategory);
        return stats;
    }

    public EnvironmentalInitiativeDto mapToDto(EnvironmentalInitiative initiative) {
        EnvironmentalInitiativeDto dto = new EnvironmentalInitiativeDto();
        dto.setId(initiative.getId());
        dto.setTitle(initiative.getTitle());
        dto.setDescription(initiative.getDescription());
        dto.setResponsible(initiative.getResponsible());
        dto.setLocation(initiative.getLocation());
        if (initiative.getDistrict() != null) {
            dto.setDistrictId(initiative.getDistrict().getId());
            dto.setDistrict(initiative.getDistrict().getName());
        }
        dto.setStartDate(initiative.getStartDate());
        dto.setEndDate(initiative.getEndDate());
        dto.setStatus(initiative.getStatus());
        dto.setCategory(initiative.getCategory());
        if (initiative.getCreatedBy() != null) {
            dto.setCreatedById(initiative.getCreatedBy().getId());
            dto.setCreatedByName(initiative.getCreatedBy().getFullName());
        }
        if (initiative.getUpdatedBy() != null) {
            dto.setUpdatedById(initiative.getUpdatedBy().getId());
            dto.setUpdatedByName(initiative.getUpdatedBy().getFullName());
        }
        dto.setCreatedAt(initiative.getCreatedAt());
        dto.setUpdatedAt(initiative.getUpdatedAt());
        return dto;
    }
}
