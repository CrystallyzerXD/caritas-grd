package com.caritas.grd.dto.training;

import com.caritas.grd.model.AttendanceStatus;
import com.caritas.grd.model.CertificationStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TrainingParticipantCreateDto {
    private String dni;
    @NotBlank(message = "Full name is required")
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
}
