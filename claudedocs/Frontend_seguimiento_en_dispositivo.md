# API Documentation: Módulo de Seguimiento en Dispositivo (SEG-01 a SEG-06)

**Fecha**: 2026-03-29
**Versión API**: 2.0 (Breaking changes in SEG-01)
**Base URL**: `https://api.runna.senaf.gob.ar/api/`

---

## 🎯 Índice Rápido

| Código | Funcionalidad | Endpoint Base | Métodos | Status |
|--------|---------------|---------------|---------|--------|
| SEG-01 | Situación del NNyA | `/medidas/{id}/situacion-dispositivo/` | GET, POST | ✅ FIXED |
| SEG-02 | Información Educativa | `/medidas/{id}/info-educativa/` | GET, PATCH | ✅ FIXED |
| SEG-03 | Información de Salud | `/medidas/{id}/info-salud/` | GET, PATCH | ✅ FIXED |
| SEG-04 | Talleres | `/medidas/{id}/talleres/` | GET, POST, PATCH, DELETE | ✅ OK |
| SEG-05 | Cambio de Lugar | `/medidas/{id}/cambio-lugar/` | GET, POST | ✅ OK |
| SEG-06 | Notas de Seguimiento | `/medidas/{id}/notas-seguimiento/` | GET, POST, DELETE | ✅ OK |

---

## 🚨 BREAKING CHANGES - SEG-01

### Migración de API v1.0 a v2.0

**CRÍTICO**: El endpoint de Situación Dispositivo (SEG-01) tuvo cambios significativos en el esquema de datos.

#### Cambios en Campos

| Campo Antiguo (v1.0) | Campo Nuevo (v2.0) | Tipo | Notas |
|----------------------|---------------------|------|-------|
| `local_centro_vida` (FK) | ❌ ELIMINADO | - | Ya no se requiere |
| `local_centro_vida_nombre` (string) | ❌ ELIMINADO | - | Ya no se requiere |
| `sector` (string) | ❌ ELIMINADO | - | Ya no se requiere |
| `permiso_otorgado` (boolean) | ❌ ELIMINADO | - | Reemplazado por `tipo_situacion` |
| `visita_recibida` (boolean) | ❌ ELIMINADO | - | Ya no se requiere |
| - | ✅ `tipo_situacion` (string) | NUEVO | Choices: AUTORIZACION, PERMISO, PERMISO_PROLONGADO |
| - | ✅ `fecha` (date) | NUEVO | Fecha de la situación (YYYY-MM-DD) |
| `observaciones` (text) | ✅ `observaciones` (text) | MANTIENE | Sin cambios |
| `fecha_registro` (datetime) | ✅ `fecha_registro` (datetime) | MANTIENE | Auto-generado (read-only) |

#### Ejemplo de Migración

**Antes (v1.0)**:
```json
{
  "local_centro_vida": 5,
  "local_centro_vida_nombre": "Hogar San José",
  "sector": "Sector A",
  "permiso_otorgado": true,
  "visita_recibida": false,
  "observaciones": "Permiso para salida familiar"
}
```

**Después (v2.0)**:
```json
{
  "tipo_situacion": "PERMISO",
  "fecha": "2026-03-28",
  "observaciones": "Permiso para salida familiar"
}
```

#### Guía de Conversión para Frontend

```javascript
// MAPPING de valores antiguos a nuevos
const convertSituacionV1toV2 = (oldData) => {
  // Mapeo de permiso_otorgado → tipo_situacion
  let tipo_situacion = 'AUTORIZACION'; // default

  if (oldData.permiso_otorgado === true) {
    tipo_situacion = 'PERMISO';
  }

  // Si detectas "prolongado" en sector u observaciones, usar PERMISO_PROLONGADO
  if (oldData.sector?.toLowerCase().includes('prolongado') ||
      oldData.observaciones?.toLowerCase().includes('prolongado')) {
    tipo_situacion = 'PERMISO_PROLONGADO';
  }

  return {
    tipo_situacion: tipo_situacion,
    fecha: oldData.fecha_registro?.split('T')[0] || new Date().toISOString().split('T')[0],
    observaciones: oldData.observaciones || ''
  };
};
```

---

## SEG-01: Situación del NNyA en Dispositivo

### Endpoints Disponibles

#### 1. Listar Situaciones
```
GET /api/medidas/{medida_id}/situacion-dispositivo/
```

**Descripción**: Obtiene todas las situaciones registradas para una medida específica.

