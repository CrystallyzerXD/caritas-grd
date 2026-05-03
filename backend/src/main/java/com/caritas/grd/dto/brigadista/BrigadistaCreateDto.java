package com.caritas.grd.dto.brigadista;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BrigadistaCreateDto {
    @NotBlank
    private String fullName;
    private String dni;
    private String phone;
    private String email;
    private Long parishId;
    private String pastoralRole;
    private Boolean available;
    private Double latitude;
    private Double longitude;
    private Boolean active;
    private String observations;
}
