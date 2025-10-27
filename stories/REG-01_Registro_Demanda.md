# REG-01: Registro de Demanda

**Story generada mediante Ingeniería Reversa del código existente**

---

## Historia de Usuario

**Como** operador del sistema de protección de menores
**Quiero** registrar demandas de protección o petición de informe con todos sus datos asociados
**Para** iniciar el proceso de intervención del sistema SENAF-RUNNA y permitir su posterior evaluación y asignación

---

## Contexto del Negocio

REG-01 es el **punto de entrada principal** al sistema SENAF-RUNNA. Toda intervención del sistema de protección comienza con el registro de una demanda que puede ser:
- **Protección**: Situación de vulneración de derechos de NNyA
- **Petición de Informe**: Solicitud de información sobre casos existentes

La demanda captura información completa sobre:
- Datos del remitente y origen institucional
- NNyA principal y personas involucradas
- Ubicación geográfica del caso
- Motivos de ingreso y vulneraciones
- Documentación adjunta

---

## Estado de Implementación

✅ **COMPLETAMENTE IMPLEMENTADO**
📅 Implementado: Pre-documentación del proyecto
🧪 Tests: No se identificaron tests específicos de REG-01

---

## Estructura de Datos

### Modelos Principales

#### 1. TDemanda (Demanda.py:124-211)
Modelo central que representa una demanda en el sistema.

**Campos Clave:**
```python
# Temporales
fecha_ingreso_senaf: DateField          # Fecha ingreso a SENAF
fecha_oficio_documento: DateField       # Fecha del documento oficial
fecha_creacion: DateTimeField           # Auto-generado
ultima_actualizacion: DateTimeField     # Auto-actualizado

# Descriptivos
descripcion: TextField                  # Descripción del caso
observaciones: TextField                # Observaciones adicionales

# Clasificación
objetivo_de_demanda: CharField          # PROTECCION | PETICION_DE_INFORME | CARGA_OFICIOS
ambito_vulneracion: FK(TAmbitoVulneracion)
motivo_ingreso: FK(TCategoriaMotivo)
submotivo_ingreso: FK(TCategoriaSubmotivo)

# Origen Institucional
bloque_datos_remitente: FK(TBloqueDatosRemitente)  # REQUIRED
tipo_institucion: FK(TTipoInstitucionDemanda)
institucion: FK(TInstitucionDemanda)

# Workflow
estado_demanda: CharField               # SIN_ASIGNAR | CONSTATACION | EVALUACION |
                                       # PENDIENTE_AUTORIZACION | ARCHIVADA |
                                       # ADMITIDA | INFORME_SIN_ENVIAR | INFORME_ENVIADO

envio_de_respuesta: CharField          # NO_NECESARIO | PENDIENTE | ENVIADO
etiqueta: FK(TRespuestaEtiqueta)       # Clasificación de respuesta

# Geolocalización
localizacion: FK(TLocalizacion)        # REQUIRED

# Integración con MED (Medidas)
tipo_medida_evaluado: CharField        # MPI | MPE | MPJ (desde EVAL-03)
medida_creada: Boolean                 # Flag anti-duplicación

# REG-01 CARGA_OFICIOS (2025-10-27)
tipo_oficio: FK(TTipoOficio)           # Tipo de oficio judicial (NULL para otros objetivos)
                                       # Trigger: Auto-crea actividades PLTM al vincular con medida

# Auditoría
registrado_por_user: FK(CustomUser)
registrado_por_user_zona: FK(TZona)
```

**Métodos de Negocio:**
- `obtener_legajo()`: Obtiene o crea legajo asociado (integración con LEG)
- `delete()`: Soft delete (marca archivado=True)
- `hard_delete()`: Eliminación permanente

---

#### 2. TDemandaPersona (Intermedias.py:120-151)
Vincula personas con demandas, define roles.

**Campos:**
```python
demanda: FK(TDemanda)
persona: FK(TPersona)

# Rol en la demanda
vinculo_demanda: CharField              # NNYA_PRINCIPAL | NNYA_SECUNDARIO |
                                       # SUPUESTO_AUTOR_DV | SUPUESTO_AUTOR_DV_PRINCIPAL |
                                       # GARANTIZA_PROTECCION | SE_DESCONOCE

vinculo_con_nnya_principal: FK(TVinculoDePersonas)  # Parentesco con NNyA principal

# Contexto Social
conviviente: Boolean                   # Vive con NNyA principal
legalmente_responsable: Boolean        # Responsable legal
ocupacion: CharField                   # ESTUDIANTE | TRABAJADOR | DESEMPLEADO | etc.

deleted: Boolean                       # Soft delete
```

**Validaciones Comentadas (líneas 137-150):**
- Solo un NNYA_PRINCIPAL por demanda
- Solo un SUPUESTO_AUTOR_DV_PRINCIPAL por demanda
- NNYA_PRINCIPAL no debe tener vinculo_con_nnya_principal
- Validación edad: NNyA vs adulto según rol

---

#### 3. TDemandaZona (Intermedias.py:185-210)
Asignación de demanda a zonas geográficas operativas.

