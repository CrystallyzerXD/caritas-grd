package com.caritas.grd.dto.training;

import com.caritas.grd.model.TrainingModality;
import com.caritas.grd.model.TrainingStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class TrainingCreateDto {
    @NotBlank(message = "Name is required")
    private String name;
    @NotNull(message = "Modality is required")
    private TrainingModality modality;
    private LocalDate startDate;
    private LocalDate endDate;
    private Long parishId;
    private Long responsibleId;
    private TrainingStatus status;
    private String description;
}
