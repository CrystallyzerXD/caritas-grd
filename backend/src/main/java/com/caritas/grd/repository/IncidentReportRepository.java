package com.caritas.grd.repository;

import com.caritas.grd.model.IncidentReport;
import com.caritas.grd.model.ReportType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface IncidentReportRepository extends JpaRepository<IncidentReport, Long> {
    List<IncidentReport> findByIncidentIdOrderByCreatedAtDesc(Long incidentId);
    List<IncidentReport> findByIncidentIdAndReportType(Long incidentId, ReportType reportType);
    long countByIncidentId(Long incidentId);
    boolean existsByDeliveryCode(String deliveryCode);
    @Query("SELECT MAX(r.id) FROM IncidentReport r WHERE r.reportType = 'ENTREGA_DONACION'")
    Long findMaxDeliveryId();
}
