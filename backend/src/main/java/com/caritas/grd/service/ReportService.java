package com.caritas.grd.service;

import com.caritas.grd.dto.report.DashboardDto;
import com.caritas.grd.model.*;
import com.caritas.grd.repository.*;
import com.caritas.grd.model.CertificationStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {

    private final IncidentRepository incidentRepository;
    private final AffectedPersonRepository affectedPersonRepository;
    private final TrainingRepository trainingRepository;
    private final TrainingParticipantRepository trainingParticipantRepository;
    private final BrigadistaRepository brigadistaRepository;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter DT_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    @Transactional(readOnly = true)
    public DashboardDto getDashboard() {
        Map<String, Long> byEventType = incidentRepository.countByEventType().stream()
                .collect(Collectors.toMap(
                        row -> (String) row[0],
                        row -> (Long) row[1],
                        (a, b) -> a,
                        LinkedHashMap::new
                ));

        Map<String, Long> byDistrict = incidentRepository.countByDistrict().stream()
                .collect(Collectors.toMap(
                        row -> (String) row[0],
                        row -> (Long) row[1],
                        (a, b) -> a,
                        LinkedHashMap::new
                ));

        return DashboardDto.builder()
                .totalIncidents(incidentRepository.count())
                .openIncidents(incidentRepository.countByStatus(IncidentStatus.OPEN))
                .inProgressIncidents(incidentRepository.countByStatus(IncidentStatus.IN_PROGRESS))
                .closedIncidents(incidentRepository.countByStatus(IncidentStatus.CLOSED))
                .followUpIncidents(incidentRepository.countByStatus(IncidentStatus.FOLLOW_UP))
                .totalAffectedPersons(affectedPersonRepository.count())
                .incidentsByEventType(byEventType)
                .incidentsByDistrict(byDistrict)
                .totalTrainings(trainingRepository.count())
                .totalParticipants(trainingParticipantRepository.count())
                .certifiedParticipants(trainingParticipantRepository.countByCertificationStatus(CertificationStatus.APROBADO))
                .totalBrigadistas(brigadistaRepository.count())
                .activeBrigadistas(brigadistaRepository.countByActiveTrue())
                .build();
    }

    @Transactional(readOnly = true)
    public byte[] generateIncidentsExcel() throws IOException {
        List<Incident> incidents = incidentRepository.findAllForReport();

        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Incidentes GRD");
            sheet.setColumnWidth(0, 4000);
            sheet.setColumnWidth(1, 6000);
            sheet.setColumnWidth(2, 10000);
            sheet.setColumnWidth(3, 6000);
            sheet.setColumnWidth(4, 4000);
            sheet.setColumnWidth(5, 6000);
            sheet.setColumnWidth(6, 4000);
            sheet.setColumnWidth(7, 5000);
            sheet.setColumnWidth(8, 4000);

            // Title row
            Row titleRow = sheet.createRow(0);
            CellStyle titleStyle = createTitleStyle(workbook);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("REPORTE DE INCIDENTES GRD - CÁRITAS LIMA");
            titleCell.setCellStyle(titleStyle);
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 8));

            // Header row
            Row headerRow = sheet.createRow(1);
            CellStyle headerStyle = createHeaderStyle(workbook);
            String[] headers = {"ID", "Tipo de Evento", "Descripción", "Estado",
                    "Fecha Incidente", "Distrito", "Latitud", "Longitud", "Registrado Por"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Data rows
            CellStyle dataStyle = createDataStyle(workbook);
            CellStyle altStyle = createAltDataStyle(workbook);
            int rowNum = 2;
            for (Incident incident : incidents) {
                Row row = sheet.createRow(rowNum);
                CellStyle style = (rowNum % 2 == 0) ? dataStyle : altStyle;

                createCell(row, 0, String.valueOf(incident.getId()), style);
                createCell(row, 1, incident.getEventType() != null
                        ? incident.getEventType().getName() : "", style);
                createCell(row, 2, truncate(incident.getDescription(), 200), style);
                createCell(row, 3, incident.getStatus() != null
                        ? incident.getStatus().name() : "", style);
                createCell(row, 4, incident.getIncidentDate() != null
                        ? incident.getIncidentDate().format(DATE_FMT) : "", style);
                createCell(row, 5, incident.getDistrict() != null
                        ? incident.getDistrict().getName() : "", style);
                createCell(row, 6, incident.getLatitude() != null
                        ? String.valueOf(incident.getLatitude()) : "", style);
                createCell(row, 7, incident.getLongitude() != null
                        ? String.valueOf(incident.getLongitude()) : "", style);
                createCell(row, 8, incident.getCreatedBy() != null
                        ? incident.getCreatedBy().getFullName() : "", style);
                rowNum++;
            }

            // Summary row
            Row summaryRow = sheet.createRow(rowNum + 1);
            CellStyle summaryStyle = createSummaryStyle(workbook);
            Cell summaryCell = summaryRow.createCell(0);
            summaryCell.setCellValue("Total de registros: " + incidents.size());
            summaryCell.setCellStyle(summaryStyle);
            sheet.addMergedRegion(new CellRangeAddress(rowNum + 1, rowNum + 1, 0, 8));

            workbook.write(out);
            return out.toByteArray();
        }
    }

    @Transactional(readOnly = true)
    public byte[] generateAffectedPersonsExcel() throws IOException {
        List<AffectedPerson> persons = affectedPersonRepository.findAllForReport();

        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Personas Afectadas");
            sheet.setColumnWidth(0, 4000);
            sheet.setColumnWidth(1, 4000);
            sheet.setColumnWidth(2, 8000);
            sheet.setColumnWidth(3, 3000);
            sheet.setColumnWidth(4, 5000);
            sheet.setColumnWidth(5, 5000);
            sheet.setColumnWidth(6, 3000);
            sheet.setColumnWidth(7, 7000);

            Row titleRow = sheet.createRow(0);
            CellStyle titleStyle = createTitleStyle(workbook);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("REPORTE DE PERSONAS AFECTADAS - CÁRITAS LIMA");
            titleCell.setCellStyle(titleStyle);
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 7));

            Row headerRow = sheet.createRow(1);
            CellStyle headerStyle = createHeaderStyle(workbook);
            String[] headers = {"ID", "ID Incidente", "Nombre Completo", "F. Nacimiento",
                    "DNI", "Teléfono", "Sexo", "Tipo de Daño"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            CellStyle dataStyle = createDataStyle(workbook);
            CellStyle altStyle = createAltDataStyle(workbook);
            int rowNum = 2;
            for (AffectedPerson person : persons) {
                Row row = sheet.createRow(rowNum);
                CellStyle style = (rowNum % 2 == 0) ? dataStyle : altStyle;

                createCell(row, 0, String.valueOf(person.getId()), style);
                createCell(row, 1, person.getIncident() != null
                        ? String.valueOf(person.getIncident().getId()) : "", style);
                createCell(row, 2, person.getFullName(), style);
                createCell(row, 3, person.getBirthDate() != null
                        ? person.getBirthDate().toString() : "", style);
                createCell(row, 4, nvl(person.getDni()), style);
                createCell(row, 5, nvl(person.getPhone()), style);
                createCell(row, 6, nvl(person.getSex()), style);
                createCell(row, 7, nvl(person.getDamageType()), style);
                rowNum++;
            }

            Row summaryRow = sheet.createRow(rowNum + 1);
            CellStyle summaryStyle = createSummaryStyle(workbook);
            Cell summaryCell = summaryRow.createCell(0);
            summaryCell.setCellValue("Total de registros: " + persons.size());
            summaryCell.setCellStyle(summaryStyle);
            sheet.addMergedRegion(new CellRangeAddress(rowNum + 1, rowNum + 1, 0, 7));

            workbook.write(out);
            return out.toByteArray();
        }
    }

    // --- Excel Style Helpers ---

    private CellStyle createTitleStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 14);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.DARK_RED.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setBorderBottom(BorderStyle.THIN);
        return style;
    }

    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        font.setFontHeightInPoints((short) 11);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.GREY_50_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setBorderBottom(BorderStyle.MEDIUM);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setWrapText(true);
        return style;
    }

    private CellStyle createDataStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setWrapText(true);
        return style;
    }

    private CellStyle createAltDataStyle(Workbook workbook) {
        CellStyle style = createDataStyle(workbook);
        style.setFillForegroundColor(IndexedColors.LIGHT_YELLOW.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        return style;
    }

    private CellStyle createSummaryStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderTop(BorderStyle.MEDIUM);
        return style;
    }

    private void createCell(Row row, int col, String value, CellStyle style) {
        Cell cell = row.createCell(col);
        cell.setCellValue(value != null ? value : "");
        cell.setCellStyle(style);
    }

    private String nvl(String value) {
        return value != null ? value : "";
    }

    private String truncate(String value, int maxLen) {
        if (value == null) return "";
        return value.length() > maxLen ? value.substring(0, maxLen) + "..." : value;
    }
}
