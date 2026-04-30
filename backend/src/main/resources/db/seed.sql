-- ============================================================
--  Caritas GRD — Seed de datos de prueba
--  Requiere: pgcrypto  (para hashear passwords con bcrypt)
--  Uso: psql -U <user> -d <db> -f seed.sql
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ------------------------------------------------------------
-- 1. TIPOS DE EVENTO
-- ------------------------------------------------------------
INSERT INTO event_types (name, code, active, created_at, updated_at) VALUES
  ('Incendio',                      'FIRE',                   true, NOW(), NOW()),
  ('Inundación',                    'FLOOD',                  true, NOW(), NOW()),
  ('Deslizamiento',                 'LANDSLIDE',              true, NOW(), NOW()),
  ('Tsunami',                       'TSUNAMI',                true, NOW(), NOW()),
  ('Colapso de Infraestructura',    'INFRASTRUCTURE_COLLAPSE',true, NOW(), NOW()),
  ('Pérdida Parcial de Vivienda',   'PARTIAL_HOUSING_LOSS',   true, NOW(), NOW()),
  ('Sismo',                         'EARTHQUAKE',             true, NOW(), NOW()),
  ('Huayco',                        'MUDSLIDE',               true, NOW(), NOW());

-- ------------------------------------------------------------
-- 2. DISTRITOS (Lima)
-- ------------------------------------------------------------
INSERT INTO districts (name, province, active, created_at, updated_at) VALUES
  ('Miraflores',              'Lima', true, NOW(), NOW()),
  ('San Isidro',              'Lima', true, NOW(), NOW()),
  ('Barranco',                'Lima', true, NOW(), NOW()),
  ('Surco',                   'Lima', true, NOW(), NOW()),
  ('La Molina',               'Lima', true, NOW(), NOW()),
  ('San Borja',               'Lima', true, NOW(), NOW()),
  ('Chorrillos',              'Lima', true, NOW(), NOW()),
  ('Villa María del Triunfo', 'Lima', true, NOW(), NOW()),
  ('Villa El Salvador',       'Lima', true, NOW(), NOW()),
  ('San Juan de Miraflores',  'Lima', true, NOW(), NOW()),
  ('Ate',                     'Lima', true, NOW(), NOW()),
  ('Santa Anita',             'Lima', true, NOW(), NOW()),
  ('El Agustino',             'Lima', true, NOW(), NOW()),
  ('San Luis',                'Lima', true, NOW(), NOW()),
  ('La Victoria',             'Lima', true, NOW(), NOW()),
  ('Lince',                   'Lima', true, NOW(), NOW()),
  ('Jesús María',             'Lima', true, NOW(), NOW()),
  ('Magdalena del Mar',       'Lima', true, NOW(), NOW()),
  ('Pueblo Libre',            'Lima', true, NOW(), NOW()),
  ('Breña',                   'Lima', true, NOW(), NOW()),
  ('Rímac',                   'Lima', true, NOW(), NOW()),
  ('San Martín de Porres',    'Lima', true, NOW(), NOW()),
  ('Los Olivos',              'Lima', true, NOW(), NOW()),
  ('Independencia',           'Lima', true, NOW(), NOW()),
  ('Comas',                   'Lima', true, NOW(), NOW()),
  ('Carabayllo',              'Lima', true, NOW(), NOW()),
  ('Puente Piedra',           'Lima', true, NOW(), NOW()),
  ('San Juan de Lurigancho',  'Lima', true, NOW(), NOW()),
  ('Lurigancho',              'Lima', true, NOW(), NOW()),
  ('Pachacámac',              'Lima', true, NOW(), NOW()),
  ('Lurín',                   'Lima', true, NOW(), NOW()),
  ('Punta Hermosa',           'Lima', true, NOW(), NOW()),
  ('Punta Negra',             'Lima', true, NOW(), NOW()),
  ('San Bartolo',             'Lima', true, NOW(), NOW()),
  ('Santa María del Mar',     'Lima', true, NOW(), NOW()),
  ('Pucusana',                'Lima', true, NOW(), NOW()),
  ('Cercado de Lima',         'Lima', true, NOW(), NOW());

