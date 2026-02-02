# Edición de Datos NNyA desde Legajo + Sistema de Personas Relacionadas

**Fecha**: 2026-02-02
**Versión**: 2.1
**Estado**: ✅ **Completamente implementado y listo para integración**

---

## 🎯 Resumen Ejecutivo

### Solicitud Original
El Frontend y PO necesitaban **editar datos del NNyA desde el contexto del Legajo**:
- ✅ Datos Personales
- ✅ Educación
- ✅ Salud (Cobertura médica + Enfermedades)
- ✅ Vulnerabilidad
- ✅ Personas Relacionadas (vínculos familiares permanentes) **← NUEVO**

### Estado de Implementación

| Funcionalidad | Estado | Endpoint |
|---------------|--------|----------|
| Datos Personales | ✅ Implementado | `PATCH /api/legajos/{id}/nnya/` |
| Localización | ✅ Implementado | `PATCH /api/legajos/{id}/nnya/` |
| Educación | ✅ Implementado | `PATCH /api/legajos/{id}/nnya/` |
| Cobertura Médica | ✅ Implementado | `PATCH /api/legajos/{id}/nnya/` |
| Enfermedades | ✅ Implementado | `PATCH /api/legajos/{id}/nnya/` |
| Condiciones Vulnerabilidad | ✅ Implementado | `PATCH /api/legajos/{id}/nnya/` |
| Personas Relacionadas | ✅ Implementado | `PATCH /api/legajos/{id}/nnya/` |
| Catálogo Tipos de Vínculo | ✅ **NUEVO** | `GET /api/vinculo-de-personas/` |

**Todo se gestiona desde un único endpoint unificado.**

