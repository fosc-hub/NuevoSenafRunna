# PLTM-03 Fase 2: Guía de Integración Frontend

**Fecha**: 2026-02-01
**Módulo**: Informes Mensuales de Seguimiento
**Versión API**: v2.0

---

## Resumen de Cambios

Se agregaron las siguientes funcionalidades al módulo de Informes Mensuales:

| Funcionalidad | Descripción | Impacto Frontend |
|---------------|-------------|------------------|
| Plantillas descargables | Descargar plantilla PDF para completar | Nuevo botón "Descargar Plantilla" |
| Subir plantilla completada | Subir archivo de plantilla llenada | Nuevo campo de upload |
| Estado VENCIDO | Informes con fecha pasada se marcan automáticamente | Nuevo estado en UI |
| Estado COMPLETADO_TARDIO | Distingue entregas fuera de plazo | Nuevo estado en UI |

---

## Nuevos Endpoints

### 1. Plantillas de Informes (Global)

#### Listar Plantillas
```http
GET /api/plantillas-informe/
Authorization: Bearer {token}
```

**Response 200:**
```json
[
  {
    "id": 1,
    "nombre": "Plantilla Informe Seguimiento v1",
    "descripcion": "Plantilla oficial para informes mensuales",
    "tipo_plantilla": "INFORME_SEGUIMIENTO",
    "tipo_plantilla_display": "Informe de Seguimiento Mensual",
    "archivo": "/media/plantillas/informes/2026/02/plantilla.pdf",
    "url_archivo": "https://api.runna.gob.ar/media/plantillas/informes/2026/02/plantilla.pdf",
    "version": "1.0",
    "activa": true,
    "fecha_creacion": "2026-02-01T10:00:00Z",
    "fecha_modificacion": "2026-02-01T10:00:00Z",
    "creado_por": 1,
    "creado_por_nombre": "Admin SENAF"
  }
]
```

#### Obtener Plantilla Activa
```http
GET /api/plantillas-informe/activa/?tipo=INFORME_SEGUIMIENTO
Authorization: Bearer {token}
```

**Query Params:**
- `tipo`: `INFORME_SEGUIMIENTO` (default) | `INFORME_CIERRE`

**Response 200:** Mismo formato que arriba (objeto único)

**Response 404:**
```json
{
  "detail": "No hay plantilla activa para tipo INFORME_SEGUIMIENTO."
}
```

#### Descargar Plantilla
```http
GET /api/plantillas-informe/{id}/descargar/
Authorization: Bearer {token}
```

**Response 200:** Archivo binario (PDF/DOCX) con headers:
```
Content-Disposition: attachment; filename="Plantilla_v1.0.pdf"
Content-Type: application/pdf
```

---

### 2. Plantilla desde Contexto de Medida

#### Descargar Plantilla (acceso rápido)
```http
GET /api/medidas/{medida_id}/informes-seguimiento/plantilla/
Authorization: Bearer {token}
```

**Response 200:** Archivo binario de la plantilla activa

**Response 404:**
```json
{
  "detail": "No hay plantilla activa disponible para informes de seguimiento."
}
```

#### Info de Plantilla (sin descargar)
```http
GET /api/medidas/{medida_id}/informes-seguimiento/plantilla-info/
Authorization: Bearer {token}
```

**Response 200:** Metadatos de la plantilla activa (útil para mostrar versión, nombre, etc.)

---

### 3. Subir Plantilla Completada

#### Subir Archivo a Informe Pendiente
```http
POST /api/medidas/{medida_id}/informes-seguimiento/{informe_id}/subir-plantilla/
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Body (multipart):**
```
plantilla_archivo: [archivo.pdf]
```

**Response 200:**
```json
{
  "id": 1,
  "numero_informe": 1,
  "estado": "PENDIENTE",
  "plantilla_archivo": "/media/informes_seguimiento/plantillas_completadas/2026/02/informe_1.pdf",
  "url_plantilla_archivo": "https://api.runna.gob.ar/media/...",
  ...
}
```

**Response 400 (informe completado):**
```json
{
  "detail": "No se puede subir plantilla a un informe completado."
}
```

**Response 400 (sin archivo):**
```json
{
  "plantilla_archivo": ["El archivo de plantilla es requerido."]
}
```

---

### 4. Completar Informe (Actualizado)

```http
POST /api/medidas/{medida_id}/informes-seguimiento/{informe_id}/completar/
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Body (multipart):**
```
contenido: "Texto del informe mensual con observaciones..."
plantilla_archivo: [archivo.pdf]  // OPCIONAL
```

**Response 200:**
```json
{
  "id": 1,
  "numero_informe": 1,
  "estado": "COMPLETADO",           // o "COMPLETADO_TARDIO"
  "estado_display": "Completado",   // o "Completado Tardío"
  "entrega_tardia": false,          // true si fecha_completado > fecha_vencimiento
  "fecha_completado": "2026-02-01T15:30:00Z",
  "autor": 5,
  "autor_nombre": "Juan Pérez",
  "plantilla_archivo": "/media/...",
  "url_plantilla_archivo": "https://...",
  ...
}
```

---

## Cambios en Responses Existentes

### Listado de Informes (campos nuevos)

```http
GET /api/medidas/{medida_id}/informes-seguimiento/
```

