# PLTM-04: Historial de Seguimiento Unificado de Medida

**Fecha de Implementación**: 2026-02-01
**Estado**: ✅ Completado
**Backend**: Implementado y verificado
**Frontend**: Pendiente de integración

---

## 📋 Resumen Ejecutivo

Se implementó el módulo PLTM-04 que proporciona:
1. **Timeline unificado** de todos los eventos de una medida (actividades, intervenciones, etapas, etc.)
2. **Trazabilidad específica** de transiciones de etapas y estados de vigencia
3. **Exportación a CSV** para reportes

### Valor para el Usuario
- Visibilidad completa del historial de una medida en un solo lugar
- Auditoría de cambios con usuario y timestamp
- Filtrado por tipo de evento, fechas, etapa, categoría
- Exportación para análisis externo

---

## 🔌 Nuevos Endpoints API

### 1. Historial de Seguimiento Unificado

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/medidas/{medida_id}/historial-seguimiento/` | Lista timeline completo |
| GET | `/api/medidas/{medida_id}/historial-seguimiento/{id}/` | Detalle de un evento |
| GET | `/api/medidas/{medida_id}/historial-seguimiento/exportar/` | Exportar a CSV |
| GET | `/api/medidas/{medida_id}/historial-seguimiento/tipos/` | Lista tipos de evento |
| GET | `/api/medidas/{medida_id}/historial-seguimiento/resumen/` | Estadísticas |
| GET | `/api/historial-seguimiento-global/` | Historial global (solo Admin) |

### 2. Trazabilidad de Etapas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/medidas/{medida_id}/trazabilidad-etapas/` | Timeline de etapas y vigencia |
| GET | `/api/medidas/{medida_id}/trazabilidad-etapas/exportar/` | Exportar a CSV |
| GET | `/api/medidas/{medida_id}/trazabilidad-etapas/compacta/` | Vista simplificada para UI |

---

## 📊 Estructuras de Respuesta

### GET `/api/medidas/{id}/historial-seguimiento/`

**Query Parameters:**
- `fecha_desde` (date): Filtrar desde fecha
- `fecha_hasta` (date): Filtrar hasta fecha
- `tipo_evento` (string): Filtro exacto (ej: `ACTIVIDAD_CREADA`)
- `tipos_evento` (string): Múltiples tipos separados por coma
- `categoria` (string): `ACTIVIDAD`, `INTERVENCION`, `ETAPA`, `INFORME`, `SEGUIMIENTO`, `MEDIDA`, `OFICIO`, `MANUAL`
- `etapa` (int): ID de etapa
- `etapa_tipo` (string): `APERTURA`, `INNOVACION`, `PRORROGA`, `CESE`, `POST_CESE`, `PROCESO`
- `usuario` (int): ID de usuario
- `search` (string): Búsqueda en descripción
- `page` (int): Página (default 1)
- `page_size` (int): Items por página (default 50, max 200)

**Respuesta:**
```json
{
  "count": 125,
  "next": "/api/medidas/1/historial-seguimiento/?page=2",
  "previous": null,
  "results": [
    {
      "id": 45,
      "tipo_evento": "ACTIVIDAD_CREADA",
      "tipo_evento_display": "Actividad Creada",
      "descripcion_automatica": "Actividad 'Visita domiciliaria' creada para etapa APERTURA",
      "fecha_evento": "2025-01-20T14:30:00Z",
      "usuario": {
        "id": 5,
        "username": "jperez",
        "nombre_completo": "Juan Pérez"
      },
      "etapa": {
        "id": 12,
        "tipo_etapa": "APERTURA",
        "tipo_etapa_display": "Apertura",
        "estado": "PENDIENTE_NOTA_AVAL",
        "estado_display": "(3) Pendiente de Nota de Aval"
      },
      "actividad_id": 78,
      "deep_link": {
        "tipo": "ACTIVIDAD_CREADA",
        "medida_id": 1,
        "actividad_id": 78,
        "url": "/api/actividades/78/"
      }
    }
  ]
}
```

### GET `/api/medidas/{id}/historial-seguimiento/tipos/`

**Respuesta:**
```json
{
  "tipos": [
    {"codigo": "ACTIVIDAD_CREADA", "nombre": "Actividad Creada"},
    {"codigo": "ACTIVIDAD_EDITADA", "nombre": "Actividad Editada"},
    ...
  ],
  "categorias": {
    "ACTIVIDAD": [
      {"codigo": "ACTIVIDAD_CREADA", "nombre": "Actividad Creada"},
      {"codigo": "ACTIVIDAD_EDITADA", "nombre": "Actividad Editada"},
      ...
    ],
    "INTERVENCION": [...],
    "ETAPA": [...],
    "INFORME": [...],
    "SEGUIMIENTO": [...],
    "MEDIDA": [...],
    "OFICIO": [...],
    "MANUAL": [...]
  },
  "total": 36
}
```

