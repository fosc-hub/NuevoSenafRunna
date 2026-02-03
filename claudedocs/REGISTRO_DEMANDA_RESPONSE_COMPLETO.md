# Cambio en Response de `/api/registro-demanda-form/` (POST)

**Fecha**: 2025-02-02
**Tipo de cambio**: Breaking Change (estructura de response modificada)
**Endpoint afectado**: `POST /api/registro-demanda-form/`

---

## Resumen Ejecutivo (Para PO)

Se ha mejorado el endpoint de registro de demandas para retornar información completa de TODOS los objetos creados durante el proceso. Esto incluye:

- Objetos creados directamente (demanda, personas, adjuntos, etc.)
- Objetos creados automáticamente por el sistema (score, historial de zona)
- Objetos creados en flujos especiales como CARGA_OFICIOS (medidas, actividades PLTM)

**Beneficio**: El frontend ahora puede mostrar inmediatamente toda la información creada sin necesidad de hacer requests adicionales.

---

## Cambios para Frontend

### Response Anterior (DEPRECADO)
```json
{
  "message_encrypted": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "demanda": 42
}
```

### Response Nuevo (ACTUAL)
```json
{
  "demanda": {
    "id": 42,
    "estado_demanda": "CONSTATACION",
    "objetivo_de_demanda": "PROTECCION",
    "envio_de_respuesta": "PENDIENTE",
    "fecha_ingreso_senaf": "2025-01-15"
  },
  "localizacion": {
    "id": 101
  },
  "demanda_score": {
    "id": 42
  },
  "demanda_zona": {
    "id": 55,
    "zona_id": 3,
    "zona_nombre": "Zona Norte",
    "user_responsable_id": 12,
    "esta_activo": true
  },
  "demanda_zona_history": {
    "id": 88
  },
  "adjuntos": [
    {"id": 1, "adjunto": "/media/adjuntos/doc1.pdf"}
  ],
  "personas": [
    {"id": 201, "nombre": "Juan", "apellido": "Pérez", "dni": 45123456}
  ],
  "demanda_personas": [
    {
      "id": 301,
      "persona_id": 201,
      "vinculo_demanda": "NNYA_PRINCIPAL",
      "conviviente": false,
      "legalmente_responsable": false
    }
  ],
  "codigos_demanda": [],
  "vinculos_legajo": [],
  "medidas_creadas": [],
  "planes_trabajo_creados": [],
  "actividades_creadas": []
}
```

---

## Acciones Requeridas en Frontend

### 1. Actualizar manejo del response (OBLIGATORIO)

**Antes**:
```typescript
const response = await api.post('/registro-demanda-form/', formData);
const demandaId = response.data.demanda; // Era solo el ID
```

**Ahora**:
```typescript
const response = await api.post('/registro-demanda-form/', formData);
const demandaId = response.data.demanda.id; // Ahora es un objeto
const estadoDemanda = response.data.demanda.estado_demanda;
```

### 2. Actualizar tipos TypeScript (RECOMENDADO)

```typescript
// types/demanda.ts

interface DemandaCreatedResponse {
  demanda: {
    id: number;
    estado_demanda: string;
    objetivo_de_demanda: 'PROTECCION' | 'PETICION_DE_INFORME' | 'CARGA_OFICIOS';
    envio_de_respuesta: string;
    fecha_ingreso_senaf: string | null;
  };
  localizacion: {
    id: number;
  };
  demanda_score: {
    id: number;
  } | null;
  demanda_zona: {
    id: number;
    zona_id: number;
    zona_nombre: string | null;
    user_responsable_id: number | null;
    esta_activo: boolean;
  } | null;
  demanda_zona_history: {
    id: number;
  } | null;
  adjuntos: Array<{
    id: number;
    adjunto: string | null;
  }>;
  personas: Array<{
    id: number;
    nombre: string;
    apellido: string;
    dni: number | null;
  }>;
  demanda_personas: Array<{
    id: number;
    persona_id: number;
    vinculo_demanda: string;
    conviviente: boolean;
    legalmente_responsable: boolean;
  }>;
  codigos_demanda: Array<{
    id: number;
    codigo: string;
  }>;
  vinculos_legajo: Array<{
    id: number;
    legajo_origen_id: number;
    legajo_numero: string | null;
    medida_destino_id: number | null;
    tipo_vinculo_id: number;
  }>;
  // Objetos creados por signals (CARGA_OFICIOS)
  medidas_creadas: Array<{
    id: number;
    tipo_medida: 'MPI' | 'MPE' | 'MPJ';
    numero_medida: string;
    estado_vigencia: string;
  }>;
  planes_trabajo_creados: Array<{
    id: number;
    medida_id: number;
  }>;
  actividades_creadas: ActividadPlanTrabajo[]; // Usar tipo existente de actividades
}
```

### 3. Aprovechar nuevos datos (OPCIONAL)

