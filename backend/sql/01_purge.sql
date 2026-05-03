-- ============================================================
--  PURGE COMPLETO — caritas_grd
--  Ejecutar conectado a la base: caritas_grd
--  Borra todos los datos y reinicia secuencias.
-- ============================================================

-- Desactivar restricciones de FK temporalmente
SET session_replication_role = replica;

TRUNCATE TABLE
    audit_logs,
    evidences,
    incident_reports,
    affected_persons,
    training_participants,
    trainings,
    brigadistas,
    incidents,
    users,
    parishes,
    districts,
    event_types
RESTART IDENTITY CASCADE;

-- Reactivar restricciones de FK
SET session_replication_role = DEFAULT;

-- Eliminar constraint viejo de roles para que no bloquee al reinsertar
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

SELECT 'Purge completado correctamente.' AS resultado;