**Parámetros de Ruta**:
- `medida_id` (integer, requerido): ID de la medida

**Headers Requeridos**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Respuesta Exitosa (200 OK)**:
```json
[
  {
    "id": 1,
    "medida": 42,
    "tipo_situacion": "AUTORIZACION",
    "tipo_situacion_display": "Autorización",
    "fecha": "2026-03-20",
    "observaciones": "Autorización inicial",
    "fecha_registro": "2026-03-20T10:30:00Z"
  },
  {
    "id": 2,
    "medida": 42,
    "tipo_situacion": "PERMISO",
    "tipo_situacion_display": "Permiso",
    "fecha": "2026-03-28",
    "observaciones": "Permiso para salida familiar fin de semana",
    "fecha_registro": "2026-03-28T14:15:00Z"
  }
]
```

**Errores Posibles**:
- `404 Not Found`: Medida no existe
- `403 Forbidden`: Usuario sin permisos

---

#### 2. Crear Nueva Situación
```
POST /api/medidas/{medida_id}/situacion-dispositivo/
```

**Descripción**: Registra una nueva situación para el NNyA.

**Request Body**:
```json
{
  "tipo_situacion": "PERMISO",
  "fecha": "2026-03-28",
  "observaciones": "Permiso para salida familiar fin de semana"
}
```

**Validaciones**:
- `tipo_situacion` (requerido): Debe ser uno de: `AUTORIZACION`, `PERMISO`, `PERMISO_PROLONGADO`
- `fecha` (requerido): Formato YYYY-MM-DD, no puede ser fecha futura
- `observaciones` (opcional): Texto libre

**Respuesta Exitosa (201 Created)**:
```json
{
  "id": 3,
  "medida": 42,
  "tipo_situacion": "PERMISO",
  "tipo_situacion_display": "Permiso",
  "fecha": "2026-03-28",
  "observaciones": "Permiso para salida familiar fin de semana",
  "fecha_registro": "2026-03-28T14:20:00Z"
}
```

**Errores Posibles**:
- `400 Bad Request`: Validación fallida (fecha futura, tipo_situacion inválido)
- `404 Not Found`: Medida no existe
- `403 Forbidden`: Usuario sin permisos

**Ejemplo de Error**:
```json
{
  "fecha": ["La fecha no puede ser futura"]
}
```

---

#### 3. Obtener Situación Actual
```
GET /api/medidas/{medida_id}/situacion-dispositivo/actual/
```

**Descripción**: Retorna la situación más reciente del NNyA (basado en `fecha_registro`).

**Respuesta Exitosa (200 OK)**:
```json
{
  "id": 3,
  "medida": 42,
  "tipo_situacion": "PERMISO",
  "tipo_situacion_display": "Permiso",
  "fecha": "2026-03-28",
  "observaciones": "Permiso para salida familiar fin de semana",
  "fecha_registro": "2026-03-28T14:20:00Z"
}
```

**Respuesta Sin Datos (404 NOT FOUND)**:
```json
{
  "detail": "No hay situaciones registradas para esta medida"
}
```

---

#### 4. Historial de Auditoría
```
GET /api/medidas/{medida_id}/situacion-dispositivo/historial/
```

**Descripción**: Obtiene el historial completo de cambios (audit trail) de situaciones.

**Respuesta Exitosa (200 OK)**:
```json
[
  {
    "id": 1,
    "parent": 3,
    "medida": 42,
    "tipo_situacion": "PERMISO",
    "tipo_situacion_display": "Permiso",
    "fecha": "2026-03-28",
    "observaciones": "Permiso para salida familiar fin de semana",
    "fecha_registro": "2026-03-28T14:20:00Z",
    "action": "CREATE",
    "usuario": "jperez",
    "timestamp": "2026-03-28T14:20:05Z",
    "descripcion": "Situación Permiso creada para fecha 2026-03-28"
  }
]
```

**Campos de Auditoría**:
- `action`: `CREATE`, `UPDATE`, `DELETE`
- `usuario`: Username del usuario que realizó la acción
- `timestamp`: Momento exacto de la acción
- `descripcion`: Descripción legible de la acción

---

## SEG-02: Información Educativa Heredada

### Endpoints Disponibles

#### 1. Obtener Información Educativa
```
GET /api/medidas/{medida_id}/info-educativa/
```

**Descripción**: Obtiene la información educativa del NNyA asociado a la medida (heredada desde `TPersona → TEducacion`).

