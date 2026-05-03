-- ============================================================
--  SEED MASIVO — caritas_grd
--  Ejecutar DESPUÉS de 01_purge.sql
--  Datos realistas para Lima, Perú
-- ============================================================

-- ── 1. TIPOS DE EVENTO ─────────────────────────────────────
INSERT INTO event_types (name, code, active) VALUES
    ('Incendio',                        'FIRE',                   true),
    ('Inundación',                      'FLOOD',                  true),
    ('Deslizamiento',                   'LANDSLIDE',              true),
    ('Tsunami',                         'TSUNAMI',                true),
    ('Colapso de Infraestructura',      'INFRASTRUCTURE_COLLAPSE',true),
    ('Pérdida Parcial de Vivienda',     'PARTIAL_HOUSING_LOSS',   true),
    ('Sismo',                           'EARTHQUAKE',             true),
    ('Huayco',                          'MUDSLIDE',               true),
    ('Accidente de Tránsito',           'TRAFFIC_ACCIDENT',       true),
    ('Explosión',                       'EXPLOSION',              true);

-- ── 2. DISTRITOS ───────────────────────────────────────────
INSERT INTO districts (name, province, active) VALUES
    ('Miraflores',              'Lima', true),
    ('San Isidro',              'Lima', true),
    ('Barranco',                'Lima', true),
    ('Surco',                   'Lima', true),
    ('La Molina',               'Lima', true),
    ('San Borja',               'Lima', true),
    ('Chorrillos',              'Lima', true),
    ('Villa María del Triunfo', 'Lima', true),
    ('Villa El Salvador',       'Lima', true),
    ('San Juan de Miraflores',  'Lima', true),
    ('Ate',                     'Lima', true),
    ('Santa Anita',             'Lima', true),
    ('El Agustino',             'Lima', true),
    ('La Victoria',             'Lima', true),
    ('Lince',                   'Lima', true),
    ('Jesús María',             'Lima', true),
    ('Pueblo Libre',            'Lima', true),
    ('Breña',                   'Lima', true),
    ('Rímac',                   'Lima', true),
    ('San Martín de Porres',    'Lima', true),
    ('Los Olivos',              'Lima', true),
    ('Independencia',           'Lima', true),
    ('Comas',                   'Lima', true),
    ('Carabayllo',              'Lima', true),
    ('San Juan de Lurigancho',  'Lima', true),
    ('Lurigancho',              'Lima', true),
    ('Pachacámac',              'Lima', true),
    ('Lurín',                   'Lima', true),
    ('Cercado de Lima',         'Lima', true),
    ('San Luis',                'Lima', true);

-- ── 3. PARROQUIAS ──────────────────────────────────────────
INSERT INTO parishes (name, district_id, active) VALUES
    ('Parroquia San Pedro',               (SELECT id FROM districts WHERE name='Cercado de Lima'), true),
    ('Parroquia La Merced',               (SELECT id FROM districts WHERE name='Cercado de Lima'), true),
    ('Parroquia Santo Domingo',           (SELECT id FROM districts WHERE name='Cercado de Lima'), true),
    ('Parroquia San Francisco de Asís',   (SELECT id FROM districts WHERE name='San Juan de Lurigancho'), true),
    ('Parroquia Nuestra Señora del Carmen',(SELECT id FROM districts WHERE name='Chorrillos'), true),
    ('Parroquia Cristo Rey',              (SELECT id FROM districts WHERE name='Villa El Salvador'), true),
    ('Parroquia San José',                (SELECT id FROM districts WHERE name='Ate'), true),
    ('Parroquia Santa Rosa de Lima',      (SELECT id FROM districts WHERE name='San Martín de Porres'), true),
    ('Parroquia Sagrada Familia',         (SELECT id FROM districts WHERE name='Miraflores'), true),
    ('Parroquia San Martín de Porres',    (SELECT id FROM districts WHERE name='Comas'), true);

