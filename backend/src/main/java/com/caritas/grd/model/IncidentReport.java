package com.caritas.grd.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "incident_reports")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class IncidentReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "incident_id", nullable = false)
    private Incident incident;

    @Enumerated(EnumType.STRING)
    @Column(name = "report_type", length = 30, nullable = false)
    private ReportType reportType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id")
    private User createdBy;

    @Column(columnDefinition = "TEXT")
    private String observations;

    // PRIMERA_VISITA
    @Column(name = "visit_motivo", columnDefinition = "TEXT")
    private String visitMotivo;
    @Column(name = "visit_objectives", columnDefinition = "TEXT")
    private String visitObjectives;
    @Column(name = "event_description", columnDefinition = "TEXT")
    private String eventDescription;
    @Column(name = "habitability_conditions", columnDefinition = "TEXT")
    private String habitabilityConditions;
    @Column(name = "family_composition", columnDefinition = "TEXT")
    private String familyComposition;
    @Column(name = "vulnerability_level", length = 50)
    private String vulnerabilityLevel;
    @Column(name = "priority_needs", columnDefinition = "TEXT")
    private String priorityNeeds;
    @Column(name = "initial_recommendation", columnDefinition = "TEXT")
    private String initialRecommendation;

    // ENTREGA_DONACION
    @Column(name = "delivery_code", length = 20)
    private String deliveryCode;
    @Column(name = "delivery_date")
    private LocalDate deliveryDate;
    @Column(name = "delivery_place", length = 300)
    private String deliveryPlace;
    @Column(name = "beneficiary_name", length = 200)
    private String beneficiaryName;
    @Column(name = "beneficiary_dni", length = 8)
    private String beneficiaryDni;
    @Column(name = "aid_type", columnDefinition = "TEXT")
    private String aidType;
    @Column(name = "kit_composition", columnDefinition = "TEXT")
    private String kitComposition;
    @Column(name = "delivery_responsible", length = 200)
    private String deliveryResponsible;
    @Column(name = "parroquial_actor", length = 200)
    private String parroquialActor;
    @Column(name = "delivery_evidence", columnDefinition = "TEXT")
    private String deliveryEvidence;

    // SEGUIMIENTO
    @Column(name = "follow_up_date")
    private LocalDate followUpDate;
    @Column(name = "follow_up_medium", length = 20)
    private String followUpMedium;
    @Column(name = "current_situation", length = 20)
    private String currentSituation;
    @Column(name = "aid_usage", columnDefinition = "TEXT")
    private String aidUsage;
    @Column(name = "persistent_needs", columnDefinition = "TEXT")
    private String persistentNeeds;
    @Column(name = "referrals_made", columnDefinition = "TEXT")
    private String referralsMade;
    @Column(name = "technical_recommendation", columnDefinition = "TEXT")
    private String technicalRecommendation;
    @Column(name = "final_status", length = 30)
    private String finalStatus;

    @CreatedDate @Column(updatable = false)
    private LocalDateTime createdAt;
}
