package com.caritas.grd.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "incidents")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Incident {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_type_id", nullable = false)
    private EventType eventType;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String cause;

    @Column(columnDefinition = "TEXT")
    private String losses;

    @Column(name = "actions_taken", columnDefinition = "TEXT")
    private String actionsTaken;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private IncidentStatus status = IncidentStatus.OPEN;

    private Double latitude;
    private Double longitude;

    @Column(length = 300)
    private String address;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "district_id")
    private District district;

    @Column(name = "incident_date")
    private LocalDate incidentDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id")
    private User createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by_id")
    private User updatedBy;

    @OneToMany(mappedBy = "incident", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<AffectedPerson> affectedPersons = new ArrayList<>();

    @OneToMany(mappedBy = "incident", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Evidence> evidences = new ArrayList<>();

    @Column(name = "case_code", unique = true, length = 20)
    private String caseCode;

    @Column(name = "report_date")
    private LocalDate reportDate;

    @Column(name = "alert_source", columnDefinition = "TEXT")
    private String alertSource;

    @Enumerated(EnumType.STRING)
    @Column(name = "affectation_level", length = 20)
    private AffectationLevel affectationLevel;

    @Column(name = "affected_families")
    private Integer affectedFamilies;

    @Column(name = "vulnerable_groups", columnDefinition = "TEXT")
    private String vulnerableGroups;

    @Column(name = "urgent_needs", columnDefinition = "TEXT")
    private String urgentNeeds;

    @Enumerated(EnumType.STRING)
    @Column(name = "social_risk_assessment", length = 20)
    private SocialRiskLevel socialRiskAssessment;

    @Column(name = "articulated_institutions", columnDefinition = "TEXT")
    private String articulatedInstitutions;

    @OneToMany(mappedBy = "incident", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<IncidentReport> reports = new ArrayList<>();

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