-- ------------------------------------------------------------
-- 3. PARROQUIAS
-- ------------------------------------------------------------
INSERT INTO parishes (name, district_id, active, created_at, updated_at) VALUES
  ('Parroquia San Pedro',     (SELECT id FROM districts WHERE name = 'Cercado de Lima'), true, NOW(), NOW()),
  ('Parroquia La Merced',     (SELECT id FROM districts WHERE name = 'Cercado de Lima'), true, NOW(), NOW()),
  ('Parroquia Santo Domingo', (SELECT id FROM districts WHERE name = 'Cercado de Lima'), true, NOW(), NOW()),
  ('Parroquia Santa Rosa',    (SELECT id FROM districts WHERE name = 'San Juan de Lurigancho'), true, NOW(), NOW()),
  ('Parroquia San Francisco', (SELECT id FROM districts WHERE name = 'La Victoria'), true, NOW(), NOW());

-- ------------------------------------------------------------
-- 4. USUARIOS
--    Contraseñas (bcrypt cost 10):
--      admin@caritas.pe        → Admin123!
--      especialista@caritas.pe → Spec123!
--      brigadista@caritas.pe   → Brig123!
--      prueba@caritas.org.pe   → prueba123
-- ------------------------------------------------------------
INSERT INTO users (full_name, email, password, role, active, created_at, updated_at) VALUES
  ('Administrador Cáritas',    'admin@caritas.pe',       crypt('Admin123!', gen_salt('bf', 10)), 'ADMIN',           true, NOW(), NOW()),
  ('Juan Pérez Especialista',  'especialista@caritas.pe',crypt('Spec123!',  gen_salt('bf', 10)), 'GRD_SPECIALIST',  true, NOW(), NOW()),
  ('María García Brigadista',  'brigadista@caritas.pe',  crypt('Brig123!',  gen_salt('bf', 10)), 'BRIGADISTA',      true, NOW(), NOW()),
  ('Usuario Prueba',           'prueba@caritas.org.pe',  crypt('prueba123', gen_salt('bf', 10)), 'GRD_SPECIALIST',  true, NOW(), NOW()),
  ('Carlos Ramos Autorizado',  'autorizado@caritas.pe',  crypt('Auth123!',  gen_salt('bf', 10)), 'AUTHORIZED_USER', true, NOW(), NOW());

-- ------------------------------------------------------------
-- 5. INCIDENCIAS
-- ------------------------------------------------------------
INSERT INTO incidents
  (event_type_id, description, cause, losses, actions_taken, status,
   latitude, longitude, address, district_id, incident_date,
   created_by_id, updated_by_id, created_at, updated_at)
