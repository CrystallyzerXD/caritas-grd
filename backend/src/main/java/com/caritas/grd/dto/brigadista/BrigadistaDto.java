package com.caritas.grd.dto.brigadista;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BrigadistaDto {
    private Long id;
    private String fullName;
    private String dni;
    private String phone;
    private String email;
    private Long parishId;
    private String parish;
    private String pastoralRole;
    private Boolean available;
    private Double latitude;
    private Double longitude;
    private Boolean active;
    private String observations;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