**Respuesta Exitosa (200 OK)**:
```json
{
  "nivel_alcanzado": "SECUNDARIO",
  "esta_escolarizado": true,
  "ultimo_cursado": "TERCERO_SECUNDARIO",
  "tipo_escuela": "PUBLICA",
  "comentarios_educativos": "Buen rendimiento académico",
  "institucion_educativa_id": 5,
  "institucion_educativa_nombre": "Escuela Normal Superior"
}
```

**Respuesta Sin Datos (404 Not Found)**:
```json
{
  "detail": "No hay información educativa registrada para este NNyA."
}
```

---

#### 2. Actualizar Información Educativa (✅ FIXED)
```
PATCH /api/medidas/{medida_id}/info-educativa/
```

**Descripción**: Actualiza parcialmente la información educativa del NNyA.

**Request Body** (todos los campos opcionales en PATCH):
```json
{
  "nivel_alcanzado": "SECUNDARIO",
  "esta_escolarizado": true,
  "ultimo_cursado": "CUARTO_SECUNDARIO",
  "tipo_escuela": "PUBLICA",
  "comentarios_educativos": "Actualización de nivel cursado",
  "institucion_educativa_id": 5
}
```

**Validaciones**:
- `nivel_alcanzado`: Choices: `PRIMARIO`, `SECUNDARIO`, `TERCIARIO`, `UNIVERSITARIO`, `OTRO`
- `esta_escolarizado`: Boolean
- `ultimo_cursado`: Choices: `PRIMERO`, `SEGUNDO`, ..., `QUINTO_SECUNDARIO`, `OTRO`
- `tipo_escuela`: Choices: `PUBLICA`, `PRIVADA`, `ESTATAL`, `COMUN`, `ESPECIAL`, `OTRO`
- `institucion_educativa_id`: Debe existir en la base de datos (FK)

**Respuesta Exitosa (200 OK)**:
```json
{
  "nivel_alcanzado": "SECUNDARIO",
  "esta_escolarizado": true,
  "ultimo_cursado": "CUARTO_SECUNDARIO",
  "tipo_escuela": "PUBLICA",
  "comentarios_educativos": "Actualización de nivel cursado",
  "institucion_educativa_id": 5,
  "institucion_educativa_nombre": "Escuela Normal Superior"
}
```

**Errores Posibles**:
- `400 Bad Request`: Choice inválido, institucion_educativa_id no existe
- `404 Not Found`: No hay información educativa para actualizar

**🐛 BUG FIX**: Este endpoint ahora soporta PATCH correctamente (antes crasheaba por falta de `update()` method).

---

## SEG-03: Información de Salud Heredada

### Endpoints Disponibles

#### 1. Obtener Información de Salud
```
GET /api/medidas/{medida_id}/info-salud/
```

**Descripción**: Obtiene la información de cobertura médica del NNyA (heredada desde `TPersona → TCoberturaMedica`).

**Respuesta Exitosa (200 OK)**:
```json
{
  "obra_social": "IOMA",
  "intervencion": "OBRA_SOCIAL",
  "auh": false,
  "observaciones": "Cobertura activa",
  "institucion_sanitaria_id": 3,
  "institucion_sanitaria_nombre": "Hospital Central",
  "medico_cabecera_id": 7,
  "medico_cabecera_nombre": "Dr. Juan Pérez",
  "medico_cabecera_email": "jperez@hospital.gob.ar",
  "medico_cabecera_telefono": "+54 11 4567-8900"
}
```

**Respuesta Sin Datos (404 Not Found)**:
```json
{
  "detail": "No hay información de salud registrada para este NNyA."
}
```

---

#### 2. Actualizar Información de Salud (✅ FIXED)
```
PATCH /api/medidas/{medida_id}/info-salud/
```

**Descripción**: Actualiza parcialmente la información de cobertura médica del NNyA.

**Request Body** (todos los campos opcionales en PATCH):
```json
{
  "obra_social": "IOMA",
  "intervencion": "OBRA_SOCIAL",
  "auh": true,
  "observaciones": "Actualización de AUH",
  "institucion_sanitaria_id": 3,
  "medico_cabecera_id": 7
}
```

**Validaciones**:
- `obra_social`: Choices: `NO_POSEE`, `PAMI`, `IOMA`, `OSECAC`, `OSDE`, `OTRA`
- `intervencion`: Choices: `AUH`, `OBRA_SOCIAL`, `AMBAS`, `NINGUNA`
- `auh`: Boolean
- `institucion_sanitaria_id`: Debe existir (FK, opcional)
- `medico_cabecera_id`: Debe existir (FK, opcional)

