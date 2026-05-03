package com.caritas.grd.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "training_participants")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TrainingParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "training_id", nullable = false)
    private Training training;

    @Column(length = 8)
    private String dni;

    @Column(name = "full_name", nullable = false, length = 200)
    private String fullName;

    private Integer age;

    @Column(length = 15)
    private String phone;

    @Column(length = 150)
    private String email;

    @Column(name = "pastoral_role", length = 100)
    private String pastoralRole;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default
    private AttendanceStatus attendance = AttendanceStatus.PRESENTE;

    @Column(name = "initial_score")
    private Double initialScore;

    @Column(name = "final_score")
    private Double finalScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "certification_status", length = 20)
    @Builder.Default
    private CertificationStatus certificationStatus = CertificationStatus.PENDIENTE;

    @Column(columnDefinition = "TEXT")
    private String observations;

    @CreatedDate @Column(updatable = false)
    private LocalDateTime createdAt;
}
