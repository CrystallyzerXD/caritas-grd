package com.caritas.grd.service;

import com.caritas.grd.dto.training.*;
import com.caritas.grd.exception.ResourceNotFoundException;
import com.caritas.grd.model.*;
import com.caritas.grd.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrainingService {

    private final TrainingRepository trainingRepository;
    private final TrainingParticipantRepository participantRepository;
    private final ParishRepository parishRepository;
    private final UserRepository userRepository;

    private String generateTrainingCode() {
        int year = Year.now().getValue();
        Long maxId = trainingRepository.findMaxId();
        long seq = (maxId == null ? 0L : maxId) + 1;
        return String.format("TRN-%d-%04d", year, seq);
    }

    @Transactional(readOnly = true)
    public Page<TrainingDto> getTrainings(TrainingStatus status, Long parishId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return trainingRepository.findWithFilters(status, parishId, pageable).map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public TrainingDto getById(Long id) {
        Training t = trainingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Training", "id", id));
        return mapToDto(t);
    }

    @Transactional
    public TrainingDto create(TrainingCreateDto dto) {
        Training training = Training.builder()
                .trainingCode(generateTrainingCode())
                .name(dto.getName())
                .modality(dto.getModality())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .status(dto.getStatus() != null ? dto.getStatus() : TrainingStatus.PROGRAMADO)
                .description(dto.getDescription())
                .build();

        if (dto.getParishId() != null) {
            parishRepository.findById(dto.getParishId()).ifPresent(training::setParish);
        }
        if (dto.getResponsibleId() != null) {
            userRepository.findById(dto.getResponsibleId()).ifPresent(training::setResponsible);
        }

        return mapToDto(trainingRepository.save(training));
    }

    @Transactional
    public TrainingDto update(Long id, TrainingUpdateDto dto) {
        Training training = trainingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Training", "id", id));

        if (dto.getName() != null) training.setName(dto.getName());
        if (dto.getModality() != null) training.setModality(dto.getModality());
        if (dto.getStartDate() != null) training.setStartDate(dto.getStartDate());
        if (dto.getEndDate() != null) training.setEndDate(dto.getEndDate());
        if (dto.getStatus() != null) training.setStatus(dto.getStatus());
        if (dto.getDescription() != null) training.setDescription(dto.getDescription());
        if (dto.getParishId() != null) {
            parishRepository.findById(dto.getParishId()).ifPresent(training::setParish);
        }
        if (dto.getResponsibleId() != null) {
            userRepository.findById(dto.getResponsibleId()).ifPresent(training::setResponsible);
        }

        return mapToDto(trainingRepository.save(training));
    }

    @Transactional
    public void delete(Long id) {
        if (!trainingRepository.existsById(id))
            throw new ResourceNotFoundException("Training", "id", id);
        trainingRepository.deleteById(id);
    }

    // Participants
    @Transactional(readOnly = true)
    public List<TrainingParticipantDto> getParticipants(Long trainingId) {
        return participantRepository.findByTrainingId(trainingId)
                .stream().map(this::mapParticipantToDto).collect(Collectors.toList());
    }

    @Transactional
    public TrainingParticipantDto addParticipant(Long trainingId, TrainingParticipantCreateDto dto) {
        Training training = trainingRepository.findById(trainingId)
                .orElseThrow(() -> new ResourceNotFoundException("Training", "id", trainingId));

        TrainingParticipant p = TrainingParticipant.builder()
                .training(training)
                .dni(dto.getDni())
                .fullName(dto.getFullName())
                .age(dto.getAge())
                .phone(dto.getPhone())
                .email(dto.getEmail())
                .pastoralRole(dto.getPastoralRole())
                .attendance(dto.getAttendance() != null ? dto.getAttendance() : AttendanceStatus.PRESENTE)
                .initialScore(dto.getInitialScore())
                .finalScore(dto.getFinalScore())
                .certificationStatus(dto.getCertificationStatus() != null ? dto.getCertificationStatus() : CertificationStatus.PENDIENTE)
                .observations(dto.getObservations())
                .build();

        return mapParticipantToDto(participantRepository.save(p));
    }

    @Transactional
    public TrainingParticipantDto updateParticipant(Long participantId, TrainingParticipantCreateDto dto) {
        TrainingParticipant p = participantRepository.findById(participantId)
                .orElseThrow(() -> new ResourceNotFoundException("TrainingParticipant", "id", participantId));

        if (dto.getDni() != null) p.setDni(dto.getDni());
        if (dto.getFullName() != null) p.setFullName(dto.getFullName());
        if (dto.getAge() != null) p.setAge(dto.getAge());
        if (dto.getPhone() != null) p.setPhone(dto.getPhone());
        if (dto.getEmail() != null) p.setEmail(dto.getEmail());
        if (dto.getPastoralRole() != null) p.setPastoralRole(dto.getPastoralRole());
        if (dto.getAttendance() != null) p.setAttendance(dto.getAttendance());
        if (dto.getInitialScore() != null) p.setInitialScore(dto.getInitialScore());
        if (dto.getFinalScore() != null) p.setFinalScore(dto.getFinalScore());
        if (dto.getCertificationStatus() != null) p.setCertificationStatus(dto.getCertificationStatus());
        if (dto.getObservations() != null) p.setObservations(dto.getObservations());

        return mapParticipantToDto(participantRepository.save(p));
    }

    @Transactional
    public void deleteParticipant(Long participantId) {
        if (!participantRepository.existsById(participantId))
            throw new ResourceNotFoundException("TrainingParticipant", "id", participantId);
        participantRepository.deleteById(participantId);
    }

    private TrainingDto mapToDto(Training t) {
        TrainingDto dto = new TrainingDto();
        dto.setId(t.getId());
        dto.setTrainingCode(t.getTrainingCode());
        dto.setName(t.getName());
        dto.setModality(t.getModality());
        dto.setStartDate(t.getStartDate());
        dto.setEndDate(t.getEndDate());
        if (t.getParish() != null) { dto.setParishId(t.getParish().getId()); dto.setParish(t.getParish().getName()); }
        if (t.getResponsible() != null) { dto.setResponsibleId(t.getResponsible().getId()); dto.setResponsible(t.getResponsible().getFullName()); }
        dto.setStatus(t.getStatus());
        dto.setDescription(t.getDescription());
        dto.setParticipantCount(t.getParticipants() != null ? t.getParticipants().size() : 0);
        dto.setCreatedAt(t.getCreatedAt());
        dto.setUpdatedAt(t.getUpdatedAt());
        return dto;
    }

    private TrainingParticipantDto mapParticipantToDto(TrainingParticipant p) {
        TrainingParticipantDto dto = new TrainingParticipantDto();
        dto.setId(p.getId());
        dto.setTrainingId(p.getTraining().getId());
        dto.setDni(p.getDni());
        dto.setFullName(p.getFullName());
        dto.setAge(p.getAge());
        dto.setPhone(p.getPhone());
        dto.setEmail(p.getEmail());
        dto.setPastoralRole(p.getPastoralRole());
        dto.setAttendance(p.getAttendance());
        dto.setInitialScore(p.getInitialScore());
        dto.setFinalScore(p.getFinalScore());
        dto.setCertificationStatus(p.getCertificationStatus());
        dto.setObservations(p.getObservations());
        dto.setCreatedAt(p.getCreatedAt());
        return dto;
    }
}