### GET `/api/medidas/{id}/historial-seguimiento/resumen/`

**Respuesta:**
```json
{
  "total_eventos": 125,
  "por_tipo": {
    "ACTIVIDAD_CREADA": 15,
    "ACTIVIDAD_ESTADO_CAMBIO": 28,
    "INTERVENCION_REGISTRADA": 5,
    ...
  },
  "por_categoria": {
    "ACTIVIDAD": 58,
    "INTERVENCION": 12,
    "ETAPA": 8,
    ...
  },
  "primer_evento": "2025-01-15T10:00:00Z",
  "ultimo_evento": "2025-02-01T09:45:00Z"
}
```

### GET `/api/medidas/{id}/trazabilidad-etapas/`

**Query Parameters:**
- `fecha_desde` (date): Filtrar desde fecha
- `fecha_hasta` (date): Filtrar hasta fecha
- `tipo` (string): `etapas`, `vigencia`, `all` (default: `all`)

**Respuesta:**
```json
{
  "medida": {
    "id": 1,
    "numero_medida": "MED-2025-001",
    "tipo_medida": "MPE",
    "tipo_medida_display": "Medida de Protección Excepcional",
    "estado_vigencia": "VIGENTE",
    "estado_vigencia_display": "Vigente",
    "fecha_apertura": "2025-01-15T10:00:00Z",
    "fecha_cierre": null,
    "duracion_dias": 17
  },
  "etapas_timeline": [
    {
      "id": 12,
      "nombre": "Apertura de la Medida",
      "tipo_etapa": "APERTURA",
      "tipo_etapa_display": "Apertura",
      "estado": "PENDIENTE_NOTA_AVAL",
      "estado_display": "(3) Pendiente de Nota de Aval",
      "estado_especifico": {
        "id": 3,
        "codigo": "PENDIENTE_NOTA_AVAL",
        "nombre": "Pendiente de Nota de Aval",
        "orden": 3
      },
      "fecha_inicio_estado": "2025-01-15T10:00:00Z",
      "fecha_fin_estado": null,
      "esta_activa": true,
      "observaciones": null,
      "transiciones_estado": [
        {
          "fecha": "2025-01-15T10:00:00Z",
          "tipo_cambio": "+",
          "estado": "PENDIENTE_REGISTRO_INTERVENCION",
          "estado_display": "(1) Pendiente de registro de intervención",
          "tipo_etapa": "APERTURA",
          "tipo_etapa_display": "Apertura",
          "cambios": null,
          "usuario": "admin"
        },
        {
          "fecha": "2025-01-18T14:30:00Z",
          "tipo_cambio": "~",
          "estado": "PENDIENTE_APROBACION_REGISTRO",
          "estado_display": "(2) Pendiente de aprobación de registro",
          "tipo_etapa": "APERTURA",
          "tipo_etapa_display": "Apertura",
          "cambios": {
            "estado": {
              "anterior": "PENDIENTE_REGISTRO_INTERVENCION",
              "nuevo": "PENDIENTE_APROBACION_REGISTRO",
              "anterior_display": "(1) Pendiente de registro de intervención",
              "nuevo_display": "(2) Pendiente de aprobación de registro"
            }
          },
          "usuario": "jperez"
        }
      ]
    }
  ],
  "vigencia_timeline": [
    {
      "fecha": "2025-01-15T10:00:00Z",
      "tipo_cambio": "+",
      "estado_vigencia": "VIGENTE",
      "estado_vigencia_display": "Vigente",
      "estado_anterior": null,
      "estado_anterior_display": null,
      "usuario": "admin",
      "etapa_actual_id": 12
    }
  ],
  "etapa_actual": {
    "id": 12,
    "tipo_etapa": "APERTURA",
    "estado": "PENDIENTE_NOTA_AVAL",
    ...
  },
  "resumen": {
    "total_etapas": 1,
    "etapas_activas": 1,
    "etapas_cerradas": 0,
    "etapas_por_tipo": {
      "APERTURA": {"nombre": "Apertura", "cantidad": 1}
    },
    "primera_etapa_fecha": "2025-01-15T10:00:00Z",
    "ultima_etapa_fecha": "2025-01-15T10:00:00Z",
    "duracion_total_dias": 17,
    "tipo_medida": "MPE",
    "flujo_esperado": ["APERTURA", "INNOVACION", "PRORROGA", "CESE", "POST_CESE"]
  }
}
```

### GET `/api/medidas/{id}/trazabilidad-etapas/compacta/`