-- ── 4. USUARIOS ────────────────────────────────────────────
-- Contraseñas: Admin123! para admin/especialistas, Brig123! para brigadistas
-- Hash generado con BCrypt ronda 10
-- Admin123!  → $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LkdEFiuc4q2
-- Spec123!   → $2a$10$c1uta6HcOyZQ3iyc5e8GleNa.MFi3Fxaq1TqSxCi9w3i1H3rvUJFO
-- Brig123!   → $2a$10$zR2x9T4bvRHRGz9D7FfCcukqCdE8J9BVXGLY5LkGJCPj3bMKCXPre
-- Donac123!  → $2a$10$QO8Y2X3sZKoL5wMqVnHfjeGfPzLkEuNjl9Oa4R8QkVwJmBHXT5.5a
INSERT INTO users (full_name, email, password, role, active, created_at, updated_at) VALUES
    -- Administrador
    ('Carmen Villanueva Ríos',       'admin@caritas.pe',         '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LkdEFiuc4q2', 'ADMIN',             true, NOW(), NOW()),
    -- Especialistas GRD
    ('Juan Carlos Pérez Salinas',    'especialista@caritas.pe',  '$2a$10$c1uta6HcOyZQ3iyc5e8GleNa.MFi3Fxaq1TqSxCi9w3i1H3rvUJFO', 'GRD_SPECIALIST',   true, NOW(), NOW()),
    ('Rosa Elena Mamani Quispe',     'rmamani@caritas.pe',       '$2a$10$c1uta6HcOyZQ3iyc5e8GleNa.MFi3Fxaq1TqSxCi9w3i1H3rvUJFO', 'GRD_SPECIALIST',   true, NOW(), NOW()),
    ('Andrés Felipe Torres Chávez',  'atorres@caritas.pe',       '$2a$10$c1uta6HcOyZQ3iyc5e8GleNa.MFi3Fxaq1TqSxCi9w3i1H3rvUJFO', 'GRD_SPECIALIST',   true, NOW(), NOW()),
    -- Jefa OGP
    ('Patricia Soledad Huanca León', 'phuanca@caritas.pe',       '$2a$10$c1uta6HcOyZQ3iyc5e8GleNa.MFi3Fxaq1TqSxCi9w3i1H3rvUJFO', 'JEFA_OGP',         true, NOW(), NOW()),
    -- Comité Donaciones
    ('Miguel Ángel Castillo Vega',   'donaciones@caritas.pe',    '$2a$10$QO8Y2X3sZKoL5wMqVnHfjeGfPzLkEuNjl9Oa4R8QkVwJmBHXT5.5a', 'COMITE_DONACIONES',true, NOW(), NOW()),
    -- Almacén
    ('Luis Alberto Ccama Flores',    'almacen@caritas.pe',       '$2a$10$c1uta6HcOyZQ3iyc5e8GleNa.MFi3Fxaq1TqSxCi9w3i1H3rvUJFO', 'ALMACEN',          true, NOW(), NOW()),
    -- Usuario autorizado
    ('Sandra Milagros Paredes Cruz', 'sparedes@caritas.pe',      '$2a$10$c1uta6HcOyZQ3iyc5e8GleNa.MFi3Fxaq1TqSxCi9w3i1H3rvUJFO', 'AUTHORIZED_USER',  true, NOW(), NOW()),
    -- Brigadistas (usuarios del sistema)
    ('María del Rosario Rojas Huamán','mrojas@caritas.pe',       '$2a$10$zR2x9T4bvRHRGz9D7FfCcukqCdE8J9BVXGLY5LkGJCPj3bMKCXPre', 'BRIGADISTA',       true, NOW(), NOW()),
    ('Carlos Enrique Mendoza Quispe','cmendoza@caritas.pe',      '$2a$10$zR2x9T4bvRHRGz9D7FfCcukqCdE8J9BVXGLY5LkGJCPj3bMKCXPre', 'BRIGADISTA',       true, NOW(), NOW()),
    -- Prueba dev
    ('Usuario Prueba Dev',           'prueba@caritas.org.pe',    '$2a$10$c1uta6HcOyZQ3iyc5e8GleNa.MFi3Fxaq1TqSxCi9w3i1H3rvUJFO', 'GRD_SPECIALIST',   true, NOW(), NOW());