**Campos:**
```python
demanda: FK(TDemanda)
zona: FK(TZona)
user_responsable: FK(CustomUser)

# Control de Derivación
esta_activo: Boolean                   # Asignación activa
recibido: Boolean                      # Confirmación recepción
enviado_por: FK(CustomUser)
recibido_por: FK(CustomUser)
comentarios: TextField
```

---

#### 4. Modelos Relacionados

**TCalificacionDemanda (Demanda.py:331-337):**
- OneToOne con TDemanda
- Estado de calificación (8 opciones: PERTINENTE_*, NO_PERTINENTE_*, PASA_A_LEGAJO)
- Justificación de calificación
- Integración con CONS (Constatación) y LEG (Legajos)

**TDemandaScore (Demanda.py:370-376):**
- OneToOne con TDemanda
- Puntajes de evaluación (condiciones, vulneración, motivos, indicadores)
- Score total calculado
- Integración con EVAL (Evaluación)

**TDemandaAdjunto (Demanda.py:225-240):**
- Archivos adjuntos de la demanda
- Relación ManyToOne con TDemanda

**TCodigoDemanda (Demanda.py:260-281):**
- Códigos externos (ej. SAC, expedientes)
- tipo_codigo: FK(TTipoCodigoDemanda)
- Validación datatype (INT|STRING)

**TDemandaVinculada (Intermedias.py:~200+):**
- Vinculación entre demandas relacionadas
- Permite asociar demanda entrante con preexistente

**TDemandaHistory:**
- Historial completo de cambios en TDemanda
- Gestión vía simple-history

---

## Endpoints RESTful

### 1. POST /api/registro-demanda-form/
**Descripción:** Registro completo de demanda con datos anidados
**Vista:** `RegistroDemandaFormView` (ComposedView.py:250-282)
**Serializer:** `RegistroDemandaFormSerializer`
**Content-Type:** `multipart/form-data`

**Request Structure:**
```json
{
  "data": "{...JSON...}",  // JSON string con estructura completa
  "adjuntos[0]archivo": File,
  "adjuntos[1]archivo": File,
  "personas[0]persona_enfermedades[0]certificado_adjunto[0]archivo": File
}
```

**JSON interno (campo "data"):**
```json
{
  "fecha_ingreso_senaf": "2025-10-26",
  "fecha_oficio_documento": "2025-10-25",
  "descripcion": "Descripción del caso...",
  "observaciones": "Observaciones adicionales...",
  "objetivo_de_demanda": "PROTECCION",

  "bloque_datos_remitente": 1,
  "tipo_institucion": 2,
  "institucion": 5,
  "ambito_vulneracion": 3,
  "motivo_ingreso": 1,
  "submotivo_ingreso": 4,

  "localizacion": {
    "tipo_calle": "CALLE",
    "nombre_calle": "San Martín",
    "numero_puerta": "1234",
    "localidad": 1,
    "barrio": 2,
    "cpc": 3
  },

  "personas": [
    {
      "nombre": "Juan",
      "apellido": "Pérez",
      "dni": "12345678",
      "fecha_nacimiento": "2010-05-15",
      "genero": "MASCULINO",
      "nnya": true,

      "demanda_persona": {
        "vinculo_demanda": "NNYA_PRINCIPAL",
        "conviviente": true,
        "legalmente_responsable": false
      },

      "localizacion_persona": {...},
      "educacion": {...},
      "cobertura_medica": {...},
      "persona_enfermedades": [...],
      "vulneraciones": [...],
      "condiciones_vulnerabilidad": [...]
    },
    {
      // Personas adicionales (familiares, supuestos autores, etc.)
    }
  ],

  "codigos_demanda": [
    {"codigo": "SAC-12345", "tipo_codigo": 1}
  ]
}
```

**Response 201 Created:**
```json
{
  "message_encrypted": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "demanda": 123
}
```

**Response 400 Bad Request:**
```json
{
  "error": "Mensaje de error detallado",
  "field_errors": {
    "fecha_ingreso_senaf": ["Este campo es requerido"]
  }
}
```

**Lógica de Procesamiento:**
1. Parsear campo "data" como JSON (ComposedView.py:261-266)
2. Procesar archivos adjuntos con `process_files()` (ComposedView.py:220-248)
3. Validar con `RegistroDemandaFormSerializer`
4. Crear en transacción atómica (ComposedView.py:274-281)
5. Crear demanda + personas + localizaciones + adjuntos + relaciones
6. Retornar ID de demanda creada

---

### 2. PATCH /api/registro-demanda-form/{id}/
**Descripción:** Actualización parcial de demanda existente
**Vista:** `RegistroDemandaFormView.partial_update()` (ComposedView.py:289-300+)
**Método:** PATCH
**Request:** Mismo formato que POST (multipart/form-data)

---

### 3. GET /api/registro-demanda-form/{id}/
**Descripción:** Obtener detalle de demanda
**Vista:** `RegistroDemandaFormView.retrieve()`
**Response:** Demanda completa serializada

---

