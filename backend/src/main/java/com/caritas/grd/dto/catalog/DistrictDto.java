package com.caritas.grd.dto.catalog;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DistrictDto {

    private Long id;

    @NotBlank(message = "Name is required")
    private String name;

    private String province;
    private Boolean active;
}
