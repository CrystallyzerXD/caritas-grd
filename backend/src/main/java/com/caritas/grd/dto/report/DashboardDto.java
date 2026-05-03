package com.caritas.grd.dto.report;

import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
public class DashboardDto {

    // GRD
    private Long totalIncidents;
    private Long openIncidents;
    private Long inProgressIncidents;
    private Long closedIncidents;
    private Long followUpIncidents;
    private Long totalAffectedPersons;
    private Long totalEvidences;

    // Breakdown charts
    private Map<String, Long> incidentsByEventType;
    private Map<String, Long> incidentsByDistrict;

    // Capacitaciones
    private Long totalTrainings;
    private Long totalParticipants;
    private Long certifiedParticipants;

    // Brigadistas
    private Long totalBrigadistas;
    private Long activeBrigadistas;
}