### 4. GET /api/mesa-de-entrada/
**Descripción:** Listado de demandas visibles según permisos de usuario
**Vista:** `MesaDeEntradaListView` (ComposedView.py:102-155)
**Serializer:** `MesaDeEntradaSerializer`
**Paginación:** 5 items/página (configurable)
**Filtros:** `estado_demanda`, `objetivo_de_demanda`, `envio_de_respuesta`, `etiqueta__nombre`, `bloque_datos_remitente__nombre`
**Ordenamiento:** Default `-fecha_creacion` (más reciente primero)

**Lógica de Permisos (líneas 112-155):**
```python
# Usuarios JEFE/DIRECTOR ven:
- Todas las demandas de sus zonas (via TDemandaZona)
- Todas las demandas registradas en sus zonas (registrado_por_user_zona)

# Usuarios NORMALES ven:
- Solo demandas asignadas activamente (TDemandaZona.esta_activo=True)

# TODOS ven:
- Demandas registradas personalmente (registrado_por_user)
```

**Response Structure:**
```json
{
  "count": 150,
  "next": "http://api/mesa-de-entrada/?page=2",
  "previous": null,
  "results": [
    {
      "id": 123,
      "fecha_creacion": "2025-10-26T10:30:00Z",
      "fecha_ingreso_senaf": "2025-10-25",
      "descripcion": "...",
      "estado_demanda": "SIN_ASIGNAR",
      "objetivo_de_demanda": "PROTECCION",

      "etiqueta": {...},
      "bloque_datos_remitente": {...},
      "registrado_por_user": {...},
      "registrado_por_user_zona": {...},

      "nnya_principal": {
        "nombre": "Juan",
        "apellido": "Pérez",
        "legajo": {
          "numero": "LEG-2025-001",
          "urgencia": {...}
        }
      },

      "demanda_score": {
        "score": 75.5,
        "score_vulneracion": 80.0,
        "score_condiciones_vulnerabilidad": 70.0
      },

      "calificacion": {
        "estado_calificacion": "PERTINENTE_CONSTATACION_URGENTE",
        "justificacion": "..."
      },

      "codigos_demanda": [
        {
          "codigo": "SAC-12345",
          "tipo_codigo_nombre": "SAC",
          "tipo_codigo_datatype": "STRING"
        }
      ],

      "localidad": {...},
      "barrio": {...},
      "cpc": {...},

      "demanda_zona": {
        "zona": {...},
        "user_responsable": {...},
        "recibido": false,
        "enviado_por": {...}
      },

      "adjuntos": [...]
    }
  ]
}
```

---

### 5. GET /api/registro-demanda-form-dropdowns/
**Descripción:** Obtener todos los valores de dropdowns/catálogos para el formulario
**Vista:** `RegistroDemandaFormDropdownsView` (ComposedView.py:158-217)
**Serializer:** `RegistroDemandaFormDropdownsSerializer`
**Cache:** 15 minutos (comentado actualmente)

**Response Structure:**
```json
{
  "estado_demanda_choices": [
    {"key": "SIN_ASIGNAR", "value": "Sin Asignar"},
    {"key": "CONSTATACION", "value": "Constatacion"},
    ...
  ],
  "objetivo_de_demanda_choices": [...],
  "envio_de_respuesta_choices": [...],

  "bloques_datos_remitente": [
    {"id": 1, "nombre": "Poder Judicial"},
    {"id": 2, "nombre": "Poder Ejecutivo"},
    ...
  ],
  "tipo_institucion_demanda": [...],
  "institucion_demanda": [...],
  "ambito_vulneracion": [...],

  "localidad": [...],
  "barrio": [...],
  "cpc": [...],

  "categoria_motivo": [...],
  "categoria_submotivo": [...],
  "gravedad_vulneracion": [...],
  "urgencia_vulneracion": [...],
  "condiciones_vulnerabilidad": [...],

  "vinculo_con_nnya_principal_choices": [...],
  "institucion_educativa": [...],
  "institucion_sanitaria": [...],
  "enfermedad": [...],

  "zonas": [...],

  "genero_choices": [...],
  "nacionalidad_choices": [...],
  "situacion_dni_choices": [...],
  "ocupacion_choices": [...]
}
```

---

## Serializers Complejos

### RegistroDemandaFormSerializer (ComposedSerializer.py:400+)
Serializer compuesto que maneja creación atómica de:
- Demanda principal
- Localización del hecho
- Personas involucradas (TPersona)
- Vínculos persona-demanda (TDemandaPersona)
- Localizaciones de personas (TLocalizacionPersona)
- Educación, salud, enfermedades
- Vulneraciones por persona
- Condiciones de vulnerabilidad
- Códigos de demanda
- Archivos adjuntos

**Validaciones:**
- Campos requeridos de demanda
- Al menos un NNyA_PRINCIPAL
- Consistencia de FKs (bloque_remitente ↔ tipo_institucion)
- Validación de fechas
- Validación de archivos adjuntos

---

