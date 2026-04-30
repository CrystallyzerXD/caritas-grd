package com.caritas.grd.service;

import com.caritas.grd.dto.catalog.DistrictDto;
import com.caritas.grd.dto.catalog.EventTypeDto;
import com.caritas.grd.dto.catalog.ParishDto;
import com.caritas.grd.exception.BadRequestException;
import com.caritas.grd.exception.ResourceNotFoundException;
import com.caritas.grd.model.District;
import com.caritas.grd.model.EventType;
import com.caritas.grd.model.Parish;
import com.caritas.grd.repository.DistrictRepository;
import com.caritas.grd.repository.EventTypeRepository;
import com.caritas.grd.repository.ParishRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CatalogService {

    private final EventTypeRepository eventTypeRepository;
    private final DistrictRepository districtRepository;
    private final ParishRepository parishRepository;

    // Event Types
    @Transactional(readOnly = true)
    public List<EventTypeDto> getEventTypes() {
        return eventTypeRepository.findByActiveTrue().stream()
                .map(this::mapEventTypeToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public EventTypeDto createEventType(EventTypeDto dto) {
        if (eventTypeRepository.existsByName(dto.getName())) {
            throw new BadRequestException("Event type already exists: " + dto.getName());
        }
        EventType eventType = EventType.builder()
                .name(dto.getName())
                .code(dto.getCode())
                .active(true)
                .build();
        eventType = eventTypeRepository.save(eventType);
        return mapEventTypeToDto(eventType);
    }

    @Transactional
    public EventTypeDto updateEventType(Long id, EventTypeDto dto) {
        EventType eventType = eventTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("EventType", "id", id));
        if (dto.getName() != null) eventType.setName(dto.getName());
        if (dto.getCode() != null) eventType.setCode(dto.getCode());
        if (dto.getActive() != null) eventType.setActive(dto.getActive());
        eventType = eventTypeRepository.save(eventType);
        return mapEventTypeToDto(eventType);
    }

    // Districts
    @Transactional(readOnly = true)
    public List<DistrictDto> getDistricts() {
        return districtRepository.findByActiveTrueOrderByName().stream()
                .map(this::mapDistrictToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public DistrictDto createDistrict(DistrictDto dto) {
        if (districtRepository.existsByName(dto.getName())) {
            throw new BadRequestException("District already exists: " + dto.getName());
        }
        District district = District.builder()
                .name(dto.getName())
                .province(dto.getProvince())
                .active(true)
                .build();
        district = districtRepository.save(district);
        return mapDistrictToDto(district);
    }

    // Parishes
    @Transactional(readOnly = true)
    public List<ParishDto> getParishes(Long districtId) {
        List<Parish> parishes;
        if (districtId != null) {
            parishes = parishRepository.findByDistrictIdAndActiveTrue(districtId);
        } else {
            parishes = parishRepository.findByActiveTrueOrderByName();
        }
        return parishes.stream().map(this::mapParishToDto).collect(Collectors.toList());
    }

    @Transactional
    public ParishDto createParish(ParishDto dto) {
        District district = null;
        if (dto.getDistrictId() != null) {
            district = districtRepository.findById(dto.getDistrictId())
                    .orElseThrow(() -> new ResourceNotFoundException("District", "id", dto.getDistrictId()));
        }
        Parish parish = Parish.builder()
                .name(dto.getName())
                .district(district)
                .active(true)
                .build();
        parish = parishRepository.save(parish);
        return mapParishToDto(parish);
    }

    private EventTypeDto mapEventTypeToDto(EventType et) {
        EventTypeDto dto = new EventTypeDto();
        dto.setId(et.getId());
        dto.setName(et.getName());
        dto.setCode(et.getCode());
        dto.setActive(et.getActive());
        dto.setCreatedAt(et.getCreatedAt());
        return dto;
    }

    private DistrictDto mapDistrictToDto(District d) {
        DistrictDto dto = new DistrictDto();
        dto.setId(d.getId());
        dto.setName(d.getName());
        dto.setProvince(d.getProvince());
        dto.setActive(d.getActive());
        return dto;
    }

    private ParishDto mapParishToDto(Parish p) {
        ParishDto dto = new ParishDto();
        dto.setId(p.getId());
        dto.setName(p.getName());
        dto.setActive(p.getActive());
        if (p.getDistrict() != null) {
            dto.setDistrictId(p.getDistrict().getId());
            dto.setDistrictName(p.getDistrict().getName());
        }
        return dto;
    }
}