**Respuesta Exitosa (200 OK)**:
```json
{
  "obra_social": "IOMA",
  "intervencion": "OBRA_SOCIAL",
  "auh": true,
  "observaciones": "Actualización de AUH",
  "institucion_sanitaria_id": 3,
  "institucion_sanitaria_nombre": "Hospital Central",
  "medico_cabecera_id": 7,
  "medico_cabecera_nombre": "Dr. Juan Pérez",
  "medico_cabecera_email": "jperez@hospital.gob.ar",
  "medico_cabecera_telefono": "+54 11 4567-8900"
}
```

**🐛 BUG FIX**: Este endpoint ahora soporta PATCH correctamente (antes crasheaba por falta de `update()` method).

---

## SEG-04: Talleres Recreativos/Sociolaborales

### Endpoints Disponibles

#### 1. Listar Talleres
```
GET /api/medidas/{medida_id}/talleres/
GET /api/medidas/{medida_id}/talleres/?incluir_finalizados=true
```

**Descripción**: Obtiene talleres activos del NNyA. Por defecto solo retorna talleres con `activo=True`.

**Query Parameters**:
- `incluir_finalizados` (opcional): Si es `true`, incluye talleres finalizados

**Respuesta Exitosa (200 OK)**:
```json
[
  {
    "id": 1,
    "medida": 42,
    "nombre": "Taller de Carpintería",
    "institucion": "Centro de Formación Profesional",
    "dias_horarios": "Lunes y Miércoles 14-17hs",
    "referente": "Lic. María González",
    "fecha_inicio": "2026-02-01",
    "fecha_fin": null,
    "observaciones": "Muy buen desempeño",
    "activo": true
  }
]
```

---

#### 2. Crear Taller
```
POST /api/medidas/{medida_id}/talleres/
```

**Request Body**:
```json
{
  "nombre": "Taller de Computación",
  "institucion": "Centro Comunitario",
  "dias_horarios": "Martes 15-18hs",
  "referente": "Prof. Carlos Ruiz",
  "fecha_inicio": "2026-04-01",
  "fecha_fin": null,
  "observaciones": "Iniciando nivel básico"
}
```

**Validaciones**:
- `nombre` (requerido, max 200 caracteres)
- `institucion` (requerido, max 200 caracteres)
- `fecha_inicio` (requerido, formato YYYY-MM-DD)
- `dias_horarios` (opcional, max 100 caracteres)
- `referente` (opcional, max 200 caracteres)
- `fecha_fin` (opcional, formato YYYY-MM-DD, debe ser >= fecha_inicio)
- `observaciones` (opcional, texto libre)

**Respuesta Exitosa (201 Created)**:
```json
{
  "id": 2,
  "medida": 42,
  "nombre": "Taller de Computación",
  "institucion": "Centro Comunitario",
  "dias_horarios": "Martes 15-18hs",
  "referente": "Prof. Carlos Ruiz",
  "fecha_inicio": "2026-04-01",
  "fecha_fin": null,
  "observaciones": "Iniciando nivel básico",
  "activo": true
}
```

---

#### 3. Actualizar Taller
```
PATCH /api/medidas/{medida_id}/talleres/{taller_id}/
```

**Request Body** (campos opcionales):
```json
{
  "fecha_fin": "2026-06-30",
  "observaciones": "Taller finalizado exitosamente",
  "activo": false
}
```

**Respuesta Exitosa (200 OK)**: Retorna el taller actualizado

---

#### 4. Eliminar Taller (Soft Delete)
```
DELETE /api/medidas/{medida_id}/talleres/{taller_id}/
```

**Descripción**: Realiza soft delete (marca `activo=False`, no elimina físicamente).

**Respuesta Exitosa (204 No Content)**: Sin cuerpo

---

## SEG-05: Cambio de Lugar de Resguardo

### Endpoints Disponibles

#### 1. Listar Cambios de Lugar
```
GET /api/medidas/{medida_id}/cambio-lugar/
```

**Respuesta Exitosa (200 OK)**:
```json
[
  {
    "id": 1,
    "medida": 42,
    "lugar_origen": 3,
    "lugar_origen_nombre": "Hogar San José",
    "lugar_destino": 5,
    "lugar_destino_nombre": "Hogar María Auxiliadora",
    "fecha_cambio": "2026-03-15",
    "motivo": "Necesidad de atención especializada",
    "observaciones": "Cambio coordinado con ambas instituciones"
  }
]
```