### MesaDeEntradaSerializer (ComposedSerializer.py:144-232)
Serializer de lectura optimizado para listado con:
- Datos completos de demanda
- NNyA principal con legajo (si existe)
- Score de demanda (máximo score entre NNyAs)
- Calificación (si existe)
- Códigos externos con metadata
- Localización expandida (localidad, barrio, CPC)
- Asignación de zona activa
- Adjuntos
- Choices de calificación

**Métodos SerializerMethod:**
- `get_demanda_score()`: Busca max score entre NNyAs de la demanda
- `get_nnya_principal()`: Obtiene persona con rol NNYA_PRINCIPAL + legajo
- `get_calificacion()`: Obtiene TCalificacionDemanda si existe
- `get_codigos_demanda()`: Expande códigos con tipo_codigo_nombre y datatype
- `get_localidad/barrio/cpc()`: Expande geolocalización
- `get_demanda_zona()`: Obtiene asignación activa más reciente

---

## Validaciones de Negocio

### Validaciones Activas (Implementadas)
1. **TCalificacionDemandaSerializer (DemandaSerializer.py:69-72):**
   - Campo `demanda` no puede ser actualizado después de creación

### Validaciones Comentadas (Pendientes de activar)

**TDemanda.save() (Demanda.py:184-210):**
- onCreate:
  - Si PROTECCION → ambito_vulneracion REQUERIDO
  - tipo_institucion.bloque_datos_remitente == demanda.bloque_datos_remitente
  - submotivo_ingreso.motivo == demanda.motivo_ingreso
- onUpdate:
  - user_responsable.zona == demanda.zona_asignada

**TCodigoDemanda.save() (Demanda.py:270-277):**
- Si datatype == INT → codigo debe ser numérico
- Si datatype == STRING → codigo debe ser alfabético

**TDemandaPersona.save() (Intermedias.py:137-150):**
- Solo un NNYA_PRINCIPAL por demanda
- Solo un SUPUESTO_AUTOR_DV_PRINCIPAL por demanda
- NNYA_PRINCIPAL no debe tener vinculo_con_nnya_principal
- Roles NNYA_* → persona.nnya debe ser True
- Roles SUPUESTO_AUTOR_* → persona.nnya debe ser False

---

## Workflow de Estados

```
Estado Inicial: SIN_ASIGNAR
       ↓
    [Calificación BE-01]
       ↓
   ┌───────────────────────────┐
   │                           │
   ↓                           ↓
CONSTATACION              ARCHIVADA
(Pertinente urgente/      (No pertinente)
 no urgente)
   ↓
[Constatación CONS-01]
   ↓
EVALUACION
   ↓
[Evaluación EVAL-01/02/03]
   ↓
   ┌─────────────────┐
   │                 │
   ↓                 ↓
ADMITIDA      PENDIENTE_AUTORIZACION
(Crea legajo)    (MPE requiere aval)
   ↓                 │
   │                 ↓
   │           INFORME_SIN_ENVIAR
   │                 │
   │                 ↓
   │           INFORME_ENVIADO
   │                 │
   └─────────────────┘
         ↓
   [Integración con LEG-01/MED-01]
```

**Estados:**
- `SIN_ASIGNAR`: Estado inicial post-registro
- `CONSTATACION`: Demanda calificada como pertinente, requiere constatación
- `EVALUACION`: Constatación completada, requiere evaluación
- `PENDIENTE_AUTORIZACION`: MPE requiere nota de aval jerárquico
- `ADMITIDA`: Evaluación completada, se crea legajo
- `ARCHIVADA`: Demanda no pertinente
- `INFORME_SIN_ENVIAR`: Petición de informe lista, no enviada
- `INFORME_ENVIADO`: Petición de informe enviada a remitente

---

## Integración con Otros Módulos

### 🔗 BE-01: Bandeja de Entrada (Mesa de Entrada)
- **Relación:** BE-01 lista demandas creadas por REG-01
- **Endpoint compartido:** `/api/mesa-de-entrada/`
- **Flujo:** REG-01 → BE-01 (calificación) → CONS-01/EVAL-01

### 🔗 CONS-01/02/03: Constatación
- **Trigger:** Demanda en estado `CONSTATACION`
- **Acción:** Verificación in-situ de vulneración
- **Resultado:** Actualiza estado_demanda → `EVALUACION` o `ARCHIVADA`

### 🔗 EVAL-01/02/03: Evaluación
- **Trigger:** Demanda en estado `EVALUACION`
- **Acción:** Evaluación técnica de vulneración y urgencia
- **Resultado:**
  - Completa TDemandaScore
  - Define tipo_medida_evaluado (MPI/MPE/MPJ)
  - Actualiza estado_demanda → `ADMITIDA` o `PENDIENTE_AUTORIZACION`

### 🔗 LEG-01/02: Gestión de Legajos
- **Trigger:** Demanda ADMITIDA
- **Método:** `TDemanda.obtener_legajo()` (Demanda.py:135-174)
- **Lógica:**
  1. Busca NNyA principal (TDemandaPersona.vinculo_con_nnya_principal == None)
  2. Busca legajo existente para ese NNyA
  3. Si no existe → crea nuevo legajo con número autogenerado
  4. Retorna legajo (existente o nuevo)