### Endpoints de Soporte

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/vinculo-de-personas/` | GET | Catálogo de tipos de parentesco (Madre, Padre, etc.) |
| `/api/tipos-vinculo/` | GET | Catálogo de tipos de vinculación entre entidades (Legajos/Demandas/Medidas) - **NO confundir** |

---

## 📚 Sistema de Personas Relacionadas (TPersonaVinculo)

Se implementó un nuevo sistema de **vínculos familiares permanentes** (`TPersonaVinculo`) que complementa al sistema existente de vínculos en contexto de demanda (`TDemandaPersona`).

### Diferencia clave

| Aspecto | TDemandaPersona (existente) | TPersonaVinculo (nuevo) |
|---------|----------------------------|------------------------|
| **Contexto** | Vinculado a una demanda específica | Permanente del NNyA (legajo) |
| **Edición** | Desde registro de demanda | Desde legajo (`PATCH /api/legajos/{id}/nnya/`) |
| **Trazabilidad** | `deleted` (boolean) | Completa: `activo`, `desvinculado_por`, `desvinculado_en`, `justificacion_desvincular` |
| **Datos extra** | `vinculo_demanda`, `ocupacion` | Contexto completo: legajo, medidas activas, demandas de la persona relacionada |

---

---

# 📖 DOCUMENTACIÓN COMPLETA DEL ENDPOINT

## Endpoint Principal: `/api/legajos/{id}/nnya/`

| Método | URL | Descripción |
|--------|-----|-------------|
| `GET` | `/api/legajos/{id}/nnya/` | Obtener datos completos del NNyA |
| `PATCH` | `/api/legajos/{id}/nnya/` | Actualizar todos los datos en un solo request |

---

## 🔵 GET `/api/legajos/{id}/nnya/` - Lectura

Retorna los datos completos del NNyA incluyendo todas sus relaciones.

### Respuesta Completa

```json
{
  "id": 5,
  "nombre": "Juan",
  "nombre_autopercibido": null,
  "apellido": "Pérez",
  "fecha_nacimiento": "2015-05-20",
  "edad_aproximada": null,
  "nacionalidad": "ARGENTINA",
  "dni": 45678901,
  "situacion_dni": "VALIDO",
  "genero": "MASCULINO",
  "telefono": null,
  "observaciones": null,
  "fecha_defuncion": null,
  "adulto": false,
  "nnya": true,

  "localizacion": {
    "id": 41,
    "calle": "Av. Colón",
    "tipo_calle": "AVENIDA",
    "piso_depto": null,
    "lote": null,
    "mza": null,
    "casa_nro": "1234",
    "referencia_geo": "Frente a la plaza",
    "geolocalizacion": null,
    "barrio": { "id": 1, "nombre": "Centro" },
    "localidad": { "id": 1, "nombre": "Córdoba" },
    "cpc": null
  },

  "educacion": {
    "id": 12,
    "nivel_alcanzado": "PRIMARIO",
    "esta_escolarizado": true,
    "ultimo_cursado": "5TO_GRADO",
    "tipo_escuela": "PUBLICA",
    "comentarios_educativos": "Buen rendimiento académico",
    "institucion_educativa": {
      "id": 1,
      "nombre": "Escuela José Hernández",
      "cue": "123456"
    }
  },

  "cobertura_medica": {
    "id": 8,
    "obra_social": "TIENE",
    "intervencion": null,
    "auh": true,
    "observaciones": "Control pediátrico al día",
    "institucion_sanitaria": {
      "id": 1,
      "nombre": "Hospital de Niños"
    },
    "medico_cabecera": null
  },

  "persona_enfermedades": [
    {
      "id": 4,
      "certificacion": "TIENE",
      "beneficios_gestionados": true,
      "recibe_tratamiento": true,
      "informacion_tratamiento": "Control mensual con pediatra",
      "enfermedad": { "id": 5, "nombre": "Asma" },
      "situacion_salud": { "id": 2, "nombre": "Estable" },
      "institucion_sanitaria_interviniente": null,
      "medico_tratamiento": null
    }
  ],

  "condiciones_vulnerabilidad": [
    {
      "id": 11,
      "si_no": true,
      "condicion_vulnerabilidad": {
        "id": 3,
        "nombre": "Situación de calle",
        "peso": 10
      },
      "demanda": 1
    }
  ],

  "personas_relacionadas": [
    {
      "id": 1,
      "persona_destino_info": {
        "id": 123,
        "nombre": "María",
        "apellido": "García",
        "dni": 25678901,
        "edad_calculada": 40,
        "legajo": { "id": 45, "numero": "LEG-2024-045" },
        "medidas_activas": [{ "id": 10, "tipo_medida": "MPI", "estado": "VIGENTE" }],
        "demandas": [{ "demanda_id": 100, "vinculo_demanda": "GARANTIZA_PROTECCION" }]
      },
      "tipo_vinculo_nombre": "MADRE",
      "conviviente": true,
      "legalmente_responsable": true,
      "es_referente_principal": true
    }
  ]
}
```

---

## 🟢 PATCH `/api/legajos/{id}/nnya/` - Escritura Unificada

### Características del Endpoint

- ✅ **Actualización parcial**: Solo envía los campos que deseas modificar
- ✅ **Transaccional**: Todo se guarda o nada (rollback automático si hay error)
- ✅ **Unificado**: Un solo request para actualizar todo

---

### 1️⃣ DATOS PERSONALES

```json
PATCH /api/legajos/{id}/nnya/
{
  "nombre": "Juan Carlos",
  "apellido": "Pérez González",
  "dni": 45678901,
  "fecha_nacimiento": "2015-05-20",
  "genero": "MASCULINO",
  "nacionalidad": "ARGENTINA",
  "situacion_dni": "VALIDO",
  "telefono": "3515551234",
  "observaciones": "Notas adicionales del NNyA"
}
```

**Campos disponibles**:
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `nombre` | string | No | Nombre legal |
| `nombre_autopercibido` | string | No | Nombre autopercibido |
| `apellido` | string | No | Apellido |
| `fecha_nacimiento` | date | No | YYYY-MM-DD |
| `edad_aproximada` | int | No | Si no se conoce fecha exacta |
| `nacionalidad` | string | No | Nacionalidad |
| `dni` | int | No | DNI |
| `situacion_dni` | enum | No | VALIDO, EN_TRAMITE, SIN_DNI |
| `genero` | enum | No | MASCULINO, FEMENINO, OTRO |
| `telefono` | string | No | Teléfono de contacto |
| `observaciones` | string | No | Notas generales |

---

### 2️⃣ LOCALIZACIÓN

```json
PATCH /api/legajos/{id}/nnya/
{
  "localizacion": {
    "id": 41,
    "calle": "Av. Colón",
    "tipo_calle": "AVENIDA",
    "casa_nro": "1234",
    "piso_depto": "2B",
    "barrio": 1,
    "localidad": 1,
    "referencia_geo": "Frente a la plaza central"
  }
}
```

**Comportamiento**:
- Con `id`: Actualiza localización existente
- Sin `id`: Crea nueva localización y la vincula como principal

**Campos disponibles**:
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | int | ID existente (opcional) |
| `calle` | string | Nombre de la calle |
| `tipo_calle` | enum | CALLE, AVENIDA, PASAJE, BOULEVARD |
| `casa_nro` | string | Número de casa |
| `piso_depto` | string | Piso y departamento |
| `lote` | string | Número de lote |
| `mza` | string | Manzana |
| `referencia_geo` | string | Referencia geográfica |
| `barrio` | int | ID del barrio (FK) |
| `localidad` | int | ID de localidad (FK) |
| `cpc` | int | ID del CPC (FK) |

---

### 3️⃣ EDUCACIÓN

```json
PATCH /api/legajos/{id}/nnya/
{
  "educacion": {
    "nivel_alcanzado": "PRIMARIO",
    "esta_escolarizado": true,
    "ultimo_cursado": "5TO_GRADO",
    "tipo_escuela": "PUBLICA",
    "comentarios_educativos": "Buen rendimiento académico",
    "institucion_educativa": 1
  }
}
```

**Campos disponibles**:
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | int | ID existente (opcional) |
| `nivel_alcanzado` | enum | INICIAL, PRIMARIO, SECUNDARIO, TERCIARIO, UNIVERSITARIO |
| `esta_escolarizado` | bool | ¿Está escolarizado actualmente? |
| `ultimo_cursado` | string | Último grado/año cursado |
| `tipo_escuela` | enum | PUBLICA, PRIVADA, ESPECIAL |
| `comentarios_educativos` | string | Observaciones educativas |
| `institucion_educativa` | int | ID de institución (FK) |

---

### 4️⃣ COBERTURA MÉDICA (SALUD)

```json
PATCH /api/legajos/{id}/nnya/
{
  "cobertura_medica": {
    "obra_social": "TIENE",
    "auh": true,
    "observaciones": "Control pediátrico al día",
    "institucion_sanitaria": 1,
    "medico_cabecera": 5
  }
}
```

**Campos disponibles**:
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | int | ID existente (opcional) |
| `obra_social` | enum | TIENE, NO_TIENE, EN_TRAMITE |
| `intervencion` | string | Tipo de intervención |
| `auh` | bool | ¿Recibe AUH? |
| `observaciones` | string | Observaciones médicas |
| `institucion_sanitaria` | int | ID institución (FK) |
| `medico_cabecera` | int | ID médico (FK) |

---

### 5️⃣ ENFERMEDADES (SALUD)

```json
PATCH /api/legajos/{id}/nnya/
{
  "persona_enfermedades": [
    {
      "id": 4,
      "recibe_tratamiento": true,
      "informacion_tratamiento": "Control mensual actualizado"
    },
    {
      "enfermedad": 5,
      "certificacion": "TIENE",
      "recibe_tratamiento": true
    },
    {
      "id": 3,
      "deleted": true
    }
  ]
}
```

**Operaciones**:
| Operación | Campos requeridos | Descripción |
|-----------|-------------------|-------------|
| Actualizar | `id` + campos a modificar | Actualiza enfermedad existente |
| Crear | Sin `id` + `enfermedad` | Crea nueva enfermedad |
| Eliminar | `id` + `deleted: true` | Soft delete de la enfermedad |

**Campos disponibles**:
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | int | ID existente |
| `deleted` | bool | Marcar como eliminado |
| `enfermedad` | int | ID de enfermedad (FK) |
| `situacion_salud` | int | ID situación salud (FK) |
| `certificacion` | enum | TIENE, NO_TIENE, EN_TRAMITE |
| `beneficios_gestionados` | bool | ¿Tiene beneficios? |
| `recibe_tratamiento` | bool | ¿Recibe tratamiento? |
| `informacion_tratamiento` | string | Detalle del tratamiento |
| `institucion_sanitaria_interviniente` | int | ID institución (FK) |
| `medico_tratamiento` | int | ID médico (FK) |

---

### 6️⃣ CONDICIONES DE VULNERABILIDAD

```json
PATCH /api/legajos/{id}/nnya/
{
  "condiciones_vulnerabilidad": [
    {
      "id": 11,
      "si_no": false
    },
    {
      "condicion_vulnerabilidad": 5,
      "si_no": true,
      "demanda": 1
    }
  ]
}
```

**Operaciones**:
| Operación | Campos requeridos | Descripción |
|-----------|-------------------|-------------|
| Actualizar | `id` + campos | Actualiza condición existente |
| Crear | `condicion_vulnerabilidad` + `si_no` | Crea o actualiza si ya existe para esa condición |

**Campos disponibles**:
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | int | ID existente |
| `condicion_vulnerabilidad` | int | ID condición (FK) |
| `si_no` | bool | ¿Aplica esta condición? |
| `demanda` | int | ID demanda relacionada (FK) |

---

### 7️⃣ PERSONAS RELACIONADAS (NUEVO)

Ver sección detallada más abajo.

---

## 📝 Ejemplo de Request Completo

```json
PATCH /api/legajos/{id}/nnya/
{
  "nombre": "Juan Carlos",
  "apellido": "Pérez González",
  "dni": 45678901,
  "fecha_nacimiento": "2015-05-20",
  "genero": "MASCULINO",

  "localizacion": {
    "id": 41,
    "calle": "Av. Colón",
    "casa_nro": "1234",
    "localidad": 1
  },

  "educacion": {
    "nivel_alcanzado": "PRIMARIO",
    "esta_escolarizado": true,
    "institucion_educativa": 1
  },

  "cobertura_medica": {
    "obra_social": "TIENE",
    "auh": true,
    "observaciones": "Control pediátrico al día"
  },

  "persona_enfermedades": [
    { "id": 4, "recibe_tratamiento": true },
    { "enfermedad": 5, "certificacion": "TIENE" },
    { "id": 3, "deleted": true }
  ],

  "condiciones_vulnerabilidad": [
    { "id": 11, "si_no": false },
    { "condicion_vulnerabilidad": 5, "si_no": true }
  ],

  "personas_relacionadas": [
    {
      "persona_existente_id": 123,
      "tipo_vinculo": 1,
      "conviviente": true,
      "legalmente_responsable": true
    },
    {
      "persona_datos": { "nombre": "Pedro", "apellido": "García", "dni": 20345678 },
      "tipo_vinculo": 2
    },
    {
      "id": 5,
      "desvincular": true,
      "justificacion_desvincular": "El familiar ya no tiene contacto desde hace 2 años"
    }
  ]
}
```

---

# 👥 SISTEMA DE PERSONAS RELACIONADAS (Detalle)

## Cambios en API para Frontend

### 1. GET `/api/legajos/{id}/` - Nueva sección `personas_relacionadas`

La respuesta ahora incluye un campo `personas_relacionadas` con los vínculos familiares permanentes del NNyA:

```json
{
  "legajo": { ... },
  "persona": { ... },
  "personas_relacionadas": [
    {
      "id": 1,
      "persona_origen": 5,
      "persona_destino": 123,
      "persona_destino_info": {
        "id": 123,
        "nombre": "María",
        "apellido": "García",
        "dni": 25678901,
        "fecha_nacimiento": "1985-03-15",
        "edad_calculada": 40,
        "genero": "FEMENINO",
        "adulto": true,
        "nnya": false,
        "telefono": "3514567890",
        "nacionalidad": "ARGENTINA",
        "situacion_dni": "VALIDO",
        "legajo": {
          "id": 45,
          "numero": "LEG-2024-045",
          "fecha_apertura": "2024-01-15"
        },
        "medidas_activas": [
          {
            "id": 10,
            "tipo_medida": "MPI",
            "estado": "VIGENTE",
            "numero_medida": "MED-2024-010"
          }
        ],
        "demandas": [
          {
            "demanda_id": 100,
            "vinculo_demanda": "GARANTIZA_PROTECCION",
            "estado": "ADMITIDA"
          }
        ]
      },
      "tipo_vinculo": 1,
      "tipo_vinculo_nombre": "MADRE",
      "conviviente": true,
      "legalmente_responsable": true,
      "ocupacion": "TRABAJADOR",
      "es_referente_principal": true,
      "observaciones": "Referente principal del NNyA",
      "activo": true,
      "creado_por": 5,
      "creado_por_nombre": "Juan Pérez",
      "creado_en": "2024-06-15T10:30:00Z",
      "desvinculado_por": null,
      "desvinculado_por_nombre": null,
      "desvinculado_en": null,
      "justificacion_desvincular": null
    }
  ],
  ...
}
```

---

### 2. PATCH `/api/legajos/{id}/nnya/` - Gestión de `personas_relacionadas`

Ahora acepta el campo `personas_relacionadas` para crear, actualizar o desvincular vínculos familiares.

#### 2.1 Crear vínculo con persona EXISTENTE

```json
{
  "personas_relacionadas": [
    {
      "persona_existente_id": 123,
      "tipo_vinculo": 1,
      "conviviente": true,
      "legalmente_responsable": true,
      "ocupacion": "TRABAJADOR",
      "es_referente_principal": false,
      "observaciones": "Tía materna"
    }
  ]
}
```

#### 2.2 Crear vínculo con persona NUEVA

El backend buscará automáticamente si existe una persona con los mismos datos (DNI o nombre+apellido+fecha_nacimiento). Si no existe, la creará.

```json
{
  "personas_relacionadas": [
    {
      "persona_datos": {
        "nombre": "Pedro",
        "apellido": "García",
        "dni": 20345678,
        "fecha_nacimiento": "1980-05-20",
        "genero": "MASCULINO",
        "adulto": true,
        "nnya": false,
        "telefono": "3515551234"
      },
      "tipo_vinculo": 2,
      "conviviente": false,
      "legalmente_responsable": false
    }
  ]
}
```

#### 2.3 Actualizar vínculo existente

```json
{
  "personas_relacionadas": [
    {
      "id": 5,
      "conviviente": false,
      "es_referente_principal": true,
      "observaciones": "Ahora es el referente principal"
    }
  ]
}
```

#### 2.4 Desvincular con trazabilidad

**IMPORTANTE**: La justificación debe tener mínimo 20 caracteres.

```json
{
  "personas_relacionadas": [
    {
      "id": 5,
      "desvincular": true,
      "justificacion_desvincular": "El familiar ya no tiene contacto con el NNyA desde hace 2 años según informe social"
    }
  ]
}
```

#### 2.5 Operaciones combinadas en un solo request

```json
{
  "personas_relacionadas": [
    {
      "persona_existente_id": 200,
      "tipo_vinculo": 3,
      "conviviente": true
    },
    {
      "id": 5,
      "conviviente": false
    },
    {
      "id": 8,
      "desvincular": true,
      "justificacion_desvincular": "Fallecimiento del familiar según acta de defunción adjunta"
    }
  ]
}
```

---

### 3. GET `/api/mesa-de-entrada/` - Nuevo campo `personas_relacionadas_nnya`

La bandeja de entrada ahora incluye un resumen de las personas relacionadas del NNyA principal:

```json
{
  "id": 1,
  "nnya_principal": { ... },
  "personas_relacionadas_nnya": [
    {
      "id": 1,
      "nombre": "María",
      "apellido": "García",
      "tipo_relacion": "MADRE",
      "conviviente": true,
      "legalmente_responsable": true
    },
    {
      "id": 2,
      "nombre": "Pedro",
      "apellido": "García",
      "tipo_relacion": "PADRE",
      "conviviente": true,
      "legalmente_responsable": true
    }
  ],
  ...
}
```

**Nota**: Se limita a máximo 5 personas relacionadas por performance.

---

### 4. POST `/api/demanda-busqueda-vinculacion/` - Nuevo campo `personas_relacionadas`

Al buscar vinculaciones, la respuesta ahora incluye las personas relacionadas de cada persona encontrada:

```json
{
  "demanda_ids": [1, 2, 5],
  "nnya_ids": [10, 15],
  "match_descriptions": ["..."],
  "legajos": [...],
  "personas_relacionadas": [
    {
      "persona_buscada_id": 10,
      "persona_relacionada_id": 123,
      "persona_relacionada_nombre": "María García",
      "persona_relacionada_dni": 25678901,
      "tipo_relacion": "MADRE",
      "legajo_id": 45,
      "legajo_numero": "LEG-2024-045"
    },
    {
      "persona_buscada_id": 10,
      "persona_relacionada_id": 124,
      "persona_relacionada_nombre": "Pedro García",
      "persona_relacionada_dni": 20345678,
      "tipo_relacion": "PADRE",
      "legajo_id": null,
      "legajo_numero": null
    }
  ]
}
```

---

## Catálogo de Tipos de Vínculo

### Endpoint para obtener tipos de vínculo

```
GET /api/vinculo-de-personas/
```

**Respuesta:**
```json
[
  { "id": 1, "nombre": "Madre" },
  { "id": 2, "nombre": "Padre" },
  { "id": 3, "nombre": "Hermano/a" },
  { "id": 4, "nombre": "Abuelo/a" },
  { "id": 5, "nombre": "Tío/a" },
  ...
]
```

**Uso:** Este endpoint retorna los IDs válidos para el campo `tipo_vinculo` en `personas_relacionadas`.

> ⚠️ **IMPORTANTE:** No confundir con `/api/tipos-vinculo/` que es para vincular Legajos/Demandas/Medidas entre sí (TTipoVinculo), no personas.

### Tipos disponibles (referencia)

| ID | Nombre | Descripción |
|----|--------|-------------|
| 1 | MADRE | Madre biológica o adoptiva |
| 2 | PADRE | Padre biológico o adoptivo |
| 3 | HERMANO/A | Hermano o hermana |
| 4 | ABUELO/A | Abuelo o abuela |
| 5 | TIO/A | Tío o tía |
| 6 | PRIMO/A | Primo o prima |
| 7 | PADRASTRO | Padrastro |
| 8 | MADRASTRA | Madrastra |
| 9 | TUTOR_LEGAL | Tutor legal designado |
| 10 | OTRO_FAMILIAR | Otro familiar |
| 11 | REFERENTE_COMUNITARIO | Referente comunitario |
| 12 | VECINO | Vecino |

> **Nota:** Los IDs pueden variar según los datos cargados en la base de datos. Siempre usar el endpoint `GET /api/vinculo-de-personas/` para obtener los valores actuales.

---

## Catálogo de Ocupaciones

```typescript
type Ocupacion =
  | 'ESTUDIANTE'
  | 'TRABAJADOR'
  | 'DESEMPLEADO'
  | 'JUBILADO'
  | 'PENSIONADO'
  | 'AMA_DE_CASA'
  | 'TRABAJADOR_INFORMAL'
  | 'OTRO';
