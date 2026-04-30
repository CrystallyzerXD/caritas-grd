package com.caritas.grd.dto.report;

import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
public class IncidentStatsDto {

    private Long totalIncidents;
    private Map<String, Long> byStatus;
    private Map<String, Long> byEventType;
    private Map<String, Long> byDistrict;
}