### 🔗 MED-01: Registro de Medida
- **Trigger:** Legajo creado + tipo_medida_evaluado definido
- **Campos de integración:**
  - `tipo_medida_evaluado`: Tipo de medida determinado en EVAL-03
  - `medida_creada`: Flag anti-duplicación
- **Flujo:** EVAL-03 define tipo → MED-01 crea medida automática

---

## Casos de Uso

### CU-01: Registro de Demanda de Protección (Flujo Completo)

**Actor:** Operador de Mesa de Entrada
**Precondiciones:**
- Usuario autenticado con permisos de registro
- Documento oficial (oficio/nota) recibido

**Flujo Principal:**
1. Operador accede al formulario de registro
2. Sistema carga dropdowns vía `/api/registro-demanda-form-dropdowns/`
3. Operador completa:
   - Datos de demanda (fechas, descripción, origen)
   - Localización del hecho
   - Datos de NNyA principal (obligatorio)
   - Datos de familiares/convivientes (opcional)
   - Supuesto autor de vulneración (si aplica)
   - Vulneraciones identificadas
   - Condiciones de vulnerabilidad
   - Adjunta oficio/documentos
4. Sistema valida formulario
5. Operador confirma registro
6. Sistema crea en transacción atómica:
   - TDemanda (estado: SIN_ASIGNAR)
   - TPersona (para cada persona nueva)
   - TDemandaPersona (vínculos)
   - TLocalizacion + TLocalizacionPersona
   - TDemandaAdjunto (archivos)
   - TCodigoDemanda (si hay códigos externos)
7. Sistema asigna a zona del operador (TDemandaZona)
8. Sistema retorna ID de demanda
9. Demanda queda visible en Mesa de Entrada

**Postcondiciones:**
- Demanda creada con estado SIN_ASIGNAR
- Visible en mesa de entrada de la zona
- Disponible para calificación (BE-01)

---

### CU-02: Consulta de Mesa de Entrada con Filtros

**Actor:** Jefe de Zona
**Precondiciones:** Usuario autenticado como jefe/director

**Flujo Principal:**
1. Usuario accede a `/api/mesa-de-entrada/`
2. Sistema aplica filtros de permisos:
   - Todas las demandas de sus zonas
   - Demandas registradas por usuarios de sus zonas
3. Usuario aplica filtros opcionales:
   - `estado_demanda=SIN_ASIGNAR`
   - `objetivo_de_demanda=PROTECCION`
   - `bloque_datos_remitente__nombre=Poder Judicial`
4. Sistema retorna resultados paginados (5/página)
5. Usuario ve por cada demanda:
   - Datos básicos
   - NNyA principal con score
   - Estado de calificación
   - Asignación de zona
6. Usuario puede ordenar por fecha_creacion, estado_demanda

**Postcondiciones:**
- Listado filtrado visible
- Usuario puede seleccionar demanda para detalles

---

### CU-03: Actualización de Demanda Existente

**Actor:** Operador de Mesa de Entrada
**Precondiciones:**
- Demanda existe con id conocido
- Usuario tiene permisos de edición

**Flujo Principal:**
1. Usuario recupera demanda actual `GET /api/registro-demanda-form/{id}/`
2. Usuario modifica campos necesarios (ej. descripción, observaciones)
3. Usuario puede agregar/quitar adjuntos
4. Usuario envía `PATCH /api/registro-demanda-form/{id}/`
5. Sistema valida cambios
6. Sistema actualiza demanda (ultima_actualizacion actualizado)
7. Sistema retorna demanda actualizada

**Postcondiciones:**
- Demanda actualizada
- TDemandaHistory registra cambio

---

## Tests Existentes

⚠️ **NO SE IDENTIFICARON TESTS ESPECÍFICOS** para REG-01

**Tests encontrados relacionados:**
- Tests de MED (medidas) que crean demandas como fixtures
- Tests de LEG (legajos) que crean demandas como prerequisito
- No hay `test_demanda*.py`, `test_reg01*.py` o similares

**Recomendación:** Crear suite de tests para:
- Creación de demanda básica
- Creación con múltiples personas
- Validación de campos requeridos
- Validación de NNYA_PRINCIPAL obligatorio
- Workflow de estados
- Integración con LEG (obtener_legajo)
- Filtros de mesa de entrada por permisos

---

## Criterios de Aceptación

### CA-01: Registro de Demanda Completo
✅ **Implementado**
- [x] Sistema permite registrar demanda con datos básicos obligatorios
- [x] Sistema valida fecha_ingreso_senaf, fecha_oficio_documento
- [x] Sistema permite seleccionar origen institucional (bloque_datos_remitente, tipo_institucion, institucion)
- [x] Sistema permite seleccionar objetivo_de_demanda (PROTECCION | PETICION_DE_INFORME)
- [x] Sistema permite agregar descripción y observaciones
- [x] Sistema crea demanda con estado inicial SIN_ASIGNAR

