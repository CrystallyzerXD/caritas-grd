package com.caritas.grd.dto.person;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class AffectedPersonCreateDto {

    @NotBlank(message = "Full name is required")
    @Size(max = 200)
    private String fullName;

    private LocalDate birthDate;

    /** Vacío u opcional, o exactamente 8 dígitos (DNI peruano). */
    @Pattern(regexp = "^$|^\\d{8}$", message = "El DNI debe tener 8 dígitos cuando se registra")
    private String dni;

    @Size(max = 15)
    private String phone;

    @Size(max = 10)
    private String sex;

    @Size(max = 200)
    private String damageType;
}