```

---

## Validaciones del Backend

### Al crear vínculo:
- `tipo_vinculo` es **requerido**
- Debe proporcionar `persona_existente_id` O `persona_datos`
- No se puede vincular una persona consigo misma
- No se pueden crear vínculos duplicados activos (misma persona_origen + persona_destino + tipo_vinculo)
- No se pueden crear vínculos inversos duplicados (si A→B existe, no se permite B→A con mismo tipo)

### Al desvincular:
- `id` es **requerido**
- `justificacion_desvincular` debe tener **mínimo 20 caracteres**

### Referente principal:
- Solo puede haber **un referente principal activo** por NNyA
- Si se marca uno nuevo como referente principal, el anterior debe desmarcarse primero

---

## Ejemplos de UI Sugeridos

### Vista de Legajo - Sección Personas Relacionadas

```
┌─────────────────────────────────────────────────────────────────┐
│ PERSONAS RELACIONADAS                              [+ Agregar]  │
├─────────────────────────────────────────────────────────────────┤
│ ★ María García (MADRE)                    DNI: 25.678.901      │
│   ✓ Conviviente  ✓ Legalmente responsable                      │
│   Legajo: LEG-2024-045 | Medida activa: MPI                    │
│   [Editar] [Desvincular]                                        │
├─────────────────────────────────────────────────────────────────┤
│   Pedro García (PADRE)                    DNI: 20.345.678      │
│   ✓ Conviviente  ✓ Legalmente responsable                      │
│   Sin legajo                                                    │
│   [Editar] [Desvincular]                                        │
├─────────────────────────────────────────────────────────────────┤
│   Ana López (ABUELA)                      DNI: 12.345.678      │
│   ✗ No conviviente  ✗ No responsable legal                     │
│   Sin legajo                                                    │
│   [Editar] [Desvincular]                                        │
└─────────────────────────────────────────────────────────────────┘

