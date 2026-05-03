package com.caritas.grd.dto.training;

import com.caritas.grd.model.AttendanceStatus;
import com.caritas.grd.model.CertificationStatus;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TrainingParticipantDto {
    private Long id;
    private Long trainingId;
    private String dni;
    private String fullName;
    private Integer age;
    private String phone;
    private String email;
    private String pastoralRole;
    private AttendanceStatus attendance;
    private Double initialScore;
    private Double finalScore;
    private CertificationStatus certificationStatus;
    private String observations;
    private LocalDateTime createdAt;
}