**Respuesta (optimizada para UI):**
```json
{
  "medida": {
    "id": 1,
    "numero_medida": "MED-2025-001",
    "tipo_medida": "MPE",
    "tipo_medida_display": "Medida de Protección Excepcional",
    "estado_vigencia": "VIGENTE",
    "estado_vigencia_display": "Vigente",
    "fecha_apertura": "2025-01-15T10:00:00Z",
    "fecha_cierre": null
  },
  "etapas": [
    {
      "orden": 1,
      "id": 12,
      "tipo_etapa": "APERTURA",
      "tipo_etapa_display": "Apertura",
      "estado": "PENDIENTE_NOTA_AVAL",
      "estado_display": "(3) Pendiente de Nota de Aval",
      "fecha_inicio": "2025-01-15T10:00:00Z",
      "fecha_fin": null,
      "esta_activa": true,
      "duracion_dias": null
    }
  ],
  "total_etapas": 1,
  "flujo": {
    "esperado": ["APERTURA", "INNOVACION", "PRORROGA", "CESE", "POST_CESE"],
    "real": ["APERTURA"],
    "proximas_posibles": ["INNOVACION", "PRORROGA", "CESE"],
    "completado": false
  }
}
```

---

## 🎨 Guía de Implementación Frontend

### 1. Componente Timeline de Historial

**Ubicación sugerida**: Detalle de Medida → Tab "Historial"

```tsx
// Ejemplo de estructura de componente
interface HistorialEvent {
  id: number;
  tipo_evento: string;
  tipo_evento_display: string;
  descripcion_automatica: string;
  fecha_evento: string;
  usuario: { username: string; nombre_completo: string };
  deep_link: { url: string };
}

// Filtros recomendados en UI
const filtrosDisponibles = [
  { label: 'Categoría', param: 'categoria', options: ['ACTIVIDAD', 'INTERVENCION', 'ETAPA', ...] },
  { label: 'Fecha desde', param: 'fecha_desde', type: 'date' },
  { label: 'Fecha hasta', param: 'fecha_hasta', type: 'date' },
  { label: 'Buscar', param: 'search', type: 'text' },
];
```

**Iconos sugeridos por categoría:**
| Categoría | Icono | Color |
|-----------|-------|-------|
| ACTIVIDAD | 📋 | Azul |
| INTERVENCION | 📝 | Verde |
| ETAPA | 🔄 | Morado |
| INFORME | 📊 | Naranja |
| SEGUIMIENTO | 👁️ | Cyan |
| MEDIDA | ⚖️ | Rojo |
| MANUAL | ✏️ | Gris |

### 2. Componente Trazabilidad de Etapas

**Ubicación sugerida**: Detalle de Medida → Card superior o Tab "Etapas"

Usar el endpoint `/trazabilidad-etapas/compacta/` para visualización tipo stepper:

```tsx
// Ejemplo de stepper horizontal
<Stepper activeStep={etapas.findIndex(e => e.esta_activa)}>
  {flujo.esperado.map((etapa, index) => {
    const etapaReal = etapas.find(e => e.tipo_etapa === etapa);
    return (
      <Step
        key={etapa}
        completed={etapaReal && !etapaReal.esta_activa}
        active={etapaReal?.esta_activa}
      >
        <StepLabel>{etapa}</StepLabel>
      </Step>
    );
  })}
</Stepper>
```

### 3. Exportación CSV

Agregar botón de descarga que llame a:
- `/api/medidas/{id}/historial-seguimiento/exportar/`
- `/api/medidas/{id}/trazabilidad-etapas/exportar/`

```tsx
const handleExport = async () => {
  const response = await fetch(`/api/medidas/${medidaId}/historial-seguimiento/exportar/`);
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `historial_seguimiento_${medida.numero_medida}.csv`;
  a.click();
};
```

---

## 📌 Tipos de Evento Disponibles (36 tipos)

### Actividades (PLTM)
- `ACTIVIDAD_CREADA` - Actividad Creada
- `ACTIVIDAD_EDITADA` - Actividad Editada
- `ACTIVIDAD_ESTADO_CAMBIO` - Cambio de Estado de Actividad
- `ACTIVIDAD_REPROGRAMADA` - Actividad Reprogramada
- `ACTIVIDAD_COMENTARIO` - Comentario en Actividad
- `ACTIVIDAD_ADJUNTO` - Adjunto en Actividad
- `ACTIVIDAD_VISADO` - Actividad Visada
- `ACTIVIDAD_TRANSFERIDA` - Actividad Transferida

