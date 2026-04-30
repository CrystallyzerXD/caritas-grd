package com.caritas.grd.dto.person;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class AffectedPersonDto {

    private Long id;
    private Long incidentId;
    private String fullName;
    private LocalDate birthDate;
    private String dni;
    private String phone;
    private String sex;
    private String damageType;
    private LocalDateTime createdAt;
}