-- ── 5. BRIGADISTAS PARROQUIALES ────────────────────────────
INSERT INTO brigadistas (full_name, dni, phone, email, parish_id, pastoral_role, available, latitude, longitude, active, observations, created_at, updated_at) VALUES
    ('María del Rosario Rojas Huamán', '45123678', '987654321', 'maria.rojas@parroquia.pe',
        (SELECT id FROM parishes WHERE name='Parroquia San Pedro'),
        'Coordinadora de zona', true, -12.0464, -77.0428, true, NULL, NOW(), NOW()),

    ('Carlos Enrique Mendoza Quispe', '47891234', '956789012', 'carlos.mendoza@parroquia.pe',
        (SELECT id FROM parishes WHERE name='Parroquia San Pedro'),
        'Brigadista de campo', true, -12.0550, -77.0515, true, NULL, NOW(), NOW()),

    ('Ana Lucía Torres Sánchez', '43567891', '923456789', 'ana.torres@parroquia.pe',
        (SELECT id FROM parishes WHERE name='Parroquia La Merced'),
        'Brigadista de campo', false, -12.0612, -77.0372, true, 'En capacitación', NOW(), NOW()),

    ('Roberto Alejandro Vega Paredes', '41234567', '945678901', 'roberto.vega@parroquia.pe',
        (SELECT id FROM parishes WHERE name='Parroquia San Francisco de Asís'),
        'Coordinador de zona', true, -12.0031, -76.9831, true, NULL, NOW(), NOW()),

    ('Gladys Marlene Quispe Condori', '46789012', '912345678', 'gladys.quispe@parroquia.pe',
        (SELECT id FROM parishes WHERE name='Parroquia Nuestra Señora del Carmen'),
        'Brigadista de campo', true, -12.1628, -77.0231, true, NULL, NOW(), NOW()),

    ('Eduardo Martín Flores Ccama', '44456789', '934567890', 'eduardo.flores@parroquia.pe',
        (SELECT id FROM parishes WHERE name='Parroquia Cristo Rey'),
        'Primeros auxilios', true, -12.2136, -76.9422, true, NULL, NOW(), NOW()),

    ('Yolanda Beatriz Huanca Ramos', '48901234', '967890123', 'yolanda.huanca@parroquia.pe',
        (SELECT id FROM parishes WHERE name='Parroquia San José'),
        'Brigadista de campo', true, -12.0269, -76.9147, true, NULL, NOW(), NOW()),

    ('Jorge Luis Castillo Díaz', '42345678', '978901234', 'jorge.castillo@parroquia.pe',
        (SELECT id FROM parishes WHERE name='Parroquia Santa Rosa de Lima'),
        'Logística y apoyo', false, -11.9908, -77.0814, true, 'Disponible fines de semana', NOW(), NOW()),

    ('Sofía Patricia Mamani Apaza', '43678901', '901234567', 'sofia.mamani@parroquia.pe',
        (SELECT id FROM parishes WHERE name='Parroquia Sagrada Familia'),
        'Comunicaciones', true, -12.1219, -77.0282, true, NULL, NOW(), NOW()),

    ('Héctor Raúl Salinas Mora', '46012345', '989012345', 'hector.salinas@parroquia.pe',
        (SELECT id FROM parishes WHERE name='Parroquia San Martín de Porres'),
        'Coordinador de zona', true, -11.9536, -77.0781, true, NULL, NOW(), NOW());