### Intervenciones y Documentos (MED)
- `INTERVENCION_REGISTRADA` - Intervención Registrada
- `INTERVENCION_ENVIADA` - Intervención Enviada a Aprobación
- `INTERVENCION_APROBADA` - Intervención Aprobada
- `INTERVENCION_RECHAZADA` - Intervención Rechazada
- `NOTA_AVAL_EMITIDA` - Nota de Aval Emitida
- `NOTA_AVAL_OBSERVADA` - Nota de Aval Observada
- `INFORME_JURIDICO_CREADO` - Informe Jurídico Creado
- `INFORME_JURIDICO_ENVIADO` - Informe Jurídico Enviado
- `RATIFICACION_REGISTRADA` - Ratificación Judicial Registrada
- `INFORME_CIERRE_CREADO` - Informe de Cierre Creado

### Etapas y Estados
- `ETAPA_CREADA` - Etapa Creada
- `ETAPA_CERRADA` - Etapa Cerrada
- `ESTADO_TRANSICION` - Transición de Estado

### Informes Mensuales (PLTM-03)
- `INFORME_MENSUAL_CREADO` - Informe Mensual Creado
- `INFORME_MENSUAL_COMPLETADO` - Informe Mensual Completado
- `INFORME_MENSUAL_VENCIDO` - Informe Mensual Vencido

### Seguimiento en Dispositivo (SEG)
- `SITUACION_DISPOSITIVO_CAMBIO` - Cambio de Situación en Dispositivo
- `TALLER_REGISTRADO` - Taller Registrado
- `CAMBIO_LUGAR_RESGUARDO` - Cambio de Lugar de Resguardo
- `NOTA_SEGUIMIENTO_CREADA` - Nota de Seguimiento Creada

### Medida
- `MEDIDA_CREADA` - Medida Creada
- `MEDIDA_CERRADA` - Medida Cerrada
- `MEDIDA_ARCHIVADA` - Medida Archivada
- `MEDIDA_NO_RATIFICADA` - Medida No Ratificada

### Oficios
- `OFICIO_CREADO` - Oficio Creado
- `OFICIO_CERRADO` - Oficio Cerrado

### Eventos Manuales
- `COMENTARIO_MANUAL` - Comentario Manual
- `EVIDENCIA_CARGADA` - Evidencia Cargada

---

## 🔐 Permisos

| Endpoint | Permisos |
|----------|----------|
| `/historial-seguimiento/*` | Usuario autenticado |
| `/trazabilidad-etapas/*` | Usuario autenticado |
| `/historial-seguimiento-global/` | Solo Admin (`is_staff` o `nivel_usuario='ADMIN'`) |

---

## 📝 Notas para el Product Owner

### Funcionalidad Entregada

1. **Timeline Unificado**: Los usuarios pueden ver TODOS los eventos de una medida en orden cronológico, incluyendo actividades, intervenciones, cambios de etapa, etc.

2. **Trazabilidad de Etapas**: Vista específica del flujo de la medida (APERTURA → INNOVACION → CESE, etc.) con detalle de cada transición de estado.

3. **Auditoría Completa**: Cada evento registra:
   - Usuario que realizó la acción
   - Fecha y hora exacta
   - Cambios específicos (valores anteriores y nuevos)

4. **Exportación**: Los datos pueden exportarse a CSV para análisis externo o reportes.

5. **Inmutabilidad**: El historial NO puede ser modificado ni eliminado, garantizando la integridad de la auditoría.

### Flujos de Medida Documentados

| Tipo | Flujo de Etapas |
|------|-----------------|
| MPI | APERTURA → CESE |
| MPE | APERTURA → INNOVACION → PRORROGA → CESE → POST_CESE |
| MPJ | APERTURA → PROCESO → CESE |

### Captura Automática

Los eventos se capturan automáticamente cuando:
- Se crea/modifica una actividad
- Se registra/aprueba/rechaza una intervención
- Se emite una nota de aval
- Se crea un informe jurídico
- Se registra una ratificación
- Se cambia el estado de una etapa
- Se cambia el estado de vigencia de la medida

---

## 🚀 Próximos Pasos Sugeridos

1. **Frontend**: Implementar componente de Timeline en detalle de medida
2. **Frontend**: Agregar stepper de trazabilidad de etapas
3. **UX**: Diseñar iconografía para tipos de evento
4. **Testing**: Validar con usuarios reales

---

## 📁 Archivos Modificados/Creados

### Nuevos
- `infrastructure/models/medida/THistorialSeguimientoMedida.py`
- `infrastructure/signals/historial_seguimiento_signals.py`
- `api/serializers/THistorialSeguimientoSerializer.py`
- `api/filters/THistorialSeguimientoFilter.py`
- `api/views/THistorialSeguimientoView.py`
- `api/views/TTrazabilidadEtapasView.py`
- `infrastructure/migrations/0078_historial_seguimiento_medida_pltm04.py`

### Modificados
- `infrastructure/models/__init__.py`
- `infrastructure/models/medida/__init__.py`
- `infrastructure/signals/__init__.py`
- `api/serializers/__init__.py`
- `api/views/__init__.py`
- `api/urls.py`