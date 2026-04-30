package com.caritas.grd.dto.user;

import com.caritas.grd.model.Role;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserDto {

    private Long id;
    private String fullName;
    private String dni;
    private String phone;
    private String email;
    private Role role;
    private Long parishId;
    private String parishName;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
