package com.caritas.grd.dto.environmental;

import com.caritas.grd.model.InitiativeStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class EnvironmentalCreateDto {

    @NotBlank(message = "Title is required")
    @Size(max = 300)
    private String title;

    private String description;

    @Size(max = 200)
    private String responsible;

    @Size(max = 300)
    private String location;

    private Long districtId;

    private LocalDate startDate;

    private LocalDate endDate;

    private InitiativeStatus status;

    @Size(max = 100)
    private String category;
}
