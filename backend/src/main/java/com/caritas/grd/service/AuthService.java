package com.caritas.grd.service;

import com.caritas.grd.dto.auth.LoginRequest;
import com.caritas.grd.dto.auth.LoginResponse;
import com.caritas.grd.dto.auth.RegisterRequest;
import com.caritas.grd.dto.user.UserDto;
import com.caritas.grd.exception.BadRequestException;
import com.caritas.grd.model.Parish;
import com.caritas.grd.model.User;
import com.caritas.grd.repository.ParishRepository;
import com.caritas.grd.repository.UserRepository;
import com.caritas.grd.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final ParishRepository parishRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmailAndActiveTrue(request.getEmail())
                .orElseThrow(() -> new BadRequestException("User not found or inactive"));

        String token = jwtTokenProvider.generateToken(user);

        return LoginResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .expiresIn(jwtTokenProvider.getExpirationMs())
                .build();
    }

    @Transactional
    public UserDto register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already in use: " + request.getEmail());
        }
        if (request.getDni() != null && userRepository.existsByDni(request.getDni())) {
            throw new BadRequestException("DNI already registered: " + request.getDni());
        }

        Parish parish = null;
        if (request.getParishId() != null) {
            parish = parishRepository.findById(request.getParishId())
                    .orElse(null);
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .dni(request.getDni())
                .phone(request.getPhone())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .parish(parish)
                .active(true)
                .build();

        user = userRepository.save(user);
        return mapToDto(user);
    }

    private UserDto mapToDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setFullName(user.getFullName());
        dto.setDni(user.getDni());
        dto.setPhone(user.getPhone());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setActive(user.getActive());
        dto.setCreatedAt(user.getCreatedAt());
        if (user.getParish() != null) {
            dto.setParishId(user.getParish().getId());
            dto.setParishName(user.getParish().getName());
        }
        return dto;
    }
}
