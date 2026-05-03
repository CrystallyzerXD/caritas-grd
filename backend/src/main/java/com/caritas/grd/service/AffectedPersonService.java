package com.caritas.grd.service;

import com.caritas.grd.dto.person.AffectedPersonCreateDto;
import com.caritas.grd.dto.person.AffectedPersonDto;
import com.caritas.grd.exception.ResourceNotFoundException;
import com.caritas.grd.model.AffectedPerson;
import com.caritas.grd.model.Incident;
import com.caritas.grd.repository.AffectedPersonRepository;
import com.caritas.grd.repository.IncidentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AffectedPersonService {

    private final AffectedPersonRepository affectedPersonRepository;
    private final IncidentRepository incidentRepository;

    @Transactional(readOnly = true)
    public List<AffectedPersonDto> getByIncident(Long incidentId) {
        if (!incidentRepository.existsById(incidentId)) {
            throw new ResourceNotFoundException("Incident", "id", incidentId);
        }
        return affectedPersonRepository.findByIncidentId(incidentId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public AffectedPersonDto addPerson(Long incidentId, AffectedPersonCreateDto dto) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new ResourceNotFoundException("Incident", "id", incidentId));

        AffectedPerson person = AffectedPerson.builder()
                .incident(incident)
                .fullName(dto.getFullName())
                .birthDate(dto.getBirthDate())
                .dni(normalizeDni(dto.getDni()))
                .phone(blankToNull(dto.getPhone()))
                .sex(blankToNull(dto.getSex()))
                .damageType(blankToNull(dto.getDamageType()))
                .build();

        person = affectedPersonRepository.save(person);
        return mapToDto(person);
    }

    @Transactional
    public AffectedPersonDto updatePerson(Long incidentId, Long personId, AffectedPersonCreateDto dto) {
        AffectedPerson person = affectedPersonRepository.findByIdAndIncidentId(personId, incidentId)
                .orElseThrow(() -> new ResourceNotFoundException("AffectedPerson", "id", personId));

        if (dto.getFullName() != null) person.setFullName(dto.getFullName());
        if (dto.getBirthDate() != null) person.setBirthDate(dto.getBirthDate());
        if (dto.getDni() != null) person.setDni(normalizeDni(dto.getDni()));
        if (dto.getPhone() != null) person.setPhone(blankToNull(dto.getPhone()));
        if (dto.getSex() != null) person.setSex(blankToNull(dto.getSex()));
        if (dto.getDamageType() != null) person.setDamageType(blankToNull(dto.getDamageType()));

        person = affectedPersonRepository.save(person);
        return mapToDto(person);
    }

    @Transactional
    public void deletePerson(Long incidentId, Long personId) {
        AffectedPerson person = affectedPersonRepository.findByIdAndIncidentId(personId, incidentId)
                .orElseThrow(() -> new ResourceNotFoundException("AffectedPerson", "id", personId));
        affectedPersonRepository.delete(person);
    }

    public AffectedPersonDto mapToDto(AffectedPerson person) {
        AffectedPersonDto dto = new AffectedPersonDto();
        dto.setId(person.getId());
        dto.setIncidentId(person.getIncident() != null ? person.getIncident().getId() : null);
        dto.setFamilyId(person.getFamily() != null ? person.getFamily().getId() : null);
        dto.setFullName(person.getFullName());
        dto.setBirthDate(person.getBirthDate());
        dto.setDni(person.getDni());
        dto.setPhone(person.getPhone());
        dto.setSex(person.getSex());
        dto.setDamageType(person.getDamageType());
        dto.setCreatedAt(person.getCreatedAt());
        return dto;
    }

    private static String normalizeDni(String dni) {
        if (dni == null) return null;
        String t = dni.trim();
        return t.isEmpty() ? null : t;
    }

    private static String blankToNull(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }
}