---

#### 2. Registrar Cambio de Lugar
```
POST /api/medidas/{medida_id}/cambio-lugar/
```

**Request Body**:
```json
{
  "lugar_origen": 3,
  "lugar_destino": 5,
  "fecha_cambio": "2026-03-15",
  "motivo": "Necesidad de atención especializada",
  "observaciones": "Cambio coordinado con ambas instituciones"
}
```

**Validaciones**:
- `lugar_origen` (requerido): ID de TLocalCentroVida
- `lugar_destino` (requerido): ID de TLocalCentroVida
- `fecha_cambio` (requerido, formato YYYY-MM-DD)
- `motivo` (requerido, max 200 caracteres)
- `observaciones` (opcional, texto libre)

**Respuesta Exitosa (201 Created)**: Retorna el cambio registrado

**⚠️ Nota**: Este endpoint usa `TLocalCentroVida` que está deprecado. En futuras versiones se migrará a `TSubtipoDispositivo`.

---

#### 3. Historial de Cambios (Auditoría)
```
GET /api/medidas/{medida_id}/cambio-lugar/historial/
```

**Descripción**: Retorna el historial completo de auditoría de cambios de lugar.

---

## SEG-06: Notas de Seguimiento

### Endpoints Disponibles

#### 1. Listar Notas
```
GET /api/medidas/{medida_id}/notas-seguimiento/
```

**Respuesta Exitosa (200 OK)**:
```json
[
  {
    "id": 1,
    "medida": 42,
    "fecha": "2026-03-28",
    "nota": "Entrevista con NNyA. Evolución favorable.",
    "autor": 15,
    "autor_nombre": "Lic. Ana Martínez",
    "fecha_creacion": "2026-03-28T16:30:00Z"
  }
]
```

---

#### 2. Crear Nota
```
POST /api/medidas/{medida_id}/notas-seguimiento/
```

**Request Body**:
```json
{
  "fecha": "2026-03-28",
  "nota": "Entrevista con NNyA. Evolución favorable."
}
```

**Validaciones**:
- `fecha` (requerido, formato YYYY-MM-DD)
- `nota` (requerido, texto libre)
- `autor`: Auto-asignado desde `request.user` (no enviar en request)

**Respuesta Exitosa (201 Created)**: Retorna la nota creada con `autor` asignado

---

#### 3. Eliminar Nota
```
DELETE /api/medidas/{medida_id}/notas-seguimiento/{nota_id}/
```

**Descripción**: Solo el autor de la nota puede eliminarla.

**Respuesta Exitosa (204 No Content)**: Sin cuerpo

**Errores Posibles**:
- `403 Forbidden`: Usuario no es el autor de la nota

---

## Autenticación

Todos los endpoints requieren autenticación JWT.

**Header Requerido**:
```
Authorization: Bearer {access_token}
```

**Obtener Token**:
```
POST /api/auth/token/
Content-Type: application/json

{
  "username": "usuario",
  "password": "contraseña"
}
```

**Respuesta**:
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

---

## Manejo de Errores

### Códigos de Estado HTTP

| Código | Significado | Cuándo Ocurre |
|--------|-------------|---------------|
| 200 | OK | Solicitud exitosa (GET, PATCH) |
| 201 | Created | Recurso creado exitosamente (POST) |
| 204 | No Content | Eliminación exitosa (DELETE) |
| 400 | Bad Request | Datos inválidos, validación fallida |
| 401 | Unauthorized | Token inválido o expirado |
| 403 | Forbidden | Sin permisos para la acción |
| 404 | Not Found | Recurso no encontrado |
| 500 | Internal Server Error | Error del servidor |

### Formato de Errores

**Error de Validación (400)**:
```json
{
  "campo": ["Mensaje de error específico"],
  "otro_campo": ["Otro mensaje de error"]
}
```

**Error Genérico (403, 404)**:
```json
{
  "detail": "Mensaje descriptivo del error"
}
```

---

## Soporte y Contacto

**Equipo Backend**: backend@runna.senaf.gob.ar
**Documentación Técnica**: https://docs.runna.senaf.gob.ar
**Repositorio**: https://github.com/senaf/runna-backend

**Versión del Documento**: 2.0
**Última Actualización**: 2026-03-29
