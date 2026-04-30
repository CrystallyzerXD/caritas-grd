package com.caritas.grd.dto.catalog;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class EventTypeDto {

    private Long id;

    @NotBlank(message = "Name is required")
    private String name;

    private String code;
    private Boolean active;
    private LocalDateTime createdAt;
}
