package com.caritas.grd.service;

import com.caritas.grd.dto.report.IncidentReportCreateDto;
import com.caritas.grd.dto.report.IncidentReportDto;
import com.caritas.grd.exception.ResourceNotFoundException;
import com.caritas.grd.model.*;
import com.caritas.grd.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IncidentReportService {

    private final IncidentReportRepository reportRepository;
    private final IncidentRepository incidentRepository;
    private final UserRepository userRepository;

    private String generateDeliveryCode() {
        int year = Year.now().getValue();
        Long maxId = reportRepository.findMaxDeliveryId();
        long seq = (maxId == null ? 0L : maxId) + 1;
        return String.format("ENT-%d-%04d", year, seq);
    }

    @Transactional(readOnly = true)
    public List<IncidentReportDto> getByIncident(Long incidentId) {
        return reportRepository.findByIncidentIdOrderByCreatedAtDesc(incidentId)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public IncidentReportDto getById(Long id) {
        return mapToDto(reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("IncidentReport", "id", id)));
    }

    @Transactional
    public IncidentReportDto create(Long incidentId, IncidentReportCreateDto dto, String createdByEmail) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new ResourceNotFoundException("Incident", "id", incidentId));
        User createdBy = userRepository.findByEmail(createdByEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", createdByEmail));

        IncidentReport report = IncidentReport.builder()
                .incident(incident)
                .reportType(dto.getReportType())
                .createdBy(createdBy)
                .observations(dto.getObservations())
                .visitMotivo(dto.getVisitMotivo())
                .visitObjectives(dto.getVisitObjectives())
                .eventDescription(dto.getEventDescription())
                .habitabilityConditions(dto.getHabitabilityConditions())
                .familyComposition(dto.getFamilyComposition())
                .vulnerabilityLevel(dto.getVulnerabilityLevel())
                .priorityNeeds(dto.getPriorityNeeds())
                .initialRecommendation(dto.getInitialRecommendation())
                .deliveryCode(dto.getReportType() == ReportType.ENTREGA_DONACION ? generateDeliveryCode() : null)
                .deliveryDate(dto.getDeliveryDate())
                .deliveryPlace(dto.getDeliveryPlace())
                .beneficiaryName(dto.getBeneficiaryName())
                .beneficiaryDni(dto.getBeneficiaryDni())
                .aidType(dto.getAidType())
                .kitComposition(dto.getKitComposition())
                .deliveryResponsible(dto.getDeliveryResponsible())
                .parroquialActor(dto.getParroquialActor())
                .deliveryEvidence(dto.getDeliveryEvidence())
                .followUpDate(dto.getFollowUpDate())
                .followUpMedium(dto.getFollowUpMedium())
                .currentSituation(dto.getCurrentSituation())
                .aidUsage(dto.getAidUsage())
                .persistentNeeds(dto.getPersistentNeeds())
                .referralsMade(dto.getReferralsMade())
                .technicalRecommendation(dto.getTechnicalRecommendation())
                .finalStatus(dto.getFinalStatus())
                .build();

        return mapToDto(reportRepository.save(report));
    }

    @Transactional
    public void delete(Long id) {
        if (!reportRepository.existsById(id))
            throw new ResourceNotFoundException("IncidentReport", "id", id);
        reportRepository.deleteById(id);
    }

    private IncidentReportDto mapToDto(IncidentReport r) {
        IncidentReportDto dto = new IncidentReportDto();
        dto.setId(r.getId());
        dto.setIncidentId(r.getIncident().getId());
        if (r.getIncident().getCaseCode() != null) dto.setCaseCode(r.getIncident().getCaseCode());
        dto.setReportType(r.getReportType());
        if (r.getCreatedBy() != null) { dto.setCreatedById(r.getCreatedBy().getId()); dto.setCreatedByName(r.getCreatedBy().getFullName()); }
        dto.setObservations(r.getObservations());
        dto.setVisitMotivo(r.getVisitMotivo());
        dto.setVisitObjectives(r.getVisitObjectives());
        dto.setEventDescription(r.getEventDescription());
        dto.setHabitabilityConditions(r.getHabitabilityConditions());
        dto.setFamilyComposition(r.getFamilyComposition());
        dto.setVulnerabilityLevel(r.getVulnerabilityLevel());
        dto.setPriorityNeeds(r.getPriorityNeeds());
        dto.setInitialRecommendation(r.getInitialRecommendation());
        dto.setDeliveryCode(r.getDeliveryCode());
        dto.setDeliveryDate(r.getDeliveryDate());
        dto.setDeliveryPlace(r.getDeliveryPlace());
        dto.setBeneficiaryName(r.getBeneficiaryName());
        dto.setBeneficiaryDni(r.getBeneficiaryDni());
        dto.setAidType(r.getAidType());
        dto.setKitComposition(r.getKitComposition());
        dto.setDeliveryResponsible(r.getDeliveryResponsible());
        dto.setParroquialActor(r.getParroquialActor());
        dto.setDeliveryEvidence(r.getDeliveryEvidence());
        dto.setFollowUpDate(r.getFollowUpDate());
        dto.setFollowUpMedium(r.getFollowUpMedium());
        dto.setCurrentSituation(r.getCurrentSituation());
        dto.setAidUsage(r.getAidUsage());
        dto.setPersistentNeeds(r.getPersistentNeeds());
        dto.setReferralsMade(r.getReferralsMade());
        dto.setTechnicalRecommendation(r.getTechnicalRecommendation());
        dto.setFinalStatus(r.getFinalStatus());
        dto.setCreatedAt(r.getCreatedAt());
        return dto;
    }
}