### CA-02: Registro de Personas Involucradas
✅ **Implementado**
- [x] Sistema permite agregar NNyA principal (vinculo_demanda=NNYA_PRINCIPAL)
- [x] Sistema permite agregar personas adicionales (familiares, convivientes, supuestos autores)
- [x] Sistema permite definir rol de cada persona (vinculo_demanda)
- [x] Sistema permite indicar convivencia y responsabilidad legal
- [x] Sistema permite definir vinculo_con_nnya_principal para personas secundarias

### CA-03: Localización Geográfica
✅ **Implementado**
- [x] Sistema permite registrar localización del hecho (TLocalizacion)
- [x] Sistema permite seleccionar localidad, barrio, CPC
- [x] Sistema permite especificar domicilio completo (tipo_calle, nombre_calle, número)
- [x] Sistema permite registrar localizaciones de personas (TLocalizacionPersona)

### CA-04: Motivos y Vulneraciones
✅ **Implementado**
- [x] Sistema permite seleccionar motivo_ingreso (TCategoriaMotivo)
- [x] Sistema permite seleccionar submotivo_ingreso (TCategoriaSubmotivo)
- [x] Sistema permite seleccionar ambito_vulneracion
- [x] Sistema permite registrar múltiples vulneraciones por NNyA
- [x] Sistema permite seleccionar condiciones_vulnerabilidad

### CA-05: Documentación Adjunta
✅ **Implementado**
- [x] Sistema permite adjuntar archivos a demanda (TDemandaAdjunto)
- [x] Sistema procesa archivos multipart/form-data
- [x] Sistema permite adjuntar certificados médicos a enfermedades de personas
- [x] Sistema almacena archivos de forma segura

### CA-06: Códigos Externos
✅ **Implementado**
- [x] Sistema permite registrar códigos externos (SAC, expedientes)
- [x] Sistema valida datatype de códigos (INT | STRING)
- [x] Sistema permite múltiples códigos por demanda

### CA-07: Mesa de Entrada - Visualización
✅ **Implementado**
- [x] Sistema lista demandas con paginación (5 items/página)
- [x] Sistema aplica filtros de permisos según rol de usuario
- [x] Jefes/Directores ven todas las demandas de sus zonas
- [x] Usuarios normales ven solo demandas asignadas activamente
- [x] Sistema muestra NNyA principal con legajo (si existe)
- [x] Sistema muestra score de demanda (si existe)
- [x] Sistema muestra calificación (si existe)
- [x] Sistema muestra asignación de zona actual

### CA-08: Mesa de Entrada - Filtros y Ordenamiento
✅ **Implementado**
- [x] Sistema permite filtrar por estado_demanda
- [x] Sistema permite filtrar por objetivo_de_demanda
- [x] Sistema permite filtrar por envio_de_respuesta
- [x] Sistema permite filtrar por etiqueta
- [x] Sistema permite filtrar por bloque_datos_remitente
- [x] Sistema ordena por defecto por fecha_creacion descendente
- [x] Sistema permite ordenar por estado_demanda

### CA-09: Integración con Legajos
✅ **Implementado**
- [x] Sistema proporciona método obtener_legajo()
- [x] Sistema busca legajo existente para NNyA principal
- [x] Sistema crea nuevo legajo si no existe
- [x] Sistema genera número de legajo automático
- [x] Sistema asocia legajo a NNyA (no a demanda)

### CA-10: Auditoría y Trazabilidad
✅ **Implementado**
- [x] Sistema registra usuario que crea demanda (registrado_por_user)
- [x] Sistema registra zona del usuario creador (registrado_por_user_zona)
- [x] Sistema registra fecha_creacion automáticamente
- [x] Sistema actualiza ultima_actualizacion en cada cambio
- [x] Sistema mantiene historial completo (TDemandaHistory)

---

## Problemas Identificados

### 🐛 P-01: Validaciones Comentadas
**Severidad:** Media
**Ubicación:** Demanda.py:184-210, Intermedias.py:137-150
**Descripción:** Validaciones críticas de negocio están comentadas:
- Validación de un solo NNYA_PRINCIPAL por demanda
- Validación de consistencia tipo_institucion ↔ bloque_datos_remitente
- Validación de consistencia submotivo ↔ motivo
- Validación de edad NNyA vs adulto según rol

**Impacto:** Posibles inconsistencias de datos
**Recomendación:** Activar y testear validaciones

---

### 🐛 P-02: Tests Ausentes
**Severidad:** Alta
**Descripción:** No existen tests específicos de REG-01
**Impacto:** No hay cobertura de tests para funcionalidad crítica
**Recomendación:** Crear suite completa de tests

---

### 🐛 P-03: Cache Desactivado en Dropdowns
**Severidad:** Baja
**Ubicación:** ComposedView.py:159
**Descripción:** Cache de 15 minutos está comentado en dropdowns endpoint
**Impacto:** Performance reducida en carga de formulario
**Recomendación:** Activar cache después de validar estabilidad de datos

---

### 🐛 P-04: Manejo de Errores Genérico
**Severidad:** Media
**Ubicación:** ComposedView.py:280-281
**Descripción:** `except Exception as e: return Response({"error": str(e)})`
**Impacto:** Mensajes de error poco informativos para frontend
**Recomendación:** Implementar excepciones específicas y mensajes estructurados

