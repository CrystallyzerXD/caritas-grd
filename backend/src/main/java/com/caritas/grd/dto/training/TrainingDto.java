package com.caritas.grd.dto.training;

import com.caritas.grd.model.TrainingModality;
import com.caritas.grd.model.TrainingStatus;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class TrainingDto {
    private Long id;
    private String trainingCode;
    private String name;
    private TrainingModality modality;
    private LocalDate startDate;
    private LocalDate endDate;
    private Long parishId;
    private String parish;
    private Long responsibleId;
    private String responsible;
    private TrainingStatus status;
    private String description;
    private Integer participantCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