★ = Referente principal
```

### Modal de Desvinculación

```
┌─────────────────────────────────────────────────────────────────┐
│ Desvincular a María García                              [X]    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ⚠️ Esta acción desvinculará a María García como MADRE del NNyA.│
│                                                                 │
│ Justificación (obligatoria, mín. 20 caracteres):               │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ El familiar ya no tiene contacto con el NNyA desde hace    ││
│ │ 2 años según informe social del equipo técnico.            ││
│ └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│ Nota: El vínculo quedará registrado en el historial con        │
│ fecha, usuario y justificación para trazabilidad.              │
│                                                                 │
│                            [Cancelar]  [Confirmar Desvinculación]│
└─────────────────────────────────────────────────────────────────┘
```

---

## Información para el PO

### Beneficios del nuevo sistema

1. **Trazabilidad completa**: Cada desvinculación queda registrada con usuario, fecha y justificación obligatoria.

2. **Visión 360 del NNyA**: Desde el legajo se puede ver el círculo familiar con información de sus propios legajos, medidas y demandas.

3. **Evita duplicación de datos**: El backend busca automáticamente personas existentes antes de crear nuevas.

4. **Independiente de demandas**: Los vínculos familiares persisten aunque las demandas se cierren o archiven.

5. **Búsqueda mejorada**: Al buscar vinculaciones, se muestran las personas relacionadas para detectar conexiones familiares.

### Restricciones de negocio implementadas

- Solo un referente principal por NNyA
- Justificación obligatoria (mín. 20 chars) para desvincular
- No se permiten vínculos duplicados ni circulares
- Historial inmutable de cambios

---

## TypeScript Interfaces Completas (para Frontend)

```typescript
// ============================================================================
// TIPOS BASE
// ============================================================================

