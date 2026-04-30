package com.caritas.grd.service;

import com.caritas.grd.dto.user.UserCreateDto;
import com.caritas.grd.dto.user.UserDto;
import com.caritas.grd.dto.user.UserUpdateDto;
import com.caritas.grd.exception.BadRequestException;
import com.caritas.grd.exception.ResourceNotFoundException;
import com.caritas.grd.model.Parish;
import com.caritas.grd.model.User;
import com.caritas.grd.repository.ParishRepository;
import com.caritas.grd.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final ParishRepository parishRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public Page<UserDto> getAllUsers(String search, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<User> users;
        if (search != null && !search.isBlank()) {
            users = userRepository.findAllActiveWithSearch(search, pageable);
        } else {
            users = userRepository.findByActiveTrue(pageable);
        }
        return users.map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return mapToDto(user);
    }

    @Transactional(readOnly = true)
    public UserDto getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        return mapToDto(user);
    }

    @Transactional
    public UserDto createUser(UserCreateDto dto, String createdBy) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new BadRequestException("Email already in use: " + dto.getEmail());
        }
        if (dto.getDni() != null && userRepository.existsByDni(dto.getDni())) {
            throw new BadRequestException("DNI already registered: " + dto.getDni());
        }

        Parish parish = null;
        if (dto.getParishId() != null) {
            parish = parishRepository.findById(dto.getParishId()).orElse(null);
        }

        User user = User.builder()
                .fullName(dto.getFullName())
                .dni(dto.getDni())
                .phone(dto.getPhone())
                .email(dto.getEmail())
                .password(passwordEncoder.encode(dto.getPassword()))
                .role(dto.getRole())
                .parish(parish)
                .active(true)
                .build();

        user = userRepository.save(user);
        auditService.log("User", user.getId(), "CREATE", createdBy, null, user.getEmail());
        return mapToDto(user);
    }

    @Transactional
    public UserDto updateUser(Long id, UserUpdateDto dto, String updatedBy) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        if (dto.getFullName() != null) user.setFullName(dto.getFullName());
        if (dto.getDni() != null) user.setDni(dto.getDni());
        if (dto.getPhone() != null) user.setPhone(dto.getPhone());
        if (dto.getEmail() != null && !dto.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(dto.getEmail())) {
                throw new BadRequestException("Email already in use: " + dto.getEmail());
            }
            user.setEmail(dto.getEmail());
        }
        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
        }
        if (dto.getRole() != null) user.setRole(dto.getRole());
        if (dto.getActive() != null) user.setActive(dto.getActive());
        if (dto.getParishId() != null) {
            Parish parish = parishRepository.findById(dto.getParishId()).orElse(null);
            user.setParish(parish);
        }

        user = userRepository.save(user);
        auditService.log("User", user.getId(), "UPDATE", updatedBy, null, user.getEmail());
        return mapToDto(user);
    }

    @Transactional
    public void deleteUser(Long id, String deletedBy) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        user.setActive(false);
        userRepository.save(user);
        auditService.log("User", id, "DELETE", deletedBy, user.getEmail(), null);
    }

    public UserDto mapToDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setFullName(user.getFullName());
        dto.setDni(user.getDni());
        dto.setPhone(user.getPhone());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setActive(user.getActive());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        if (user.getParish() != null) {
            dto.setParishId(user.getParish().getId());
            dto.setParishName(user.getParish().getName());
        }
        return dto;
    }
}
