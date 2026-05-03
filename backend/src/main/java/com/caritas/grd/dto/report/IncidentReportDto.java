package com.caritas.grd.dto.report;

import com.caritas.grd.model.ReportType;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class IncidentReportDto {
    private Long id;
    private Long incidentId;
    private String caseCode;
    private ReportType reportType;
    private Long createdById;
    private String createdByName;
    private String observations;
    // PRIMERA_VISITA
    private String visitMotivo;
    private String visitObjectives;
    private String eventDescription;
    private String habitabilityConditions;
    private String familyComposition;
    private String vulnerabilityLevel;
    private String priorityNeeds;
    private String initialRecommendation;
    // ENTREGA_DONACION
    private String deliveryCode;
    private LocalDate deliveryDate;
    private String deliveryPlace;
    private String beneficiaryName;
    private String beneficiaryDni;
    private String aidType;
    private String kitComposition;
    private String deliveryResponsible;
    private String parroquialActor;
    private String deliveryEvidence;
    // SEGUIMIENTO
    private LocalDate followUpDate;
    private String followUpMedium;
    private String currentSituation;
    private String aidUsage;
    private String persistentNeeds;
    private String referralsMade;
    private String technicalRecommendation;
    private String finalStatus;
    private LocalDateTime createdAt;
}