-- ── 6. INCIDENTES ──────────────────────────────────────────
INSERT INTO incidents (event_type_id, description, cause, losses, actions_taken, status,
    incident_date, latitude, longitude, address, district_id, created_by_id, created_at, updated_at,
    affectation_level, affected_families, vulnerable_groups, urgent_needs, social_risk_assessment) VALUES

    ((SELECT id FROM event_types WHERE code='FIRE'),
     'Incendio en vivienda de material noble de 3 pisos. Se inició en el segundo piso por un cortocircuito en la cocina.',
     'Cortocircuito en instalación eléctrica antigua',
     'Pérdida total del segundo piso, daños parciales en primer y tercer piso. Enseres destruidos.',
     'Se coordinó con Bomberos y PNP. Familias reubicadas temporalmente en albergue parroquial.',
     'IN_PROGRESS', '2026-04-28 14:35:00', -12.1183, -77.0283,
     'Jr. Grau 542', (SELECT id FROM districts WHERE name='Barranco'),
     (SELECT id FROM users WHERE email='especialista@caritas.pe'),
     NOW(), NOW(), 'SEVERO', 3, 'Adultos mayores, menores de edad', 'Vivienda temporal, alimentos, ropa', 'ALTO'),

    ((SELECT id FROM event_types WHERE code='FLOOD'),
     'Desborde del canal de Surco afectó 12 viviendas en la parte baja del asentamiento humano.',
     'Lluvias intensas y colmatación del canal',
     'Inundación de primer piso en 12 viviendas. Pérdida de muebles y enseres.',
     'Coordinación con Municipalidad para bombeo de agua. Distribución de bolsas de arena.',
     'OPEN', '2026-04-30 08:15:00', -12.1611, -76.9906,
     'AA.HH. Virgen del Carmen, Mz. D',
     (SELECT id FROM districts WHERE name='Villa El Salvador'),
     (SELECT id FROM users WHERE email='rmamani@caritas.pe'),
     NOW(), NOW(), 'MODERADO', 12, 'Familias con niños menores de 5 años', 'Vivienda temporal, desinfección', 'MEDIO'),

    ((SELECT id FROM event_types WHERE code='EARTHQUAKE'),
     'Sismo de magnitud 5.2 causó daños estructurales en viviendas de adobe. 8 viviendas con fisuras graves.',
     'Actividad sísmica zona costera',
     'Fisuras en paredes, caída de techos parciales en 3 viviendas. Sin víctimas.',
     'Inspección técnica por INDECI. Señalización de viviendas inhabitables.',
     'FOLLOW_UP', '2026-04-15 06:42:00', -12.0464, -77.0428,
     'Av. Brasil cuadra 18',
     (SELECT id FROM districts WHERE name='Pueblo Libre'),
     (SELECT id FROM users WHERE email='atorres@caritas.pe'),
     NOW(), NOW(), 'MODERADO', 8, 'Adultos mayores', 'Evaluación estructural, reforzamiento', 'MEDIO'),

    ((SELECT id FROM event_types WHERE code='LANDSLIDE'),
     'Deslizamiento de talud afecta paso peatonal y dos viviendas colindantes en ladera del cerro.',
     'Lluvias de temporada, suelo inestable sin muro de contención',
     'Paso bloqueado, daño en fachada de 2 viviendas. Sin heridos.',
     'Desalojo preventivo. Coordinación con Municipalidad para habilitación de paso alternativo.',
     'OPEN', '2026-05-01 11:20:00', -11.9536, -77.0781,
     'Cerro El Agustino, escalera 7',
     (SELECT id FROM districts WHERE name='El Agustino'),
     (SELECT id FROM users WHERE email='especialista@caritas.pe'),
     NOW(), NOW(), 'MODERADO', 2, 'Familias en zona de riesgo', 'Reubicación temporal', 'ALTO'),

    ((SELECT id FROM event_types WHERE code='PARTIAL_HOUSING_LOSS'),
     'Colapso del techo de vivienda de estera en asentamiento humano. Familia de 5 personas damnificada.',
     'Deterioro de materiales por antigüedad y falta de mantenimiento',
     'Techo colapsado completamente. Pérdida total de enseres del dormitorio.',
     'Atención inmediata por brigadistas parroquiales. Entrega de kit de emergencia.',
     'CLOSED', '2026-04-10 19:05:00', -12.2136, -76.9422,
     'AA.HH. Pachacámac, Mz. K Lt. 8',
     (SELECT id FROM districts WHERE name='Villa María del Triunfo'),
     (SELECT id FROM users WHERE email='mrojas@caritas.pe'),
     NOW(), NOW(), 'SEVERO', 1, 'Menores de edad (3), gestante', 'Kit básico, techo provisional', 'CRITICO'),

    ((SELECT id FROM event_types WHERE code='FIRE'),
     'Amago de incendio en mercado de abastos controlado por vecinos antes de la llegada de bomberos.',
     'Instalación eléctrica clandestina en puesto de venta',
     'Daños menores en 2 puestos de venta. Sin heridos.',
     'Control vecinal inmediato. Inspección eléctrica por SEAL.',
     'CLOSED', '2026-03-22 13:10:00', -12.0550, -77.0515,
     'Mercado La Amistad, puesto 34-35',
     (SELECT id FROM districts WHERE name='San Juan de Miraflores'),
     (SELECT id FROM users WHERE email='cmendoza@caritas.pe'),
     NOW(), NOW(), 'LEVE', 2, NULL, NULL, 'BAJO'),

    ((SELECT id FROM event_types WHERE code='FLOOD'),
     'Acumulación de agua por colapso de desagüe en calle principal afecta 6 hogares de adultos mayores.',
     'Obstrucción de colector pluvial',
     'Filtraciones en primer piso de 6 viviendas. Daño en pisos y muebles.',
     'Notificación a SEDAPAL. Brigada de limpieza municipal activada.',
     'IN_PROGRESS', '2026-05-01 07:30:00', -12.0612, -77.0372,
     'Jr. Amazonas 890',
     (SELECT id FROM districts WHERE name='Breña'),
     (SELECT id FROM users WHERE email='rmamani@caritas.pe'),
     NOW(), NOW(), 'LEVE', 6, 'Adultos mayores', 'Limpieza, desinfección', 'BAJO'),

    ((SELECT id FROM event_types WHERE code='MUDSLIDE'),
     'Huayco de pequeña escala bloqueó acceso vehicular a caserío en zona de ladera.',
     'Lluvias de temporada, falta de drenaje',
     'Bloqueo de vía por 200 metros. Sin víctimas. Cultivos afectados.',
     'Maquinaria municipal para apertura de vía. Apoyo con víveres a familias aisladas.',
     'CLOSED', '2026-04-05 04:15:00', -12.0031, -76.9831,
     'Carretera Lurigancho km 12',
     (SELECT id FROM districts WHERE name='Lurigancho'),
     (SELECT id FROM users WHERE email='atorres@caritas.pe'),
     NOW(), NOW(), 'MODERADO', 15, 'Agricultores, adultos mayores', 'Víveres, acceso vial', 'MEDIO');

