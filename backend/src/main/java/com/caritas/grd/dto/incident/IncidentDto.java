package com.caritas.grd.dto.incident;

import com.caritas.grd.model.AffectationLevel;
import com.caritas.grd.model.IncidentStatus;
import com.caritas.grd.model.SocialRiskLevel;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class IncidentDto {

    private Long id;
    private Long eventTypeId;
    private String eventType;
    private String description;
    private String cause;
    private String losses;
    private String actionsTaken;
    private IncidentStatus status;
    private Double latitude;
    private Double longitude;
    private String address;
    private Long districtId;
    private String district;
    private LocalDate incidentDate;
    private Long createdById;
    private String createdByName;
    private Long updatedById;
    private String updatedByName;
    private Integer affectedPersonCount;
    private Integer evidenceCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String caseCode;
    private LocalDate reportDate;
    private String alertSource;
    private AffectationLevel affectationLevel;
    private Integer affectedFamilies;
    private String vulnerableGroups;
    private String urgentNeeds;
    private SocialRiskLevel socialRiskAssessment;
    private String articulatedInstitutions;
    private Integer reportCount;
}
