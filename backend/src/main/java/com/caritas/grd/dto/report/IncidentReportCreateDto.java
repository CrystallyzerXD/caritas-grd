package com.caritas.grd.dto.report;

import com.caritas.grd.model.ReportType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class IncidentReportCreateDto {
    @NotNull(message = "Report type is required")
    private ReportType reportType;
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
}