---

## Mejoras Sugeridas

### 💡 M-01: Validación de Archivos
Implementar validación de:
- Tipos de archivo permitidos (PDF, JPG, PNG, DOCX)
- Tamaño máximo de archivos
- Límite de archivos por demanda
- Escaneo de virus/malware

### 💡 M-02: Workflow State Machine
Implementar máquina de estados para:
- Validar transiciones permitidas entre estados
- Registrar motivos de cambios de estado
- Prevenir transiciones inválidas

### 💡 M-03: Notificaciones Automáticas
Implementar sistema de notificaciones para:
- Creación de nueva demanda (notificar jefe de zona)
- Asignación de demanda a usuario
- Cambios de estado relevantes
- Demandas sin movimiento (alertas de inactividad)

### 💡 M-04: Validación de Duplicados
Implementar detección de demandas duplicadas basada en:
- NNyA principal (DNI)
- Fecha de ingreso similar
- Descripción similar (fuzzy matching)
- Alerta de posible duplicado antes de confirmar registro

### 💡 M-05: Búsqueda Avanzada
Ampliar búsqueda en Mesa de Entrada:
- Búsqueda por DNI de NNyA
- Búsqueda por texto completo en descripción
- Filtros por rango de fechas
- Filtros por score de vulneración
- Filtros combinados (AND/OR)

### 💡 M-06: Exportación de Datos
Implementar exportación de listados:
- Excel (xlsx)
- CSV
- PDF (reportes formateados)
- Filtros aplicados se mantienen en exportación

### 💡 M-07: Estadísticas de Mesa de Entrada
Dashboard con métricas:
- Demandas por estado
- Demandas por origen institucional
- Tiempo promedio por estado
- Score promedio de vulneración
- Tendencias temporales

### 💡 M-08: Validación de Campos Condicionales
Implementar validaciones dependientes:
- Si objetivo_de_demanda = PROTECCION → ambito_vulneracion REQUERIDO
- Si tipo_institucion definido → bloque_datos_remitente debe coincidir
- Si submotivo definido → motivo debe coincidir
- Validar vinculo_con_nnya_principal solo para roles secundarios

---

## Estimación Retroactiva

**Complejidad:** Alta
**Story Points:** 21 puntos

**Desglose:**
- Modelos de datos (5 pts): TDemanda, TDemandaPersona, TDemandaZona, modelos relacionados
- Serializers complejos (5 pts): RegistroDemandaFormSerializer con creación anidada
- Endpoint de registro (3 pts): Manejo de multipart/form-data, transacciones atómicas
- Endpoint de dropdowns (2 pts): Agregación de catálogos
- Mesa de entrada con permisos (4 pts): Lógica compleja de filtros por rol
- Integración con otros módulos (2 pts): LEG, EVAL, CONS

**Tiempo Estimado:** 3-4 semanas (1 desarrollador backend senior)

---

## Notas Técnicas

### Arquitectura Clean Architecture
- **Infrastructure Layer:** Modelos (Demanda.py, Intermedias.py)
- **API Layer:** Views (ComposedView.py, DemandaView.py), Serializers (ComposedSerializer.py, DemandaSerializer.py)
- **Core Layer:** Use cases (TDecisionUseCase - referenciado pero no analizado)

### Patrones de Diseño
- **ViewSet Pattern:** BaseViewSet heredado por vistas CRUD
- **Serializer Composition:** RegistroDemandaFormSerializer compone múltiples serializers
- **Soft Delete:** TDemanda.delete() marca archivado en lugar de eliminar
- **History Tracking:** simple-history automático para auditoría
- **Transaction Atomicity:** Creación de demanda + relaciones en single transaction

### Tecnologías
- Django 4.x
- Django REST Framework 3.x
- django-filter (filtros de queryset)
- drf-spectacular (OpenAPI schema)
- simple-history (auditoría)
- MultiPartParser (archivos adjuntos)

---

## Dependencias Técnicas

### Prerequisitos para REG-01:
- ✅ Catálogos de datos (fixtures):
  - TBloqueDatosRemitente
  - TTipoInstitucionDemanda
  - TInstitucionDemanda
  - TAmbitoVulneracion
  - TCategoriaMotivo
  - TCategoriaSubmotivo
  - TCondicionesVulnerabilidad
  - TVinculoDePersonas
  - TZona (zonas operativas)

### Módulos que dependen de REG-01:
- ✅ BE-01: Bandeja de Entrada (Mesa de Entrada)
- ✅ CONS-01/02/03: Constatación
- ✅ EVAL-01/02/03: Evaluación
- ✅ LEG-01/02: Gestión de Legajos (via obtener_legajo)
- ✅ MED-01: Registro de Medida (via tipo_medida_evaluado)

---

## Referencias de Código

### Modelos
- [Demanda.py](c:\Users\facun\Documents\SENAF-RUNNA-db-backend\runna\infrastructure\models\Demanda.py)
- [Intermedias.py](c:\Users\facun\Documents\SENAF-RUNNA-db-backend\runna\infrastructure\models\Intermedias.py)

