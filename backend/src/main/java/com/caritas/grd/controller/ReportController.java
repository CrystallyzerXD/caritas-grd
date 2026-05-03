package com.caritas.grd.controller;

import com.caritas.grd.dto.ApiResponse;
import com.caritas.grd.dto.report.DashboardDto;
import com.caritas.grd.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Slf4j
public class ReportController {

    private final ReportService reportService;

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss");
    private static final MediaType EXCEL_MEDIA_TYPE =
            MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('ADMIN','GRD_SPECIALIST','BRIGADISTA','COMITE_DONACIONES','AUTHORIZED_USER','JEFA_OGP')")
    public ResponseEntity<ApiResponse<DashboardDto>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.success(reportService.getDashboard()));
    }

    @GetMapping("/incidents/excel")
    @PreAuthorize("hasAnyRole('ADMIN','GRD_SPECIALIST','AUTHORIZED_USER')")
    public ResponseEntity<byte[]> exportIncidentsExcel() throws IOException {
        byte[] data = reportService.generateIncidentsExcel();
        String filename = "incidentes_grd_" + LocalDateTime.now().format(FMT) + ".xlsx";

        return ResponseEntity.ok()
                .contentType(EXCEL_MEDIA_TYPE)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + filename + "\"")
                .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(data.length))
                .body(data);
    }

    @GetMapping("/affected-persons/excel")
    @PreAuthorize("hasAnyRole('ADMIN','GRD_SPECIALIST','AUTHORIZED_USER')")
    public ResponseEntity<byte[]> exportAffectedPersonsExcel() throws IOException {
        byte[] data = reportService.generateAffectedPersonsExcel();
        String filename = "personas_afectadas_" + LocalDateTime.now().format(FMT) + ".xlsx";

        return ResponseEntity.ok()
                .contentType(EXCEL_MEDIA_TYPE)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + filename + "\"")
                .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(data.length))
                .body(data);
    }

}
