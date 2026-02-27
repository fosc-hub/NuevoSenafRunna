-- DATOS DE PRUEBA (SEED DATA) PARA SUPABASE
-- Ejecuta esto en el SQL Editor para tener datos iniciales

-- 1. TIPOS DE DISPOSITIVO
INSERT INTO tipo_dispositivo (nombre, descripcion) VALUES
('Residencia Propia', 'Dispositivo de cuidado en el hogar familiar'),
('Familia de Acogimiento', 'Programa de familias de acogida'),
('Residencia Juvenil', 'Centro de cuidado institucional'),
('Hospital', 'Internación sanitaria');

-- 2. MOTIVOS DE INTERVENCIÓN
INSERT INTO motivo_intervencion (nombre, descripcion) VALUES
('Vulneración de Derechos', 'Casos de maltrato o negligencia'),
('Seguimiento', 'Control periódico de la medida'),
('Cese', 'Finalización de la intervención'),
('Ratificación Judicial', 'Trámite de validación por juez');

-- 3. SUBMOTIVOS DE INTERVENCIÓN
INSERT INTO submotivo_intervencion (motivo_id, nombre) VALUES
(1, 'Maltrato Físico'),
(1, 'Abuso Sexual Infantil'),
(1, 'Negligencia Grave'),
(2, 'Control de Escolaridad'),
(2, 'Control Sanitario'),
(3, 'Revinculación cumplida'),
(3, 'Mayoría de edad');

-- 4. CATEGORÍAS DE INTERVENCION
INSERT INTO categoria_intervencion (nombre) VALUES
('Visita Domiciliaria'),
('Entrevista Individual'),
('Mesa Interinstitucional'),
('Informe Técnico');

-- 5. PERSONA DE PRUEBA (NNyA)
INSERT INTO persona (nombre, apellido, fecha_nacimiento, dni, situacion_dni, genero, nnya) VALUES
('Juan', 'Pérez', '2015-05-20', 55123456, 'VALIDO', 'MASCULINO', true),
('Lucía', 'García', '2018-10-12', 60987654, 'VALIDO', 'FEMENINO', true);

-- 6. LEGAJO DE PRUEBA
INSERT INTO legajo (numero_legajo, nnya_id, info_legajo) VALUES
('L-2024-0001', 1, 'Legajo inicial de prueba para Juan Pérez'),
('L-2024-0002', 2, 'Legajo inicial de prueba para Lucía García');

-- 7. DEMANDA DE PRUEBA
INSERT INTO demanda (fecha_y_hora_ingreso, origen, nnya_principal_id, estado_demanda, descripcion) VALUES
(now() - interval '2 days', 'WEB', 1, 'URGENTE', 'Ingreso por denuncia vecinal de maltrato.'),
(now() - interval '1 day', 'TELEFONO', 2, 'NO_URGENTE', 'Pedido de seguimiento por parte de la escuela.');
