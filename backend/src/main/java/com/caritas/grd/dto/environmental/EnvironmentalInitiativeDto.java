package com.caritas.grd.dto.environmental;

import com.caritas.grd.model.InitiativeStatus;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class EnvironmentalInitiativeDto {

    private Long id;
    private String title;
    private String description;
    private String responsible;
    private String location;
    private Long districtId;
    private String district;
    private LocalDate startDate;
    private LocalDate endDate;
    private InitiativeStatus status;
    private String category;
    private Long createdById;
    private String createdByName;
    private Long updatedById;
    private String updatedByName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