-- ── 7. PERSONAS AFECTADAS ──────────────────────────────────
INSERT INTO affected_persons (incident_id, full_name, dni, birth_date, sex, phone, damage_type, created_at) VALUES
    -- Incendio Barranco
    (1, 'Lucía Esperanza Vargas Ramos',     '32456789', '1958-03-12', 'F', '945678901', 'Pérdida de vivienda', NOW()),
    (1, 'Pablo Vargas Ramos',               '74123456', '1985-07-24', 'M', '945678901', 'Pérdida de vivienda', NOW()),
    (1, 'Fernanda Vargas Torres',           '76543210', '2010-11-05', 'F', NULL,        'Pérdida de vivienda', NOW()),
    -- Inundación Villa El Salvador
    (2, 'Jorge Eusebio Quispe Mamani',      '41234560', '1975-09-18', 'M', '923456780', 'Inundación vivienda', NOW()),
    (2, 'Sonia Quispe Mamani',              '43890123', '1978-02-28', 'F', '923456780', 'Inundación vivienda', NOW()),
    (2, 'Kevin Quispe Sandoval',            '77654321', '2008-06-14', 'M', NULL,        'Inundación vivienda', NOW()),
    (2, 'Milagros Condori de Huanca',       '47012345', '1990-12-01', 'F', '956781234', 'Inundación vivienda', NOW()),
    -- Colapso Villa María del Triunfo
    (5, 'Norma Cecilia Huanca Apaza',       '42109876', '1992-08-20', 'F', '978012345', 'Pérdida total de techo', NOW()),
    (5, 'Efraín Huanca Apaza',              '40987654', '1989-04-11', 'M', '978012345', 'Pérdida total de techo', NOW()),
    (5, 'Ariana Huanca Flores',             '79012345', '2018-01-30', 'F', NULL,        'Pérdida total de techo', NOW()),
    (5, 'Diego Huanca Flores',              '78901234', '2015-09-07', 'M', NULL,        'Pérdida total de techo', NOW()),
    (5, 'Valeria Huanca Flores',            '80123456', '2021-05-22', 'F', NULL,        'Pérdida total de techo', NOW());