type Genero = 'MASCULINO' | 'FEMENINO' | 'OTRO';
type SituacionDNI = 'VALIDO' | 'EN_TRAMITE' | 'SIN_DNI';
type ObraSocial = 'TIENE' | 'NO_TIENE' | 'EN_TRAMITE';
type Certificacion = 'TIENE' | 'NO_TIENE' | 'EN_TRAMITE';
type NivelEducativo = 'INICIAL' | 'PRIMARIO' | 'SECUNDARIO' | 'TERCIARIO' | 'UNIVERSITARIO';
type TipoEscuela = 'PUBLICA' | 'PRIVADA' | 'ESPECIAL';
type TipoCalle = 'CALLE' | 'AVENIDA' | 'PASAJE' | 'BOULEVARD';
type Ocupacion = 'ESTUDIANTE' | 'TRABAJADOR' | 'DESEMPLEADO' | 'JUBILADO' | 'PENSIONADO' | 'AMA_DE_CASA' | 'TRABAJADOR_INFORMAL' | 'OTRO';

// ============================================================================
// INTERFACES DE LECTURA (GET /api/legajos/{id}/nnya/)
// ============================================================================

interface LocalizacionRead {
  id: number;
  calle: string | null;
  tipo_calle: TipoCalle | null;
  piso_depto: string | null;
  lote: string | null;
  mza: string | null;
  casa_nro: string | null;
  referencia_geo: string | null;
  geolocalizacion: string | null;
  barrio: { id: number; nombre: string } | null;
  localidad: { id: number; nombre: string } | null;
  cpc: { id: number; nombre: string } | null;
}

