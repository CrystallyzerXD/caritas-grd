package com.caritas.grd.dto.catalog;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ParishDto {

    private Long id;

    @NotBlank(message = "Name is required")
    private String name;

    private Long districtId;
    private String districtName;
    private Boolean active;
}
