package com.caritas.grd.dto.auth;

import com.caritas.grd.model.Role;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Full name is required")
    @Size(max = 200)
    private String fullName;

    @Size(min = 8, max = 8, message = "DNI must be 8 digits")
    private String dni;

    @Size(max = 15)
    private String phone;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotNull(message = "Role is required")
    private Role role;

    private Long parishId;
}
