package com.caritas.grd.dto.evidence;

import com.caritas.grd.model.EvidenceType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class EvidenceDto {

    private Long id;
    private Long incidentId;
    private String fileUrl;
    private EvidenceType fileType;
    private String description;
    private Long uploadedById;
    private String uploadedByName;
    private LocalDateTime createdAt;
}
