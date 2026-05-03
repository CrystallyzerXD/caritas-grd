package com.caritas.grd.dto.incident;

import com.caritas.grd.model.AffectationLevel;
import com.caritas.grd.model.IncidentStatus;
import com.caritas.grd.model.SocialRiskLevel;
import lombok.Data;

import java.time.LocalDate;

@Data
public class IncidentUpdateDto {

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