#### Mostrar confirmación enriquecida
```tsx
// Ejemplo: Mostrar resumen después de crear demanda
const handleSuccess = (response: DemandaCreatedResponse) => {
  toast.success(`
    Demanda #${response.demanda.id} creada correctamente.
    Estado: ${response.demanda.estado_demanda}
    Zona asignada: ${response.demanda_zona?.zona_nombre || 'Sin asignar'}
    Personas registradas: ${response.personas.length}
  `);
};
```

#### Navegar con datos pre-cargados
```tsx
// Ejemplo: Ir al detalle con datos ya disponibles
navigate(`/demanda/${response.demanda.id}`, {
  state: { demandaData: response }
});
```

#### Mostrar actividades creadas (CARGA_OFICIOS)
```tsx
// Ejemplo: Mostrar actividades PLTM creadas automáticamente
if (response.actividades_creadas.length > 0) {
  toast.info(`
    Se crearon ${response.actividades_creadas.length} actividades automáticamente
    en el Plan de Trabajo.
  `);
}
```

---

## Campos Siempre Presentes vs Condicionales

| Campo | Siempre presente | Puede ser null/vacío |
|-------|------------------|---------------------|
| `demanda` | ✅ | - |
| `localizacion` | ✅ | - |
| `demanda_score` | ✅ | Puede ser `null` |
| `demanda_zona` | ✅ | Puede ser `null` |
| `demanda_zona_history` | ✅ | Puede ser `null` |
| `adjuntos` | ✅ | Puede ser `[]` |
| `personas` | ✅ | Puede ser `[]` |
| `demanda_personas` | ✅ | Puede ser `[]` |
| `codigos_demanda` | ✅ | Puede ser `[]` |
| `vinculos_legajo` | ✅ | Puede ser `[]` |
| `medidas_creadas` | ✅ | Puede ser `[]` (solo para CARGA_OFICIOS) |
| `planes_trabajo_creados` | ✅ | Puede ser `[]` (solo para CARGA_OFICIOS) |
| `actividades_creadas` | ✅ | Puede ser `[]` (solo para CARGA_OFICIOS) |

**Nota**: Los campos `medidas_creadas`, `planes_trabajo_creados` y `actividades_creadas` solo contendrán datos cuando:
1. `objetivo_de_demanda === 'CARGA_OFICIOS'`
2. Se enviaron `vinculos[]` en el request
3. El tipo de oficio requiere creación de medida/actividades

---

## Escenarios de Uso

### Escenario 1: Demanda PROTECCION (común)
```json
{
  "demanda": {"id": 42, "objetivo_de_demanda": "PROTECCION", ...},
  "personas": [{"id": 201, ...}],
  "demanda_personas": [{"id": 301, "vinculo_demanda": "NNYA_PRINCIPAL", ...}],
  "medidas_creadas": [],
  "actividades_creadas": []
}
```

### Escenario 2: Demanda CARGA_OFICIOS con vínculos
```json
{
  "demanda": {"id": 43, "objetivo_de_demanda": "CARGA_OFICIOS", ...},
  "vinculos_legajo": [
    {"id": 1, "legajo_origen_id": 10, "medida_destino_id": 5, ...}
  ],
  "medidas_creadas": [
    {"id": 5, "tipo_medida": "MPJ", "numero_medida": "MPJ-2025-0001", ...}
  ],
  "planes_trabajo_creados": [
    {"id": 8, "medida_id": 5}
  ],
  "actividades_creadas": [
    {
      "id": 15,
      "tipo_actividad": 3,
      "tipo_actividad_info": {"nombre": "Citación a Audiencia", ...},
      "estado": "PENDIENTE",
      "descripcion": "Actividad creada automáticamente desde demanda CARGA_OFICIOS",
      ...
    }
  ]
}
```

---

## Compatibilidad

- **HTTP Status**: Sigue siendo `201 Created`
- **Content-Type**: Sigue siendo `application/json`
- **Endpoint URL**: Sin cambios (`/api/registro-demanda-form/`)
- **Request format**: Sin cambios (multipart/form-data con campo `data`)

---

## Preguntas Frecuentes

**P: El campo `message_encrypted` ya no existe?**
R: Correcto, fue removido. Si el frontend lo usaba, debe eliminarse esa referencia.

**P: Qué pasa si no se crea demanda_zona?**
R: El campo `demanda_zona` será `null`. Esto puede ocurrir si hay un error en la creación.

**P: Las actividades_creadas vienen con toda la info?**
R: Sí, usan el serializer completo `TActividadPlanTrabajoSerializer` que incluye `tipo_actividad_info`, `responsable_principal_info`, `legajo_info`, `medida_info`, etc.

---

## Contacto

Para dudas sobre esta implementación:
- Backend: [Tu nombre/equipo]
- Archivo modificado: `runna/api/views/ComposedView.py`