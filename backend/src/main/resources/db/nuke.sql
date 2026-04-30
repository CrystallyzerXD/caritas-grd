-- ⚠️  BORRA TODO — solo usar en desarrollo
-- Orden: hijos antes que padres para respetar FKs

TRUNCATE TABLE
    audit_logs,
    affected_persons,
    evidences,
    environmental_initiatives,
    incidents,
    users,
    parishes,
    districts,
    event_types
RESTART IDENTITY CASCADE;
