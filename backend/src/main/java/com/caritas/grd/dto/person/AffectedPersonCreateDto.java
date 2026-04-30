package com.caritas.grd.dto.person;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class AffectedPersonCreateDto {

    @NotBlank(message = "Full name is required")
    @Size(max = 200)
    private String fullName;

    private LocalDate birthDate;

    @Size(min = 8, max = 8, message = "DNI must be 8 digits")
    private String dni;

    @Size(max = 15)
    private String phone;

    @Size(max = 10)
    private String sex;

    @Size(max = 200)
    private String damageType;
}