interface EducacionRead {
  id: number;
  nivel_alcanzado: NivelEducativo | null;
  esta_escolarizado: boolean | null;
  ultimo_cursado: string | null;
  tipo_escuela: TipoEscuela | null;
  comentarios_educativos: string | null;
  institucion_educativa: {
    id: number;
    nombre: string;
    cue: string | null;
  } | null;
}

interface CoberturaMedicaRead {
  id: number;
  obra_social: ObraSocial | null;
  intervencion: string | null;
  auh: boolean | null;
  observaciones: string | null;
  institucion_sanitaria: { id: number; nombre: string } | null;
  medico_cabecera: { id: number; nombre: string } | null;
}

interface PersonaEnfermedadRead {
  id: number;
  certificacion: Certificacion | null;
  beneficios_gestionados: boolean | null;
  recibe_tratamiento: boolean | null;
  informacion_tratamiento: string | null;
  enfermedad: { id: number; nombre: string } | null;
  situacion_salud: { id: number; nombre: string } | null;
  institucion_sanitaria_interviniente: { id: number; nombre: string } | null;
  medico_tratamiento: { id: number; nombre: string } | null;
}

interface CondicionVulnerabilidadRead {
  id: number;
  si_no: boolean;
  condicion_vulnerabilidad: {
    id: number;
    nombre: string;
    peso: number;
  };
  demanda: number | null;
}

