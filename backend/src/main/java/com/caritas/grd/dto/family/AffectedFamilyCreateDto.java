package com.caritas.grd.dto.family;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AffectedFamilyCreateDto {

    @Size(max = 200)
    private String name;        // optional family name

    @Size(max = 300)
    private String address;

    private String observations;
}
