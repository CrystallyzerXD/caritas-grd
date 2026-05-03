package com.caritas.grd.dto.training;

import com.caritas.grd.model.TrainingModality;
import com.caritas.grd.model.TrainingStatus;
import lombok.Data;
import java.time.LocalDate;

@Data
public class TrainingUpdateDto {
    private String name;
    private TrainingModality modality;
    private LocalDate startDate;
    private LocalDate endDate;
    private Long parishId;
    private Long responsibleId;
    private TrainingStatus status;
    private String description;
}
