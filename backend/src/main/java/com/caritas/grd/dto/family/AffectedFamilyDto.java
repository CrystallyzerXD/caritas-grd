package com.caritas.grd.dto.family;

import com.caritas.grd.dto.person.AffectedPersonDto;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class AffectedFamilyDto {

    private Long id;
    private Long incidentId;
    private String name;
    private String address;
    private String observations;
    private List<AffectedPersonDto> members;
    private LocalDateTime createdAt;
}
