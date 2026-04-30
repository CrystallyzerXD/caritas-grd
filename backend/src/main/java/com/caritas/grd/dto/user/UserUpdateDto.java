package com.caritas.grd.dto.user;

import com.caritas.grd.model.Role;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class UserUpdateDto {

    @Size(max = 200)
    private String fullName;

    @Size(min = 8, max = 8)
    private String dni;

    @Size(max = 15)
    private String phone;

    @Email
    private String email;

    @Size(min = 6)
    private String password;

    private Role role;

    private Long parishId;

    private Boolean active;
}