-- ── 8. CAPACITACIONES ──────────────────────────────────────
INSERT INTO trainings (training_code, name, modality, start_date, end_date, parish_id, responsible_id,
    status, description, created_at, updated_at) VALUES

    ('CAP-2026-001', 'Primeros Auxilios Básico para Brigadistas',
     'SINCRONICA', '2026-03-15 09:00:00', '2026-03-15 17:00:00',
     (SELECT id FROM parishes WHERE name='Parroquia San Pedro'),
     (SELECT id FROM users WHERE email='especialista@caritas.pe'),
     'FINALIZADO', 'Capacitación teórico-práctica en primeros auxilios. Incluye RCP, manejo de heridas y movilización de víctimas.',
     NOW(), NOW()),

    ('CAP-2026-002', 'Gestión de Riesgos de Desastres — Nivel Básico',
     'SINCRONICA', '2026-04-05 08:30:00', '2026-04-06 16:00:00',
     (SELECT id FROM parishes WHERE name='Parroquia La Merced'),
     (SELECT id FROM users WHERE email='rmamani@caritas.pe'),
     'FINALIZADO', 'Conceptos fundamentales de GRD: amenazas, vulnerabilidades, capacidades y gestión del riesgo.',
     NOW(), NOW()),

    ('CAP-2026-003', 'Evacuación y Simulacro de Sismo',
     'SINCRONICA', '2026-04-22 10:00:00', '2026-04-22 14:00:00',
     (SELECT id FROM parishes WHERE name='Parroquia San Francisco de Asís'),
     (SELECT id FROM users WHERE email='atorres@caritas.pe'),
     'FINALIZADO', 'Prácticas de evacuación segura ante eventos sísmicos. Identificación de zonas seguras y puntos de reunión.',
     NOW(), NOW()),

    ('CAP-2026-004', 'Manejo de Albergues de Emergencia',
     'MIXTA', '2026-05-10 09:00:00', '2026-05-11 16:00:00',
     (SELECT id FROM parishes WHERE name='Parroquia Cristo Rey'),
     (SELECT id FROM users WHERE email='especialista@caritas.pe'),
     'PROGRAMADO', 'Gestión y administración de albergues temporales: registro, distribución de familias, higiene y salubridad.',
     NOW(), NOW()),

    ('CAP-2026-005', 'Atención Psicosocial en Emergencias',
     'ASINCRONICA', '2026-05-20 00:00:00', '2026-06-03 23:59:00',
     NULL,
     (SELECT id FROM users WHERE email='phuanca@caritas.pe'),
     'PROGRAMADO', 'Herramientas de apoyo emocional y contención psicológica para poblaciones afectadas por desastres.',
     NOW(), NOW());

