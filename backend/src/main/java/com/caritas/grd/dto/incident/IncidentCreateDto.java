package com.caritas.grd.dto.incident;

import com.caritas.grd.model.AffectationLevel;
import com.caritas.grd.model.IncidentStatus;
import com.caritas.grd.model.SocialRiskLevel;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class IncidentCreateDto {

    @NotNull(message = "Event type is required")
    private Long eventTypeId;

    private String description;
    private String cause;
    private String losses;
    private String actionsTaken;
    private IncidentStatus status;
    private Double latitude;
    private Double longitude;
    private String address;
    private Long districtId;

    @NotNull(message = "Incident date is required")
    private LocalDate incidentDate;

    private LocalDate reportDate;
    private String alertSource;
    private AffectationLevel affectationLevel;
    private Integer affectedFamilies;
    private String vulnerableGroups;
    private String urgentNeeds;
    private SocialRiskLevel socialRiskAssessment;
    private String articulatedInstitutions;
}
