package com.caritas.grd.dto.incident;

import com.caritas.grd.model.IncidentStatus;
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
}
