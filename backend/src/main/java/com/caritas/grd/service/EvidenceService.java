package com.caritas.grd.service;

import com.caritas.grd.dto.evidence.EvidenceDto;
import com.caritas.grd.exception.BadRequestException;
import com.caritas.grd.exception.ResourceNotFoundException;
import com.caritas.grd.model.Evidence;
import com.caritas.grd.model.EvidenceType;
import com.caritas.grd.model.Incident;
import com.caritas.grd.model.User;
import com.caritas.grd.repository.EvidenceRepository;
import com.caritas.grd.repository.IncidentRepository;
import com.caritas.grd.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EvidenceService {

    private final EvidenceRepository evidenceRepository;
    private final IncidentRepository incidentRepository;
    private final UserRepository userRepository;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Transactional(readOnly = true)
    public List<EvidenceDto> getByIncident(Long incidentId) {
        if (!incidentRepository.existsById(incidentId)) {
            throw new ResourceNotFoundException("Incident", "id", incidentId);
        }
        return evidenceRepository.findByIncidentId(incidentId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public EvidenceDto uploadEvidence(Long incidentId, MultipartFile file,
                                      String description, String uploaderEmail) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new ResourceNotFoundException("Incident", "id", incidentId));

        User uploader = userRepository.findByEmail(uploaderEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", uploaderEmail));

        String fileUrl = storeFile(file, incidentId);
        EvidenceType fileType = determineFileType(file.getOriginalFilename(),
                file.getContentType());

        Evidence evidence = Evidence.builder()
                .incident(incident)
                .fileUrl(fileUrl)
                .fileType(fileType)
                .description(description)
                .uploadedBy(uploader)
                .build();

        evidence = evidenceRepository.save(evidence);
        return mapToDto(evidence);
    }

    @Transactional
    public void deleteEvidence(Long incidentId, Long evidenceId) {
        Evidence evidence = evidenceRepository.findByIdAndIncidentId(evidenceId, incidentId)
                .orElseThrow(() -> new ResourceNotFoundException("Evidence", "id", evidenceId));

        // Attempt to delete physical file
        try {
            Path filePath = Paths.get(evidence.getFileUrl());
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            log.warn("Could not delete physical file: {}", evidence.getFileUrl());
        }

        evidenceRepository.delete(evidence);
    }

    private String storeFile(MultipartFile file, Long incidentId) {
        if (file.isEmpty()) {
            throw new BadRequestException("Cannot upload empty file");
        }

        try {
            Path uploadPath = Paths.get(uploadDir, "incidents", String.valueOf(incidentId));
            Files.createDirectories(uploadPath);

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String fileName = UUID.randomUUID().toString() + extension;
            Path targetLocation = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return uploadPath.toString().replace("\\", "/") + "/" + fileName;
        } catch (IOException ex) {
            throw new BadRequestException("Could not store file: " + ex.getMessage());
        }
    }

    private EvidenceType determineFileType(String filename, String contentType) {
        if (contentType != null) {
            if (contentType.startsWith("image/")) return EvidenceType.PHOTO;
            if (contentType.startsWith("video/")) return EvidenceType.VIDEO;
        }
        if (filename != null) {
            String lower = filename.toLowerCase();
            if (lower.endsWith(".jpg") || lower.endsWith(".jpeg") ||
                lower.endsWith(".png") || lower.endsWith(".gif") ||
                lower.endsWith(".webp")) return EvidenceType.PHOTO;
            if (lower.endsWith(".mp4") || lower.endsWith(".avi") ||
                lower.endsWith(".mov") || lower.endsWith(".mkv")) return EvidenceType.VIDEO;
        }
        return EvidenceType.DOCUMENT;
    }

    public EvidenceDto mapToDto(Evidence evidence) {
        EvidenceDto dto = new EvidenceDto();
        dto.setId(evidence.getId());
        dto.setIncidentId(evidence.getIncident() != null ? evidence.getIncident().getId() : null);
        dto.setFileUrl(evidence.getFileUrl());
        dto.setFileType(evidence.getFileType());
        dto.setDescription(evidence.getDescription());
        if (evidence.getUploadedBy() != null) {
            dto.setUploadedById(evidence.getUploadedBy().getId());
            dto.setUploadedByName(evidence.getUploadedBy().getFullName());
        }
        dto.setCreatedAt(evidence.getCreatedAt());
        return dto;
    }
}