-- ── 9. PARTICIPANTES DE CAPACITACIONES ─────────────────────
INSERT INTO training_participants (training_id, dni, full_name, age, phone, email, pastoral_role,
    attendance, initial_score, final_score, certification_status, created_at) VALUES

    -- CAP-2026-001 Primeros Auxilios
    (1, '45123678', 'María del Rosario Rojas Huamán',  34, '987654321', 'maria.rojas@parroquia.pe',   'Coordinadora de zona',  'PRESENTE', 14, 18, 'APROBADO',    NOW()),
    (1, '47891234', 'Carlos Enrique Mendoza Quispe',   28, '956789012', 'carlos.mendoza@parroquia.pe','Brigadista de campo',   'PRESENTE', 12, 16, 'APROBADO',    NOW()),
    (1, '43567891', 'Ana Lucía Torres Sánchez',         35, '923456789', 'ana.torres@parroquia.pe',    'Brigadista de campo',   'PRESENTE', 11, 15, 'APROBADO',    NOW()),
    (1, '41234567', 'Roberto Alejandro Vega Paredes',  38, '945678901', 'roberto.vega@parroquia.pe',  'Coordinador de zona',   'PRESENTE', 13, 17, 'APROBADO',    NOW()),
    (1, '46789012', 'Gladys Marlene Quispe Condori',   40, '912345678', 'gladys.quispe@parroquia.pe', 'Brigadista de campo',   'TARDANZA', 10, 13, 'APROBADO',    NOW()),
    (1, '48901234', 'Yolanda Beatriz Huanca Ramos',    29, '967890123', 'yolanda.huanca@parroquia.pe','Brigadista de campo',   'AUSENTE',  NULL,NULL,'NO_APROBADO', NOW()),

    -- CAP-2026-002 GRD Básico
    (2, '45123678', 'María del Rosario Rojas Huamán',  34, '987654321', 'maria.rojas@parroquia.pe',   'Coordinadora de zona',  'PRESENTE', 16, 19, 'APROBADO',    NOW()),
    (2, '44456789', 'Eduardo Martín Flores Ccama',      42, '934567890', 'eduardo.flores@parroquia.pe','Primeros auxilios',     'PRESENTE', 14, 17, 'APROBADO',    NOW()),
    (2, '42345678', 'Jorge Luis Castillo Díaz',         45, '978901234', 'jorge.castillo@parroquia.pe','Logística y apoyo',    'PRESENTE', 12, 15, 'APROBADO',    NOW()),
    (2, '43678901', 'Sofía Patricia Mamani Apaza',      31, '901234567', 'sofia.mamani@parroquia.pe',  'Comunicaciones',       'JUSTIFICADO',13,NULL,'PENDIENTE',  NOW()),

    -- CAP-2026-003 Simulacro
    (3, '47891234', 'Carlos Enrique Mendoza Quispe',   28, '956789012', 'carlos.mendoza@parroquia.pe','Brigadista de campo',   'PRESENTE', NULL,NULL,'PENDIENTE',  NOW()),
    (3, '46012345', 'Héctor Raúl Salinas Mora',         37, '989012345', 'hector.salinas@parroquia.pe','Coordinador de zona',  'PRESENTE', NULL,NULL,'PENDIENTE',  NOW()),
    (3, '46789012', 'Gladys Marlene Quispe Condori',   40, '912345678', 'gladys.quispe@parroquia.pe', 'Brigadista de campo',   'PRESENTE', NULL,NULL,'PENDIENTE',  NOW()),
    (3, '41234567', 'Roberto Alejandro Vega Paredes',  38, '945678901', 'roberto.vega@parroquia.pe',  'Coordinador de zona',   'PRESENTE', NULL,NULL,'PENDIENTE',  NOW());

SELECT 'Seed completado correctamente.' AS resultado;
SELECT 'event_types: '  || COUNT(*) FROM event_types;
SELECT 'districts: '    || COUNT(*) FROM districts;
SELECT 'parishes: '     || COUNT(*) FROM parishes;
SELECT 'users: '        || COUNT(*) FROM users;
SELECT 'brigadistas: '  || COUNT(*) FROM brigadistas;
SELECT 'incidents: '    || COUNT(*) FROM incidents;
SELECT 'affected: '     || COUNT(*) FROM affected_persons;
SELECT 'trainings: '    || COUNT(*) FROM trainings;
SELECT 'participants: ' || COUNT(*) FROM training_participants;
