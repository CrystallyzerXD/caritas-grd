package com.caritas.grd.service;

import com.caritas.grd.model.AuditLog;
import com.caritas.grd.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    @Async("asyncExecutor")
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(String entityName, Long entityId, String action,
                    String changedBy, String oldValue, String newValue) {
        AuditLog auditLog = AuditLog.builder()
                .entityName(entityName)
                .entityId(entityId)
                .action(action)
                .changedBy(changedBy)
                .oldValue(oldValue)
                .newValue(newValue)
                .build();
        auditLogRepository.save(auditLog);
    }
}