### API
- [ComposedView.py](c:\Users\facun\Documents\SENAF-RUNNA-db-backend\runna\api\views\ComposedView.py)
- [DemandaView.py](c:\Users\facun\Documents\SENAF-RUNNA-db-backend\runna\api\views\DemandaView.py)
- [ComposedSerializer.py](c:\Users\facun\Documents\SENAF-RUNNA-db-backend\runna\api\serializers\ComposedSerializer.py)
- [DemandaSerializer.py](c:\Users\facun\Documents\SENAF-RUNNA-db-backend\runna\api\serializers\DemandaSerializer.py)

### URLs
- [urls.py:155](c:\Users\facun\Documents\SENAF-RUNNA-db-backend\runna\api\urls.py#L155) - Registro
- [urls.py:202-204](c:\Users\facun\Documents\SENAF-RUNNA-db-backend\runna\api\urls.py#L202) - Mesa de Entrada
- [urls.py:204](c:\Users\facun\Documents\SENAF-RUNNA-db-backend\runna\api\urls.py#L204) - Dropdowns

---

## 🔄 Cambios Arquitectónicos Recientes

### CARGA_OFICIOS Workflow (2025-10-27)

**Status**: ✅ COMPLETADO | **Migration**: 0056 | **Tests**: 21/21 PLTM-01 passing

#### Resumen de Cambios

Se refactorizó completamente el workflow CARGA_OFICIOS eliminando campos innecesarios y simplificando la integración con PLTM-01:


**✅ CAMPO RETENIDO**:
```python
tipo_oficio = FK('TTipoOficio', null=True, blank=True)
# Purpose: Identificar tipo de oficio para auto-crear actividades PLTM
# Used by: Signal crear_actividades_desde_oficio
```

#### Nuevo Workflow CARGA_OFICIOS

```
1. Usuario registra demanda CARGA_OFICIOS
   └─ objetivo_de_demanda = 'CARGA_OFICIOS'
   └─ tipo_oficio = FK(TTipoOficio)  # Ej: "Ratificación", "Pedido Informe"

2. LEG-01: Usuario vincula demanda → medida existente
   └─ Crea TVinculoLegajo(demanda=demanda, medida=medida)
   └─ Ingresa información judicial EN LA MEDIDA (expediente, carátula, juzgado)

3. Signal detecta vinculación (oficio_signals.py)
   └─ Trigger: TVinculoLegajo.post_save
   └─ Condición: demanda.objetivo_de_demanda == 'CARGA_OFICIOS'
   └─ Busca: TTipoActividadPlanTrabajo WHERE tipo_oficio = demanda.tipo_oficio
   └─ Crea: Actividades automáticamente en medida.plan_trabajo

4. PLTM-01: Actividades disponibles para gestión
   └─ Usuario trabaja con actividades auto-creadas
```

#### Arquitectura Simplificada

**Signal Removido**:
- `crear_medida_mpj_desde_oficio` ❌ (auto-creación de medidas eliminada)

**Signal Creado**:
- `crear_actividades_desde_oficio` ✅ (auto-creación de actividades PLTM)

**TTipoOficio Simplificado**:
```python
# BEFORE: Mezclaba PLTM-01 + REG-01 (conflicto)
# AFTER: Solo PLTM-01 (clean)
class TTipoOficio(models.Model):
    nombre = CharField(max_length=200, unique=True)
    descripcion = TextField(blank=True, null=True)
    activo = BooleanField(default=True)
    orden = IntegerField(default=0)
```

#### Rationale

1. **Información judicial pertenece a medida**: Expediente, carátula, juzgado son datos de la **solución** (medida), no del **problema** (demanda)

2. **Respeto a LEG-01 workflow**: Usuario vincula manualmente demanda→medida, no auto-creación

3. **TTipoOficio es catálogo PLTM-01**: REG-01 solo lo **referencia** (FK), no lo extiende

4. **Signal en momento correcto**: Trigger en TVinculoLegajo (cuando usuario confirma vinculación), no en TDemanda.save()

#### Validación

✅ **Migration 0056**: Solo agrega `tipo_oficio` a TDemanda (additive, non-breaking)
✅ **PLTM-01 Tests**: 21/21 passing (2.878s) - sin regresiones
✅ **TTipoOficio FK**: Relación con TTipoActividadPlanTrabajo intacta
✅ **Backward Compatibility**: CARGA_OFICIOS nunca desplegado, cambios solo en desarrollo

#### Documentación Completa

Ver: [ARCHITECTURE_CHANGES_REG01_CARGA_OFICIOS_FINAL.md](../claudedocs/ARCHITECTURE_CHANGES_REG01_CARGA_OFICIOS_FINAL.md)

---

**Documento generado mediante Ingeniería Reversa**
**Fecha:** 2025-10-26
**Actualizado:** 2025-10-27 (CARGA_OFICIOS refactor)
**Base:** Análisis de código existente en SENAF-RUNNA-db-backend
**Estado:** ✅ IMPLEMENTADO - Documentación retroactiva