**Nuevos campos en cada informe:**
```json
{
  "id": 1,
  "numero_informe": 1,
  "fecha_vencimiento": "2026-03-01",
  "estado": "PENDIENTE",              // Valores posibles: PENDIENTE, VENCIDO, COMPLETADO, COMPLETADO_TARDIO
  "estado_display": "Pendiente",      // NUEVO: texto legible
  "entrega_tardia": false,            // NUEVO: boolean
  "tiene_plantilla": false,           // NUEVO: indica si tiene archivo subido
  "esta_vencido": false,
  "dias_para_vencimiento": 28,
  ...
}
```

### Detalle de Informe (campos nuevos)

```http
GET /api/medidas/{medida_id}/informes-seguimiento/{id}/
```

**Nuevos campos:**
```json
{
  ...
  "plantilla_archivo": null,           // NUEVO: path del archivo
  "url_plantilla_archivo": null,       // NUEVO: URL completa para descarga
  "entrega_tardia": false,             // NUEVO
  "estado_display": "Pendiente",       // NUEVO
  ...
}
```

---

## Estados del Informe

| Estado | Display | Descripción | Color Sugerido |
|--------|---------|-------------|----------------|
| `PENDIENTE` | "Pendiente" | Informe creado, esperando completar | 🟡 Amarillo |
| `VENCIDO` | "Vencido" | Fecha pasada sin completar | 🔴 Rojo |
| `COMPLETADO` | "Completado" | Entregado a tiempo | 🟢 Verde |
| `COMPLETADO_TARDIO` | "Completado Tardío" | Entregado después del vencimiento | 🟠 Naranja |

### Transiciones de Estado

```
PENDIENTE ──────────────────────────────────────┐
    │                                           │
    │ (fecha pasada + Celery task)              │ (usuario completa)
    ▼                                           │
VENCIDO ────────────────────────────────────────┤
    │                                           │
    │ (usuario completa después de vencimiento) │
    ▼                                           ▼
COMPLETADO_TARDIO                          COMPLETADO
```

---

## Flujo de Usuario Sugerido

### 1. Ver Informes Pendientes

```
Usuario entra a detalle de Medida
  → Tab "Informes de Seguimiento"
  → Lista de informes con estados y fechas
  → Filtros: Todos | Pendientes | Vencidos | Completados
```

### 2. Completar un Informe

```
Usuario selecciona informe PENDIENTE o VENCIDO
  → Botón "Descargar Plantilla" (GET /plantilla/)
  → Usuario completa offline el PDF/DOCX
  → Botón "Subir Plantilla" (POST /subir-plantilla/)
  → Campo de texto "Contenido/Observaciones"
  → Botón "Completar Informe" (POST /completar/)
  → Sistema muestra estado COMPLETADO o COMPLETADO_TARDIO
```

### 3. Ver Informe Completado

```
Usuario ve informe COMPLETADO
  → Contenido (solo lectura)
  → Archivo de plantilla (descargable)
  → Fecha de completado
  → Autor
  → Indicador "Entregado a tiempo" o "Entrega tardía"
```

---

## Componentes UI Sugeridos

### Badge de Estado

```jsx
// Ejemplo React
const estadoConfig = {
  PENDIENTE: { color: 'yellow', icon: 'clock' },
  VENCIDO: { color: 'red', icon: 'alert-circle' },
  COMPLETADO: { color: 'green', icon: 'check-circle' },
  COMPLETADO_TARDIO: { color: 'orange', icon: 'alert-triangle' }
};

<Badge color={estadoConfig[informe.estado].color}>
  {informe.estado_display}
</Badge>
```

### Botón Descargar Plantilla

```jsx
<Button
  onClick={() => window.open(`/api/medidas/${medidaId}/informes-seguimiento/plantilla/`)}
  disabled={!plantillaDisponible}
>
  <DownloadIcon /> Descargar Plantilla
</Button>
```

### Upload de Plantilla Completada

```jsx
<FileUpload
  accept=".pdf,.doc,.docx"
  maxSize={10 * 1024 * 1024} // 10MB
  onUpload={(file) => subirPlantilla(informeId, file)}
  disabled={informe.estado === 'COMPLETADO' || informe.estado === 'COMPLETADO_TARDIO'}
/>
```

---

## Validaciones Frontend

| Acción | Validación | Mensaje Error |
|--------|------------|---------------|
| Subir plantilla | Estado no completado | "No se puede subir plantilla a un informe completado" |
| Completar informe | Contenido requerido | "El contenido del informe es requerido" |
| Completar informe | Estado no completado | "El informe ya está completado" |
| Editar contenido | Estado no completado | "No se puede modificar un informe completado" |

---

## Preguntas Frecuentes

**¿Qué pasa si no hay plantilla activa?**
- El endpoint `/plantilla/` retorna 404
- Mostrar mensaje: "No hay plantilla disponible. Contacte al administrador."

**¿Se puede completar sin subir plantilla?**
- Sí, el campo `plantilla_archivo` es opcional
- Solo se requiere el campo `contenido`

**¿Cómo sé si el informe fue entregado tarde?**
- Campo `entrega_tardia: true` + estado `COMPLETADO_TARDIO`
- O comparar `fecha_completado` > `fecha_vencimiento`

**¿Los informes se marcan como vencidos automáticamente?**
- Sí, un proceso diario (Celery) actualiza PENDIENTE → VENCIDO
- El frontend puede asumir que si `esta_vencido: true` y `estado: PENDIENTE`, próximamente cambiará a VENCIDO

---

## Contacto

Para dudas técnicas sobre la API, contactar al equipo Backend.