// Respuesta completa de GET /api/legajos/{id}/nnya/
interface NNyACompletaRead {
  id: number;
  nombre: string;
  nombre_autopercibido: string | null;
  apellido: string;
  fecha_nacimiento: string | null;
  edad_aproximada: number | null;
  nacionalidad: string | null;
  dni: number | null;
  situacion_dni: SituacionDNI | null;
  genero: Genero | null;
  telefono: string | null;
  observaciones: string | null;
  fecha_defuncion: string | null;
  adulto: boolean;
  nnya: boolean;
  localizacion: LocalizacionRead | null;
  educacion: EducacionRead | null;
  cobertura_medica: CoberturaMedicaRead | null;
  persona_enfermedades: PersonaEnfermedadRead[];
  condiciones_vulnerabilidad: CondicionVulnerabilidadRead[];
  personas_relacionadas: PersonaVinculo[];
}

// ============================================================================
// INTERFACES DE ESCRITURA (PATCH /api/legajos/{id}/nnya/)
// ============================================================================

interface LocalizacionUpdate {
  id?: number;
  calle?: string;
  tipo_calle?: TipoCalle;
  piso_depto?: string;
  lote?: string;
  mza?: string;
  casa_nro?: string;
  referencia_geo?: string;
  geolocalizacion?: string;
  barrio?: number;
  localidad?: number;
  cpc?: number;
}

interface EducacionUpdate {
  id?: number;
  nivel_alcanzado?: NivelEducativo;
  esta_escolarizado?: boolean;
  ultimo_cursado?: string;
  tipo_escuela?: TipoEscuela;
  comentarios_educativos?: string;
  institucion_educativa?: number;
}

interface CoberturaMedicaUpdate {
  id?: number;
  obra_social?: ObraSocial;
  intervencion?: string;
  auh?: boolean;
  observaciones?: string;
  institucion_sanitaria?: number;
  medico_cabecera?: number;
}

interface PersonaEnfermedadUpdate {
  id?: number;
  deleted?: boolean;
  enfermedad?: number;
  situacion_salud?: number;
  certificacion?: Certificacion;
  beneficios_gestionados?: boolean;
  recibe_tratamiento?: boolean;
  informacion_tratamiento?: string;
  institucion_sanitaria_interviniente?: number;
  medico_tratamiento?: number;
}

interface CondicionVulnerabilidadUpdate {
  id?: number;
  condicion_vulnerabilidad?: number;
  si_no?: boolean;
  demanda?: number;
}

// Request completo para PATCH /api/legajos/{id}/nnya/
interface NNyACompletaUpdateRequest {
  // Datos personales
  nombre?: string;
  nombre_autopercibido?: string;
  apellido?: string;
  fecha_nacimiento?: string;
  edad_aproximada?: number;
  nacionalidad?: string;
  dni?: number;
  situacion_dni?: SituacionDNI;
  genero?: Genero;
  telefono?: string;
  observaciones?: string;
  fecha_defuncion?: string;
  adulto?: boolean;
  nnya?: boolean;

  // Relaciones
  localizacion?: LocalizacionUpdate;
  educacion?: EducacionUpdate;
  cobertura_medica?: CoberturaMedicaUpdate;
  persona_enfermedades?: PersonaEnfermedadUpdate[];
  condiciones_vulnerabilidad?: CondicionVulnerabilidadUpdate[];
  personas_relacionadas?: PersonaRelacionadaRequest[];
}

// ============================================================================
// INTERFACES DE PERSONAS RELACIONADAS
// ============================================================================

// Respuesta de GET /api/legajos/{id}/
interface PersonaRelacionadaInfo {
  id: number;
  nombre: string;
  apellido: string;
  dni: number | null;
  fecha_nacimiento: string | null;
  edad_calculada: number | null;
  genero: string;
  adulto: boolean;
  nnya: boolean;
  telefono: string | null;
  nacionalidad: string;
  situacion_dni: string;
  legajo: {
    id: number;
    numero: string;
    fecha_apertura: string;
  } | null;
  medidas_activas: Array<{
    id: number;
    tipo_medida: string;
    estado: string;
    numero_medida: string | null;
  }>;
  demandas: Array<{
    demanda_id: number;
    vinculo_demanda: string;
    estado: string;
  }>;
}

interface PersonaVinculo {
  id: number;
  persona_origen: number;
  persona_destino: number;
  persona_destino_info: PersonaRelacionadaInfo;
  tipo_vinculo: number;
  tipo_vinculo_nombre: string;
  conviviente: boolean;
  legalmente_responsable: boolean;
  ocupacion: string | null;
  es_referente_principal: boolean;
  observaciones: string | null;
  activo: boolean;
  creado_por: number | null;
  creado_por_nombre: string | null;
  creado_en: string;
  desvinculado_por: number | null;
  desvinculado_por_nombre: string | null;
  desvinculado_en: string | null;
  justificacion_desvincular: string | null;
}

// Request para PATCH /api/legajos/{id}/nnya/
interface PersonaRelacionadaCreateExistente {
  persona_existente_id: number;
  tipo_vinculo: number;
  conviviente?: boolean;
  legalmente_responsable?: boolean;
  ocupacion?: string;
  es_referente_principal?: boolean;
  observaciones?: string;
}

