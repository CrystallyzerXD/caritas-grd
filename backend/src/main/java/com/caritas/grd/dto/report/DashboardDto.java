package com.caritas.grd.dto.report;

import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
public class DashboardDto {

    private Long totalIncidents;
    private Long openIncidents;
    private Long inProgressIncidents;
    private Long closedIncidents;
    private Long followUpIncidents;
    private Long totalAffectedPersons;
    private Long totalEvidences;
    private Long totalEnvironmentalInitiatives;
    private Long plannedInitiatives;
    private Long inProgressInitiatives;
    private Long completedInitiatives;
    private Map<String, Long> incidentsByEventType;
    private Map<String, Long> incidentsByDistrict;
    private Map<String, Long> initiativesByCategory;
}