VALUES
  -- 1: Incendio en La Victoria — CLOSED
  ((SELECT id FROM event_types WHERE code = 'FIRE'),
   'Incendio de grandes proporciones en almacén de materiales inflamables. Afectó tres manzanas del sector comercial.',
   'Cortocircuito en instalaciones eléctricas deficientes.',
   'Destrucción total de 2 almacenes y daños parciales en 5 viviendas colindantes. Pérdidas estimadas en S/ 180,000.',
   'Intervención de 4 unidades de bomberos. Evacuación preventiva de 60 personas. Perímetro de seguridad establecido.',
   'CLOSED',
   -12.0653, -77.0197,
   'Av. Aviación 2340, La Victoria',
   (SELECT id FROM districts WHERE name = 'La Victoria'),
   '2025-11-12',
   (SELECT id FROM users WHERE email = 'especialista@caritas.pe'),
   (SELECT id FROM users WHERE email = 'admin@caritas.pe'),
   NOW() - INTERVAL '120 days', NOW() - INTERVAL '110 days'),

  -- 2: Inundación en San Juan de Lurigancho — OPEN
  ((SELECT id FROM event_types WHERE code = 'FLOOD'),
   'Desbordamiento del canal La Huaycoloro afectó asentamientos humanos ribereños. Agua lodosa ingresó a más de 40 viviendas.',
   'Lluvias intensas combinadas con acumulación de residuos que obstruyeron el canal.',
   'Inundación de 42 viviendas, pérdida de enseres domésticos y cultivos de pan llevar. 3 personas hospitalizadas por hipotermia.',
   'Instalación de bombas de desagüe. Reparto de kits de emergencia a 15 familias. Coordinación con INDECI.',
   'OPEN',
   -12.0034, -76.9969,
   'AA.HH. Los Laureles, Mz. D, San Juan de Lurigancho',
   (SELECT id FROM districts WHERE name = 'San Juan de Lurigancho'),
   '2026-02-18',
   (SELECT id FROM users WHERE email = 'brigadista@caritas.pe'),
   NULL,
   NOW() - INTERVAL '55 days', NOW() - INTERVAL '55 days'),

  -- 3: Deslizamiento en Ate — IN_PROGRESS
  ((SELECT id FROM event_types WHERE code = 'LANDSLIDE'),
   'Deslizamiento de talud afectó vía principal y dejó incomunicado al asentamiento humano Las Flores durante 18 horas.',
   'Saturación del suelo por lluvia intensa y ausencia de muros de contención.',
   'Bloqueo total de acceso vehicular. 6 viviendas con daños en la estructura. 1 persona con heridas leves.',
   'Remoción de escombros con maquinaria pesada. Censo de afectados realizado por brigada GRD.',
   'IN_PROGRESS',
   -12.0194, -76.9172,
   'AA.HH. Las Flores, Ate Vitarte',
   (SELECT id FROM districts WHERE name = 'Ate'),
   '2026-03-02',
   (SELECT id FROM users WHERE email = 'especialista@caritas.pe'),
   (SELECT id FROM users WHERE email = 'especialista@caritas.pe'),
   NOW() - INTERVAL '44 days', NOW() - INTERVAL '40 days'),

  -- 4: Sismo en Cercado de Lima — CLOSED
  ((SELECT id FROM event_types WHERE code = 'EARTHQUAKE'),
   'Sismo de 5.2 grados afectó edificaciones antiguas del Centro Histórico. Se reportaron fisuras en fachadas y caída de cornisas.',
   'Actividad sísmica natural. Zona con alta vulnerabilidad por antigüedad de construcciones.',
   'Daños en 12 edificaciones patrimoniales. 2 personas con contusiones leves por caída de objetos.',
   'Inspección técnica de 45 edificaciones. Señalización de zonas de peligro. Albergue temporal para 8 familias desalojadas.',
   'CLOSED',
   -12.0464, -77.0428,
   'Jr. Carabaya 320, Cercado de Lima',
   (SELECT id FROM districts WHERE name = 'Cercado de Lima'),
   '2025-08-30',
   (SELECT id FROM users WHERE email = 'admin@caritas.pe'),
   (SELECT id FROM users WHERE email = 'admin@caritas.pe'),
   NOW() - INTERVAL '228 days', NOW() - INTERVAL '220 days'),

  -- 5: Huayco en Lurigancho — FOLLOW_UP
  ((SELECT id FROM event_types WHERE code = 'MUDSLIDE'),
   'Huayco arrasó con camino vecinal y dañó sistema de agua potable que abastece a 300 familias.',
   'Activación de quebrada Quirio por lluvias anómalas El Niño Costero.',
   'Destrucción de 800 metros de tubería de agua. 4 viviendas con daño total. Pérdidas en cultivos estimadas en S/ 45,000.',
   'Abastecimiento de agua mediante cisterna municipal. Evaluación de daños por equipo técnico de MVCS.',
   'FOLLOW_UP',
   -11.9801, -76.8622,
   'Caserío Quirio, Lurigancho-Chosica',
   (SELECT id FROM districts WHERE name = 'Lurigancho'),
   '2026-01-08',
   (SELECT id FROM users WHERE email = 'especialista@caritas.pe'),
   (SELECT id FROM users WHERE email = 'especialista@caritas.pe'),
   NOW() - INTERVAL '97 days', NOW() - INTERVAL '90 days'),

  -- 6: Colapso de infraestructura en Villa María del Triunfo — IN_PROGRESS
  ((SELECT id FROM event_types WHERE code = 'INFRASTRUCTURE_COLLAPSE'),
   'Colapso parcial de puente peatonal sobre quebrada La Rinconada. Estructura cedió bajo peso de grupo de personas.',
   'Falta de mantenimiento preventivo y sobrecarga. Corrosión severa en vigas de soporte.',
   'Puente inutilizable. 3 personas con lesiones moderadas trasladadas a hospital. Comunidad de 500 familias sin paso peatonal seguro.',
   'Cierre del puente y señalización. Habilitación de paso alternativo provisional. Denuncia ante municipalidad.',
   'IN_PROGRESS',
   -12.1583, -76.9411,
   'Quebrada La Rinconada, Villa María del Triunfo',
   (SELECT id FROM districts WHERE name = 'Villa María del Triunfo'),
   '2026-03-15',
   (SELECT id FROM users WHERE email = 'brigadista@caritas.pe'),
   (SELECT id FROM users WHERE email = 'especialista@caritas.pe'),
   NOW() - INTERVAL '31 days', NOW() - INTERVAL '28 days'),

  -- 7: Incendio en El Agustino — OPEN
  ((SELECT id FROM event_types WHERE code = 'FIRE'),
   'Incendio consumió vivienda de material noble y se propagó a tres construcciones de madera adyacentes.',
   'Manipulación inadecuada de balón de gas en cocina.',
   'Pérdida total de 1 vivienda principal y daños graves en 3 colindantes. Familia de 5 miembros quedó sin hogar.',
   'Extinción por compañía de bomberos Nro. 28. Familia alojada temporalmente en local parroquial.',
   'OPEN',
   -12.0394, -77.0100,
   'Jr. Las Flores 456, El Agustino',
   (SELECT id FROM districts WHERE name = 'El Agustino'),
   '2026-04-01',
   (SELECT id FROM users WHERE email = 'brigadista@caritas.pe'),
   NULL,
   NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'),

  -- 8: Pérdida parcial de vivienda en Comas — CLOSED
  ((SELECT id FROM event_types WHERE code = 'PARTIAL_HOUSING_LOSS'),
   'Deslizamiento menor afectó la parte posterior de vivienda ubicada en ladera del cerro. Techo y muro trasero colapsaron.',
   'Suelo inestable sin compactación adecuada. Filtración de agua de lluvia por varios días.',
   'Daño estructural en el 40% de la vivienda. Familia de 4 personas sin dormitorio principal.',
   'Evaluación estructural por SISFOH. Familia reubicada en cuarto alquilado con apoyo de bono de emergencia.',
   'CLOSED',
   -11.9381, -77.0531,
   'Mz. H Lt. 12, AA.HH. El Álamo, Comas',
   (SELECT id FROM districts WHERE name = 'Comas'),
   '2025-12-05',
   (SELECT id FROM users WHERE email = 'especialista@caritas.pe'),
   (SELECT id FROM users WHERE email = 'admin@caritas.pe'),
   NOW() - INTERVAL '131 days', NOW() - INTERVAL '125 days'),

  -- 9: Inundación en Chorrillos — IN_PROGRESS
  ((SELECT id FROM event_types WHERE code = 'FLOOD'),
   'Inundación de zona baja por colapso de colector de aguas pluviales. Agua estancada en 8 calles por más de 48 horas.',
   'Colector antiguo sin capacidad para lluvia estacional. Obstrucción por basura acumulada.',
   'Inundación de 28 viviendas de primer piso. Daños en mobiliario y electrodomésticos. 2 casos de leptospirosis reportados.',
   'Coordinación con SEDAPAL para reparación del colector. Fumigación preventiva por MINSA. Distribución de cloro.',
   'IN_PROGRESS',
   -12.1793, -77.0119,
   'Jr. Huaylas 890, Chorrillos',
   (SELECT id FROM districts WHERE name = 'Chorrillos'),
   '2026-03-20',
   (SELECT id FROM users WHERE email = 'especialista@caritas.pe'),
   (SELECT id FROM users WHERE email = 'especialista@caritas.pe'),
   NOW() - INTERVAL '26 days', NOW() - INTERVAL '24 days'),

  -- 10: Sismo en Rímac — FOLLOW_UP
  ((SELECT id FROM event_types WHERE code = 'EARTHQUAKE'),
   'Sismo de 4.8 grados ocasionó fisuras en 7 viviendas antiguas de adobe y quincha. Una vivienda declarada inhabitable.',
   'Actividad sísmica de la falla geológica local. Construcciones con más de 60 años sin reforzamiento.',
   '1 vivienda con daño total. 6 con daño parcial. Pérdidas materiales estimadas en S/ 95,000.',
   'Declaración de emergencia por municipalidad del Rímac. Inspección técnica de CENEPRED. 1 familia reubicada en albergue.',
   'FOLLOW_UP',
   -12.0264, -77.0311,
   'Jr. Trujillo 124, Rímac',
   (SELECT id FROM districts WHERE name = 'Rímac'),
   '2025-10-14',
   (SELECT id FROM users WHERE email = 'admin@caritas.pe'),
   (SELECT id FROM users WHERE email = 'admin@caritas.pe'),
   NOW() - INTERVAL '183 days', NOW() - INTERVAL '175 days'),

  -- 11: Deslizamiento en San Martín de Porres — OPEN
  ((SELECT id FROM event_types WHERE code = 'LANDSLIDE'),
   'Deslizamiento en talud del cerro afectó escalera de acceso a asentamiento humano y dañó cableado eléctrico.',
   'Saturación del suelo por lluvias. Inadecuado sistema de drenaje en laderas.',
   'Escalera de acceso destruida en 30 metros. Corte de suministro eléctrico a 45 viviendas. Sin heridos.',
   'Reparación provisional de acceso peatonal con tablas de madera. Notificación a Luz del Sur para reparación eléctrica.',
   'OPEN',
   -12.0056, -77.0839,
   'Cerro La Regla, San Martín de Porres',
   (SELECT id FROM districts WHERE name = 'San Martín de Porres'),
   '2026-03-28',
   (SELECT id FROM users WHERE email = 'brigadista@caritas.pe'),
   NULL,
   NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days'),

  -- 12: Huayco en Villa El Salvador — CLOSED
  ((SELECT id FROM event_types WHERE code = 'MUDSLIDE'),
   'Huayco de mediana magnitud afectó sector productivo de Villa El Salvador. Lodo cubrió invernaderos y galpones.',
   'Activación de quebrada seca por lluvia excepcional. Pendiente pronunciada sin vegetación de cobertura.',
   'Pérdida total de 3 invernaderos. 8 galpones con daño parcial. Pérdidas en producción estimadas en S/ 120,000.',
   'Evacuación de 20 trabajadores sin heridos. Limpieza de lodo con maquinaria municipal. Evaluación de daños a cargo de GORE Lima.',
   'CLOSED',
   -12.2139, -76.9364,
   'Sector Productivo, Mz. A, Villa El Salvador',
   (SELECT id FROM districts WHERE name = 'Villa El Salvador'),
   '2025-09-22',
   (SELECT id FROM users WHERE email = 'especialista@caritas.pe'),
   (SELECT id FROM users WHERE email = 'admin@caritas.pe'),
   NOW() - INTERVAL '205 days', NOW() - INTERVAL '200 days');

-- Corrección typo en incidencia 10 (usuarios → users) ya está bien arriba

-- ------------------------------------------------------------
-- 6. PERSONAS AFECTADAS
-- ------------------------------------------------------------
INSERT INTO affected_persons
  (incident_id, full_name, birth_date, dni, phone, sex, damage_type, created_at, updated_at)
VALUES
  -- Incendio La Victoria (incidencia 1)
  ((SELECT id FROM incidents WHERE address LIKE '%Aviación%'),
   'Rosa Medina Quispe',   '1978-04-12', '42318765', '987654321', 'F', 'Damnificada', NOW() - INTERVAL '119 days', NOW() - INTERVAL '119 days'),
  ((SELECT id FROM incidents WHERE address LIKE '%Aviación%'),
   'Pedro Medina Quispe',  '1975-09-30', '39271540', NULL,        'M', 'Damnificado', NOW() - INTERVAL '119 days', NOW() - INTERVAL '119 days'),
  ((SELECT id FROM incidents WHERE address LIKE '%Aviación%'),
   'Sofía Medina Torres',  '2005-01-15', '76543210', NULL,        'F', 'Afectada',    NOW() - INTERVAL '119 days', NOW() - INTERVAL '119 days'),

  -- Inundación SJL (incidencia 2)
  ((SELECT id FROM incidents WHERE address LIKE '%Laureles%'),
   'Jorge Huanca Mamani',  '1969-07-22', '18432567', '956781234', 'M', 'Damnificado', NOW() - INTERVAL '54 days', NOW() - INTERVAL '54 days'),
  ((SELECT id FROM incidents WHERE address LIKE '%Laureles%'),
   'Carmen Mamani de Huanca','1972-11-03','20981234', '956781234', 'F', 'Damnificada', NOW() - INTERVAL '54 days', NOW() - INTERVAL '54 days'),
  ((SELECT id FROM incidents WHERE address LIKE '%Laureles%'),
   'Luis Alberto Quispe',  '1990-03-18', '47231890', '943210987', 'M', 'Afectado',    NOW() - INTERVAL '54 days', NOW() - INTERVAL '54 days'),
  ((SELECT id FROM incidents WHERE address LIKE '%Laureles%'),
   'Milagros Ccopa Ramos', '1985-06-25', '43217865', NULL,        'F', 'Damnificada', NOW() - INTERVAL '54 days', NOW() - INTERVAL '54 days'),

  -- Deslizamiento Ate (incidencia 3)
  ((SELECT id FROM incidents WHERE address LIKE '%Las Flores%' AND district_id = (SELECT id FROM districts WHERE name = 'Ate')),
   'Tomás Vargas Lozano',  '1960-12-08', '08765432', '912345678', 'M', 'Herido leve', NOW() - INTERVAL '43 days', NOW() - INTERVAL '43 days'),
  ((SELECT id FROM incidents WHERE address LIKE '%Las Flores%' AND district_id = (SELECT id FROM districts WHERE name = 'Ate')),
   'Elsa Vargas Díaz',     '1963-05-14', '12345678', NULL,        'F', 'Afectada',    NOW() - INTERVAL '43 days', NOW() - INTERVAL '43 days'),

  -- Incendio El Agustino (incidencia 7)
  ((SELECT id FROM incidents WHERE address LIKE '%Las Flores%' AND district_id = (SELECT id FROM districts WHERE name = 'El Agustino')),
   'Marco Sánchez López',  '1980-08-19', '40123456', '976543210', 'M', 'Damnificado', NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days'),
  ((SELECT id FROM incidents WHERE address LIKE '%Las Flores%' AND district_id = (SELECT id FROM districts WHERE name = 'El Agustino')),
   'Ana Sánchez López',    '1982-02-27', '41234567', '976543210', 'F', 'Damnificada', NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days'),
  ((SELECT id FROM incidents WHERE address LIKE '%Las Flores%' AND district_id = (SELECT id FROM districts WHERE name = 'El Agustino')),
   'Diego Sánchez Pérez',  '2010-11-01', '98765432', NULL,        'M', 'Damnificado', NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days'),

  -- Colapso VMT (incidencia 6)
  ((SELECT id FROM incidents WHERE address LIKE '%Rinconada%'),
   'Yolanda Flores Inca',  '1955-03-10', '07654321', '934567891', 'F', 'Herida moderada', NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'),
  ((SELECT id FROM incidents WHERE address LIKE '%Rinconada%'),
   'Roberto Tupa Quispe',  '1988-09-05', '44556677', '923456789', 'M', 'Herido moderada', NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'),

  -- Pérdida parcial Comas (incidencia 8)
  ((SELECT id FROM incidents WHERE address LIKE '%Álamo%'),
   'Esperanza Rojas Neira','1971-07-30', '22345678', '965432109', 'F', 'Damnificada', NOW() - INTERVAL '130 days', NOW() - INTERVAL '130 days'),
  ((SELECT id FROM incidents WHERE address LIKE '%Álamo%'),
   'Mario Rojas Neira',    '1969-01-14', '19876543', NULL,        'M', 'Damnificado', NOW() - INTERVAL '130 days', NOW() - INTERVAL '130 days');

-- ------------------------------------------------------------
-- 7. INICIATIVAS AMBIENTALES
-- ------------------------------------------------------------
INSERT INTO environmental_initiatives
  (title, description, responsible, location, district_id,
   start_date, end_date, status, category,
   created_by_id, updated_by_id, created_at, updated_at)
VALUES
  ('Reforestación de laderas en Lurín',
   'Plantación de 500 árboles nativos en laderas erosionadas para reducir riesgo de deslizamientos y mejorar cobertura vegetal.',
   'Juan Pérez Especialista',
   'Cerro Candela, Lurín',
   (SELECT id FROM districts WHERE name = 'Lurín'),
   '2025-06-01', '2025-11-30', 'COMPLETED', 'REFORESTACION',
   (SELECT id FROM users WHERE email = 'especialista@caritas.pe'),
   (SELECT id FROM users WHERE email = 'admin@caritas.pe'),
   NOW() - INTERVAL '300 days', NOW() - INTERVAL '120 days'),

  ('Limpieza del río Rímac — tramo El Agustino',
   'Extracción de residuos sólidos y escombros en 2 km del cauce del río para prevenir obstrucciones que causen inundaciones.',
   'María García Brigadista',
   'Margen izquierda río Rímac, El Agustino',
   (SELECT id FROM districts WHERE name = 'El Agustino'),
   '2026-01-15', '2026-06-15', 'IN_PROGRESS', 'LIMPIEZA',
   (SELECT id FROM users WHERE email = 'brigadista@caritas.pe'),
   (SELECT id FROM users WHERE email = 'brigadista@caritas.pe'),
   NOW() - INTERVAL '90 days', NOW() - INTERVAL '20 days'),

  ('Puntos de reciclaje comunitario en SJL',
   'Instalación de 12 puntos de acopio diferenciado (plástico, papel, vidrio, metal) en los mercados principales del distrito.',
   'Juan Pérez Especialista',
   'Mercados Huáscar, Zárate y Canto Grande, SJL',
   (SELECT id FROM districts WHERE name = 'San Juan de Lurigancho'),
   '2026-04-01', '2026-10-31', 'PLANNED', 'RECICLAJE',
   (SELECT id FROM users WHERE email = 'especialista@caritas.pe'),
   NULL,
   NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),

  ('Educación ambiental en escuelas de Comas',
   'Talleres de gestión de riesgos y cuidado del medio ambiente para estudiantes de primaria en 8 instituciones educativas.',
   'Carlos Ramos Autorizado',
   'Instituciones educativas, Comas',
   (SELECT id FROM districts WHERE name = 'Comas'),
   '2025-03-01', '2025-12-15', 'COMPLETED', 'EDUCACION',
   (SELECT id FROM users WHERE email = 'autorizado@caritas.pe'),
   (SELECT id FROM users WHERE email = 'admin@caritas.pe'),
   NOW() - INTERVAL '400 days', NOW() - INTERVAL '110 days'),

  ('Monitoreo de calidad del agua — quebradas Ate',
   'Instalación de 5 puntos de monitoreo en quebradas de Ate para detectar contaminación y variaciones de caudal en época de lluvias.',
   'Juan Pérez Especialista',
   'Quebradas Huaycán, Jicamarca y Santa Clara, Ate',
   (SELECT id FROM districts WHERE name = 'Ate'),
   '2026-02-01', '2026-08-31', 'IN_PROGRESS', 'MONITOREO',
   (SELECT id FROM users WHERE email = 'especialista@caritas.pe'),
   (SELECT id FROM users WHERE email = 'especialista@caritas.pe'),
   NOW() - INTERVAL '73 days', NOW() - INTERVAL '10 days'),

  ('Reforestación en Pachacámac — cuenca alta',
   'Revegetación de 3 hectáreas en cuenca alta para reducir erosión y regular el flujo hídrico que abastece a comunidades ribereñas.',
   'María García Brigadista',
   'Cuenca alta río Lurín, Pachacámac',
   (SELECT id FROM districts WHERE name = 'Pachacámac'),
   '2026-05-01', '2026-12-31', 'PLANNED', 'REFORESTACION',
   (SELECT id FROM users WHERE email = 'brigadista@caritas.pe'),
   NULL,
   NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days');

-- ------------------------------------------------------------
-- 8. ACTUALIZAR SECUENCIAS
-- ------------------------------------------------------------
SELECT setval(pg_get_serial_sequence('event_types',              'id'), MAX(id)) FROM event_types;
SELECT setval(pg_get_serial_sequence('districts',                'id'), MAX(id)) FROM districts;
SELECT setval(pg_get_serial_sequence('parishes',                 'id'), MAX(id)) FROM parishes;
SELECT setval(pg_get_serial_sequence('users',                    'id'), MAX(id)) FROM users;
SELECT setval(pg_get_serial_sequence('incidents',                'id'), MAX(id)) FROM incidents;
SELECT setval(pg_get_serial_sequence('affected_persons',         'id'), MAX(id)) FROM affected_persons;
SELECT setval(pg_get_serial_sequence('environmental_initiatives','id'), MAX(id)) FROM environmental_initiatives;
