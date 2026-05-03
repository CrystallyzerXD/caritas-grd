package com.caritas.grd.service;

import com.caritas.grd.dto.incident.*;
import com.caritas.grd.dto.report.IncidentStatsDto;
import com.caritas.grd.exception.ResourceNotFoundException;
import com.caritas.grd.model.*;
import com.caritas.grd.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IncidentService {

    private final IncidentRepository incidentRepository;
    private final EventTypeRepository eventTypeRepository;
    private final DistrictRepository districtRepository;
    private final UserRepository userRepository;
    private final AffectedPersonRepository affectedPersonRepository;
    private final EvidenceRepository evidenceRepository;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public Page<IncidentDto> getIncidents(IncidentFilterDto filter) {
        Sort sort = filter.getSortDir().equalsIgnoreCase("asc")
                ? Sort.by(filter.getSortBy()).ascending()
                : Sort.by(filter.getSortBy()).descending();
        Pageable pageable = PageRequest.of(filter.getPage(), filter.getSize(), sort);

        Page<Incident> incidents = incidentRepository.findWithFilters(
                filter.getStatus(),
                filter.getEventTypeId(),
                filter.getDistrictId(),
                filter.getDateFrom(),
                filter.getDateTo(),
                filter.getCreatedById(),
                pageable
        );
        return incidents.map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public IncidentDto getIncidentById(Long id) {
        Incident incident = incidentRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incident", "id", id));
        return mapToDto(incident);
    }

    @Transactional
    public IncidentDto createIncident(IncidentCreateDto dto, String createdByEmail) {
        EventType eventType = eventTypeRepository.findById(dto.getEventTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("EventType", "id", dto.getEventTypeId()));

        User createdBy = userRepository.findByEmail(createdByEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", createdByEmail));

        District district = null;
        if (dto.getDistrictId() != null) {
            district = districtRepository.findById(dto.getDistrictId()).orElse(null);
        }

        Incident incident = Incident.builder()
                .eventType(eventType)
                .description(dto.getDescription())
                .cause(dto.getCause())
                .losses(dto.getLosses())
                .actionsTaken(dto.getActionsTaken())
                .status(dto.getStatus() != null ? dto.getStatus() : IncidentStatus.OPEN)
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .address(dto.getAddress())
                .district(district)
                .incidentDate(dto.getIncidentDate())
                .createdBy(createdBy)
                .reportDate(dto.getReportDate())
                .alertSource(dto.getAlertSource())
                .affectationLevel(dto.getAffectationLevel())
                .affectedFamilies(dto.getAffectedFamilies())
                .vulnerableGroups(dto.getVulnerableGroups())
                .urgentNeeds(dto.getUrgentNeeds())
                .socialRiskAssessment(dto.getSocialRiskAssessment())
                .articulatedInstitutions(dto.getArticulatedInstitutions())
                .build();

        incident = incidentRepository.save(incident);
        // Generate caseCode after save so we have the ID
        String caseCode = String.format("GRD-%d-%04d", Year.now().getValue(), incident.getId());
        incident.setCaseCode(caseCode);
        incident = incidentRepository.save(incident);
        auditService.log("Incident", incident.getId(), "CREATE", createdByEmail, null,
                "eventType=" + eventType.getName());
        return mapToDto(incident);
    }

    @Transactional
    public IncidentDto updateIncident(Long id, IncidentUpdateDto dto, String updatedByEmail) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incident", "id", id));

        User updatedBy = userRepository.findByEmail(updatedByEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", updatedByEmail));

        if (dto.getEventTypeId() != null) {
            EventType eventType = eventTypeRepository.findById(dto.getEventTypeId())
                    .orElseThrow(() -> new ResourceNotFoundException("EventType", "id", dto.getEventTypeId()));
            incident.setEventType(eventType);
        }
        if (dto.getDescription() != null) incident.setDescription(dto.getDescription());
        if (dto.getCause() != null) incident.setCause(dto.getCause());
        if (dto.getLosses() != null) incident.setLosses(dto.getLosses());
        if (dto.getActionsTaken() != null) incident.setActionsTaken(dto.getActionsTaken());
        if (dto.getStatus() != null) incident.setStatus(dto.getStatus());
        if (dto.getLatitude() != null) incident.setLatitude(dto.getLatitude());
        if (dto.getLongitude() != null) incident.setLongitude(dto.getLongitude());
        if (dto.getAddress() != null) incident.setAddress(dto.getAddress());
        if (dto.getDistrictId() != null) {
            District district = districtRepository.findById(dto.getDistrictId()).orElse(null);
            incident.setDistrict(district);
        }
        if (dto.getIncidentDate() != null) incident.setIncidentDate(dto.getIncidentDate());
        if (dto.getReportDate() != null) incident.setReportDate(dto.getReportDate());
        if (dto.getAlertSource() != null) incident.setAlertSource(dto.getAlertSource());
        if (dto.getAffectationLevel() != null) incident.setAffectationLevel(dto.getAffectationLevel());
        if (dto.getAffectedFamilies() != null) incident.setAffectedFamilies(dto.getAffectedFamilies());
        if (dto.getVulnerableGroups() != null) incident.setVulnerableGroups(dto.getVulnerableGroups());
        if (dto.getUrgentNeeds() != null) incident.setUrgentNeeds(dto.getUrgentNeeds());
        if (dto.getSocialRiskAssessment() != null) incident.setSocialRiskAssessment(dto.getSocialRiskAssessment());
        if (dto.getArticulatedInstitutions() != null) incident.setArticulatedInstitutions(dto.getArticulatedInstitutions());
        incident.setUpdatedBy(updatedBy);

        incident = incidentRepository.save(incident);
        auditService.log("Incident", incident.getId(), "UPDATE", updatedByEmail, null,
                "status=" + incident.getStatus());
        return mapToDto(incident);
    }

    @Transactional
    public void deleteIncident(Long id, String deletedBy) {
        if (!incidentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Incident", "id", id);
        }
        incidentRepository.deleteById(id);
        auditService.log("Incident", id, "DELETE", deletedBy, null, null);
    }

    @Transactional(readOnly = true)
    public IncidentStatsDto getStatistics() {
        Map<String, Long> byStatus = new LinkedHashMap<>();
        byStatus.put("OPEN", incidentRepository.countByStatus(IncidentStatus.OPEN));
        byStatus.put("IN_PROGRESS", incidentRepository.countByStatus(IncidentStatus.IN_PROGRESS));
        byStatus.put("CLOSED", incidentRepository.countByStatus(IncidentStatus.CLOSED));
        byStatus.put("FOLLOW_UP", incidentRepository.countByStatus(IncidentStatus.FOLLOW_UP));

        Map<String, Long> byEventType = incidentRepository.countByEventType().stream()
                .collect(Collectors.toMap(
                        row -> (String) row[0],
                        row -> (Long) row[1],
                        (a, b) -> a,
                        LinkedHashMap::new
                ));

        Map<String, Long> byDistrict = incidentRepository.countByDistrict().stream()
                .collect(Collectors.toMap(
                        row -> (String) row[0],
                        row -> (Long) row[1],
                        (a, b) -> a,
                        LinkedHashMap::new
                ));

        return IncidentStatsDto.builder()
                .totalIncidents(incidentRepository.count())
                .byStatus(byStatus)
                .byEventType(byEventType)
                .byDistrict(byDistrict)
                .build();
    }

    public IncidentDto mapToDto(Incident incident) {
        IncidentDto dto = new IncidentDto();
        dto.setId(incident.getId());
        if (incident.getEventType() != null) {
            dto.setEventTypeId(incident.getEventType().getId());
            dto.setEventType(incident.getEventType().getName());
        }
        dto.setDescription(incident.getDescription());
        dto.setCause(incident.getCause());
        dto.setLosses(incident.getLosses());
        dto.setActionsTaken(incident.getActionsTaken());
        dto.setStatus(incident.getStatus());
        dto.setLatitude(incident.getLatitude());
        dto.setLongitude(incident.getLongitude());
        dto.setAddress(incident.getAddress());
        if (incident.getDistrict() != null) {
            dto.setDistrictId(incident.getDistrict().getId());
            dto.setDistrict(incident.getDistrict().getName());
        }
        dto.setIncidentDate(incident.getIncidentDate());
        if (incident.getCreatedBy() != null) {
            dto.setCreatedById(incident.getCreatedBy().getId());
            dto.setCreatedByName(incident.getCreatedBy().getFullName());
        }
        if (incident.getUpdatedBy() != null) {
            dto.setUpdatedById(incident.getUpdatedBy().getId());
            dto.setUpdatedByName(incident.getUpdatedBy().getFullName());
        }
        dto.setAffectedPersonCount(incident.getAffectedPersons() != null
                ? incident.getAffectedPersons().size() : 0);
        dto.setEvidenceCount(incident.getEvidences() != null
                ? incident.getEvidences().size() : 0);
        dto.setCreatedAt(incident.getCreatedAt());
        dto.setUpdatedAt(incident.getUpdatedAt());
        dto.setCaseCode(incident.getCaseCode());
        dto.setReportDate(incident.getReportDate());
        dto.setAlertSource(incident.getAlertSource());
        dto.setAffectationLevel(incident.getAffectationLevel());
        dto.setAffectedFamilies(incident.getAffectedFamilies());
        dto.setVulnerableGroups(incident.getVulnerableGroups());
        dto.setUrgentNeeds(incident.getUrgentNeeds());
        dto.setSocialRiskAssessment(incident.getSocialRiskAssessment());
        dto.setArticulatedInstitutions(incident.getArticulatedInstitutions());
        dto.setReportCount(incident.getReports() != null ? incident.getReports().size() : 0);
        return dto;
    }
}