interface PersonaRelacionadaCreateNueva {
  persona_datos: {
    nombre: string;
    apellido: string;
    dni?: number;
    fecha_nacimiento?: string;
    genero?: string;
    adulto?: boolean;
    nnya?: boolean;
    telefono?: string;
  };
  tipo_vinculo: number;
  conviviente?: boolean;
  legalmente_responsable?: boolean;
  ocupacion?: string;
  es_referente_principal?: boolean;
  observaciones?: string;
}

interface PersonaRelacionadaUpdate {
  id: number;
  conviviente?: boolean;
  legalmente_responsable?: boolean;
  ocupacion?: string;
  es_referente_principal?: boolean;
  observaciones?: string;
  tipo_vinculo?: number;
}

interface PersonaRelacionadaDesvincular {
  id: number;
  desvincular: true;
  justificacion_desvincular: string; // min 20 chars
}

type PersonaRelacionadaRequest =
  | PersonaRelacionadaCreateExistente
  | PersonaRelacionadaCreateNueva
  | PersonaRelacionadaUpdate
  | PersonaRelacionadaDesvincular;

// Respuesta de GET /api/mesa-de-entrada/
interface PersonaRelacionadaResumen {
  id: number;
  nombre: string;
  apellido: string;
  tipo_relacion: string;
  conviviente: boolean;
  legalmente_responsable: boolean;
}

// Respuesta de POST /api/demanda-busqueda-vinculacion/
interface PersonaRelacionadaBusqueda {
  persona_buscada_id: number;
  persona_relacionada_id: number;
  persona_relacionada_nombre: string;
  persona_relacionada_dni: number | null;
  tipo_relacion: string;
  legajo_id: number | null;
  legajo_numero: string | null;
}
```

---

## Archivos Modificados en Backend

### Nuevos Archivos
| Archivo | Descripción |
|---------|-------------|
| `infrastructure/models/Persona.py` | Nuevos modelos TPersonaVinculo, TPersonaVinculoHistory |
| `infrastructure/signals/persona_vinculo_signals.py` | Signal para historial automático |
| `services/persona_matcher.py` | Servicio para búsqueda/creación de personas sin duplicados |
| `api/serializers/TPersonaVinculoSerializer.py` | Serializers de lectura/escritura para vínculos |
| `api/views/TVinculoDePersonasViewSet.py` | **NUEVO** ViewSet para catálogo de tipos de parentesco |

### Archivos Modificados
| Archivo | Cambio |
|---------|--------|
| `api/serializers/TPersonaCompletaUpdateSerializer.py` | Soporte completo para todos los datos del NNyA incluyendo `personas_relacionadas` |
| `api/serializers/LegajoDetalleSerializer.py` | Campo `personas_relacionadas` en respuesta de GET y PATCH |
| `api/serializers/ComposedSerializer.py` | Campo `personas_relacionadas_nnya` en MesaDeEntrada |
| `api/views/ConexionesView.py` | Campo `personas_relacionadas` en búsqueda de vinculación |
| `api/views/LegajoView.py` | Acción `nnya` ya existía con GET/PATCH unificado |
| `api/views/__init__.py` | Export de `TVinculoDePersonasViewSet` |
| `api/urls.py` | Registro de ruta `/api/vinculo-de-personas/` |
| `infrastructure/signals/historial_seguimiento_signals.py` | Fix import circular con lazy import |
| `infrastructure/management/fixtures/sorted_models.json` | Agregados nuevos modelos al orden de carga |

---

## Permisos del Endpoint

El endpoint `PATCH /api/legajos/{id}/nnya/` requiere uno de los siguientes permisos:

| Rol | Puede editar |
|-----|--------------|
| Admin (superuser) | ✅ Siempre |
| Director | ✅ Cualquier legajo |
| Jefe Zonal | ✅ Legajos de su zona |
| Responsable del Legajo | ✅ Solo sus legajos asignados |
| Otros usuarios | ❌ No permitido |

---

## Códigos de Error

| Código | Mensaje | Causa |
|--------|---------|-------|
| 404 | "Legajo no encontrado" | ID de legajo inválido o sin permisos |
| 403 | "No tiene permisos para modificar este NNyA" | Usuario no autorizado |
| 400 | Errores de validación | Datos inválidos en el request |

---

## Changelog

| Fecha | Versión | Cambios |
|-------|---------|---------|
| 2026-02-02 | 2.1 | Nuevo endpoint `GET /api/vinculo-de-personas/` para catálogo de tipos de parentesco. Respuesta de PATCH ahora incluye `personas_relacionadas`. |
| 2026-02-01 | 2.0 | Documentación completa del endpoint `/api/legajos/{id}/nnya/` con todos los datos (PERSONAL, EDUCACIÓN, SALUD, VULNERABILIDAD, PERSONAS RELACIONADAS) |
| 2026-02-01 | 1.0 | Implementación inicial de TPersonaVinculo |
