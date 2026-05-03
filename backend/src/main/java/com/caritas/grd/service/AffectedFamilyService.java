package com.caritas.grd.service;

import com.caritas.grd.dto.family.AffectedFamilyCreateDto;
import com.caritas.grd.dto.family.AffectedFamilyDto;
import com.caritas.grd.dto.person.AffectedPersonCreateDto;
import com.caritas.grd.dto.person.AffectedPersonDto;
import com.caritas.grd.exception.ResourceNotFoundException;
import com.caritas.grd.model.AffectedFamily;
import com.caritas.grd.model.AffectedPerson;
import com.caritas.grd.model.Incident;
import com.caritas.grd.repository.AffectedFamilyRepository;
import com.caritas.grd.repository.AffectedPersonRepository;
import com.caritas.grd.repository.IncidentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AffectedFamilyService {

    private final AffectedFamilyRepository familyRepository;
    private final AffectedPersonRepository personRepository;
    private final IncidentRepository incidentRepository;
    private final AffectedPersonService personService;

    // ── Families ─────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<AffectedFamilyDto> getByIncident(Long incidentId) {
        if (!incidentRepository.existsById(incidentId))
            throw new ResourceNotFoundException("Incident", "id", incidentId);
        return familyRepository.findByIncidentIdOrderByCreatedAtAsc(incidentId)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional
    public AffectedFamilyDto createFamily(Long incidentId, AffectedFamilyCreateDto dto) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new ResourceNotFoundException("Incident", "id", incidentId));

        AffectedFamily family = AffectedFamily.builder()
                .incident(incident)
                .name(dto.getName())
                .address(dto.getAddress())
                .observations(dto.getObservations())
                .build();

        return mapToDto(familyRepository.save(family));
    }

    @Transactional
    public void deleteFamily(Long incidentId, Long familyId) {
        AffectedFamily family = familyRepository.findByIdAndIncidentId(familyId, incidentId)
                .orElseThrow(() -> new ResourceNotFoundException("AffectedFamily", "id", familyId));
        familyRepository.delete(family);
    }

    // ── Members ──────────────────────────────────────────────────────────────

    @Transactional
    public AffectedPersonDto addMember(Long incidentId, Long familyId, AffectedPersonCreateDto dto) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new ResourceNotFoundException("Incident", "id", incidentId));
        AffectedFamily family = familyRepository.findByIdAndIncidentId(familyId, incidentId)
                .orElseThrow(() -> new ResourceNotFoundException("AffectedFamily", "id", familyId));

        String dni = normalizeDni(dto.getDni());

        AffectedPerson person = AffectedPerson.builder()
                .incident(incident)
                .family(family)
                .fullName(dto.getFullName())
                .birthDate(dto.getBirthDate())
                .dni(dni)
                .phone(blankToNull(dto.getPhone()))
                .sex(blankToNull(dto.getSex()))
                .damageType(blankToNull(dto.getDamageType()))
                .build();

        return personService.mapToDto(personRepository.save(person));
    }

    @Transactional
    public void removeMember(Long incidentId, Long familyId, Long personId) {
        // Ensure family belongs to this incident
        familyRepository.findByIdAndIncidentId(familyId, incidentId)
                .orElseThrow(() -> new ResourceNotFoundException("AffectedFamily", "id", familyId));
        AffectedPerson person = personRepository.findByIdAndIncidentId(personId, incidentId)
                .orElseThrow(() -> new ResourceNotFoundException("AffectedPerson", "id", personId));
        personRepository.delete(person);
    }

    // ── Mapping ───────────────────────────────────────────────────────────────

    private AffectedFamilyDto mapToDto(AffectedFamily f) {
        AffectedFamilyDto dto = new AffectedFamilyDto();
        dto.setId(f.getId());
        dto.setIncidentId(f.getIncident() != null ? f.getIncident().getId() : null);
        dto.setName(f.getName());
        dto.setAddress(f.getAddress());
        dto.setObservations(f.getObservations());
        dto.setCreatedAt(f.getCreatedAt());
        dto.setMembers(
            f.getMembers().stream().map(personService::mapToDto).collect(Collectors.toList())
        );
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
