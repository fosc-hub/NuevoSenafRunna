# LEG-01: Reconocimiento de Existencia de Legajo

## Descripción General

Sistema de detección automática de legajos duplicados durante el registro de demandas (Paso 3 del wizard REG-01). El sistema utiliza un algoritmo de scoring multi-criterio basado en distancia de Levenshtein para identificar potenciales duplicados y permite al usuario tomar decisiones informadas sobre vinculación o creación de nuevos legajos.

## Arquitectura del Sistema

### 1. Flujo de Datos

```
Usuario ingresa datos NNyA (Step 3)
    ↓
useDuplicateDetection hook (debounce 500ms)
    ↓
API: POST /api/legajos/buscar-duplicados/
    ↓
Backend: Scoring Algorithm (DNI + Levenshtein)
    ↓
Response: Array<LegajoMatch> con scores
    ↓
DuplicateDetectionModal (si hay matches)
    ↓
Usuario elige acción:
    - Ver Detalle → Comparación lado a lado
    - Vincular → POST /api/legajos/{id}/vincular-demanda/
    - Crear Nuevo → Justificación + POST /api/legajos/crear-con-duplicado-confirmado/
    - Cancelar → Volver a editar datos
```

### 2. Estructura de Archivos

```
src/
├── app/(runna)/legajo-mesa/
│   ├── types/
│   │   └── legajo-duplicado-types.ts          # Tipos TypeScript completos
│   └── api/
│       └── legajo-duplicado-api-service.ts    # Capa de servicio API
│
├── components/forms/
│   ├── hooks/
│   │   └── useDuplicateDetection.ts           # Hook personalizado con debounce
│   ├── utils/
│   │   ├── levenshtein.ts                     # Algoritmo de distancia
│   │   └── duplicate-detection-validator.ts   # Validaciones
│   ├── constants/
│   │   └── duplicate-thresholds.ts            # Configuración y constantes
│   ├── components/nnya/
│   │   ├── duplicate-detection-modal.tsx      # Modal principal
│   │   ├── legajo-comparison-view.tsx         # Comparación detallada
│   │   ├── duplicate-justification-modal.tsx  # Modal de justificación
│   │   ├── permisos-solicitud-modal.tsx       # Modal de permisos
│   │   ├── duplicate-alert-badge.tsx          # Badge visual
│   │   └── scoring-progress-bar.tsx           # Barra de progreso
│   ├── Step3Form.tsx                          # Integración principal
│   ├── nnya-card.tsx                          # Indicador de vinculación
│   └── types/formTypes.ts                     # Tipos de formulario (actualizado)
```

## Componentes Principales

### 1. useDuplicateDetection Hook

**Ubicación:** `src/components/forms/hooks/useDuplicateDetection.ts`

**Responsabilidades:**
- Gestionar el estado de búsqueda de duplicados
- Aplicar debouncing inteligente (500ms para texto, inmediato para DNI completo)
- Cancelar búsquedas pendientes con AbortController
- Manejar errores de red

**Uso:**
```typescript
const {
  hasDuplicates,
  duplicatesFound,
  maxAlertLevel,
  isSearching,
  searchDuplicates,
  clearResults,
} = useDuplicateDetection({
  autoSearch: false,
  debounceMs: 500,
  onError: (error) => console.error(error),
})
```

### 2. DuplicateDetectionModal

**Ubicación:** `src/components/forms/components/nnya/duplicate-detection-modal.tsx`

**Características:**
- Muestra top 5 matches ordenados por score
- Código de color por nivel de alerta (rojo/naranja/amarillo)
- Vista expandible con comparación detallada
- 4 acciones principales: Ver Detalle, Vincular, Crear Nuevo, Cancelar
- Manejo de permisos para legajos de otras zonas

**Props:**
```typescript
interface DuplicateDetectionModalProps {
  open: boolean
  onClose: () => void
  matches: LegajoMatch[]
  maxAlertLevel: AlertLevel
  onVincular: (legajoId: number, data: VincularDemandaRequest) => Promise<void>
  onCrearNuevo: (data: CrearConDuplicadoRequest) => Promise<void>
  onSolicitarPermisos?: (legajoId: number, data: {...}) => Promise<void>
  isProcessing?: boolean
  demandaData?: {...}
}
```

### 3. Algoritmo de Scoring

**Ubicación:** Backend (referencia en `duplicate-thresholds.ts`)

**Pesos de Scoring:**
```typescript
const SCORING_WEIGHTS = {
  DNI_EXACT: 1.0,           // DNI idéntico = 100% match
  NOMBRE_EXACT: 0.30,       // Nombre idéntico
  APELLIDO_EXACT: 0.30,     // Apellido idéntico
  FECHA_NAC_EXACT: 0.20,    // Fecha de nacimiento idéntica
  GENERO_MATCH: 0.10,       // Género coincidente
  NOMBRE_SIMILAR: 0.20,     // Nombre similar (Levenshtein ≤ 3)
  APELLIDO_SIMILAR: 0.20,   // Apellido similar (Levenshtein ≤ 3)
  FECHA_NAC_CLOSE: 0.10,    // Fecha cercana (±1 año)
  NOMBRE_AUTOPERCIBIDO: 0.05,
}
```

**Niveles de Alerta:**
- **CRITICA** (score ≥ 1.0): DNI idéntico → Vincular obligatorio
- **ALTA** (score ≥ 0.75): Alta probabilidad → Revisar cuidadosamente
- **MEDIA** (score ≥ 0.50): Posible match → Continuar con precaución

### 4. Distancia de Levenshtein

**Ubicación:** `src/components/forms/utils/levenshtein.ts`

**Algoritmo:** Programación dinámica para calcular el número mínimo de ediciones (inserciones, eliminaciones, sustituciones) necesarias para transformar un string en otro.

**Ejemplo:**
```typescript
levenshteinDistance("MARIA", "MARIA") // 0 - idéntico
levenshteinDistance("MARIA", "MARIO") // 1 - una sustitución
levenshteinDistance("MARIA", "MARA")  // 1 - una eliminación
levenshteinDistance("MARIA", "LAURA") // 3 - tres cambios
```

**Thresholds:**
```typescript
const LEVENSHTEIN_THRESHOLDS = {
  NOMBRE_MAX_DISTANCE: 3,        // Máximo para considerar "similar"
  APELLIDO_MAX_DISTANCE: 3,
  HIGH_QUALITY_MATCH: 2,         // Alta calidad
  MEDIUM_QUALITY_MATCH: 3,       // Calidad media
}
```

## API Endpoints

### 1. Buscar Duplicados

**Endpoint:** `POST /api/legajos/buscar-duplicados/`

**Request Body:**
```json
{
  "dni": 12345678,
  "nombre": "María",
  "apellido": "González",
  "fecha_nacimiento": "2010-05-15",
  "genero": "F",
  "nombre_autopercibido": null
}
```

**Response:**
```json
{
  "matches": [
    {
      "legajo_id": 123,
      "legajo_numero": "2024-0123",
      "score": 0.95,
      "nivel_alerta": "CRITICA",
      "nnya": {
        "nombre": "María",
        "apellido": "González",
        "dni": 12345678,
        "fecha_nacimiento": "2010-05-15",
        "genero": "F"
      },
      "legajo_info": {
        "zona": { "id": 1, "nombre": "Zona Norte" },
        "responsable": {
          "id": 5,
          "nombre_completo": "Juan Director",
          "email": "juan@senaf.gob.ar"
        },
        "fecha_apertura": "2024-01-15",
        "urgencia_actual": "MEDIA",
        "estado": "ABIERTO"
      },
      "comparacion": {
        "dni": { "match": "exacto", "input": 12345678, "existente": 12345678 },
        "nombre": { "match": "exacto", "input": "María", "existente": "María" },
        "apellido": { "match": "exacto", "input": "González", "existente": "González" },
        "fecha_nacimiento": { "match": "exacto", ... }
      },
      "tiene_permisos": true,
      "puede_vincular": true
    }
  ],
  "total_matches": 1,
  "nivel_alerta_maximo": "CRITICA",
  "recomendacion": "VINCULAR"
}
```

### 2. Vincular Demanda a Legajo

**Endpoint:** `POST /api/legajos/{legajo_id}/vincular-demanda/`

**Request Body:**
```json
{
  "tipo_demanda": "PROTECCION_INTEGRAL",
  "descripcion": "Nueva situación de vulneración",
  "confirmacion_duplicado": true,
  "score_similitud": 0.95
}
```

**Response:**
```json
{
  "success": true,
  "legajo_id": 123,
  "legajo_numero": "2024-0123",
  "demanda_vinculada_id": 456,
  "message": "Demanda vinculada exitosamente"
}
```

**Errores:**
- `403 Forbidden`: Usuario sin permisos para el legajo
- `404 Not Found`: Legajo no existe
- `400 Bad Request`: Datos inválidos

### 3. Crear Legajo con Duplicado Confirmado

**Endpoint:** `POST /api/legajos/crear-con-duplicado-confirmado/`

**Request Body:**
```json
{
  "duplicado_ignorado_legajo_id": 123,
  "score_similitud": 0.95,
  "justificacion": "Se trata de hermanos gemelos con datos muy similares. Confirmado por equipo social que son dos personas distintas. Se adjunta documentación que acredita identidades separadas."
}
```

**Response:**
```json
{
  "success": true,
  "legajo_creado_id": 124,
  "legajo_numero": "2024-0124",
  "auditoria_id": 789,
  "notificacion_supervisor": true,
  "message": "Legajo creado. Justificación registrada en auditoría."
}
```

## Validaciones

### Validaciones de Formulario

**Archivo:** `src/components/forms/utils/duplicate-detection-validator.ts`

1. **Búsqueda Mínima:**
   - Nombre obligatorio (min 2 caracteres)
   - Apellido obligatorio (min 2 caracteres)
   - DNI opcional pero debe ser válido (7-8 dígitos)

2. **Justificación de Creación Forzada:**
   - Mínimo 20 caracteres
   - Obligatoria para crear nuevo legajo con duplicado

3. **Motivo de Solicitud de Permisos:**
   - Mínimo 10 caracteres
   - Obligatorio para solicitar acceso temporal o transferencia

### Validaciones de Backend

1. **DNI:** 7-8 dígitos numéricos
2. **Scoring:** Score calculado automáticamente, no enviado por frontend
3. **Permisos:** Verificación de zona del usuario vs zona del legajo
4. **Estado del Legajo:** Solo se puede vincular a legajos ABIERTOS

## Manejo de Permisos

### Zonas y Acceso

El sistema maneja permisos basados en la zona del usuario:

1. **Mismo Zona:** Acceso completo, puede vincular directamente
2. **Otra Zona:**
   - Solo lectura del match
   - Puede solicitar:
     - **Acceso Temporal:** Para vincular demanda y consultar
     - **Transferencia Permanente:** Para trasladar legajo a su zona

### Flujo de Solicitud de Permisos

```
Usuario sin permisos intenta vincular
    ↓
Sistema muestra PermisosSolicitudModal
    ↓
Usuario completa:
    - Tipo: Acceso Temporal | Transferencia
    - Motivo: (min 10 caracteres)
    ↓
POST /api/legajos/{id}/solicitar-permisos/
    ↓
Notificación enviada al responsable del legajo
    ↓
Usuario recibe notificación cuando se procesa
```

## Auditoría

### Eventos Auditados

Todos los eventos de LEG-01 quedan registrados en la tabla de auditoría:

1. **Búsqueda de Duplicados:**
   - Usuario que realizó la búsqueda
   - Datos ingresados
   - Resultados encontrados (scores)

2. **Vinculación a Legajo Existente:**
   - Legajo vinculado
   - Score de similitud
   - Timestamp

3. **Creación Forzada (con duplicado):**
   - Legajo duplicado ignorado
   - Score de similitud
   - **Justificación completa**
   - Notificación a supervisor
   - Timestamp

4. **Solicitud de Permisos:**
   - Legajo solicitado
   - Tipo de solicitud
   - Motivo
   - Estado de la solicitud

### Acceso a Auditoría

Los supervisores pueden revisar:
- Todas las creaciones forzadas de sus subordinados
- Justificaciones completas
- Historial de decisiones sobre duplicados

## Casos de Uso

### Caso 1: DNI Idéntico (Score 1.0 - CRITICA)

**Escenario:** Usuario ingresa NNyA con DNI que ya existe en el sistema.

**Flujo:**
1. Sistema detecta DNI idéntico → Score = 1.0
2. Modal se abre automáticamente con alerta CRITICA (borde rojo)
3. Recomendación: "VINCULAR - DNI idéntico, debe vincular al legajo existente"
4. Usuario debe:
   - **Vincular:** Si es el mismo NNyA → Crea nueva demanda en legajo existente
   - **Crear Nuevo:** Solo si está SEGURO que son personas diferentes (requiere justificación detallada)

### Caso 2: Nombre y Apellido Similares (Score 0.75 - ALTA)

**Escenario:** Usuario ingresa "María Gonzalez" y existe "Maria Gonzales" sin DNI.

**Flujo:**
1. Sistema calcula score basado en Levenshtein:
   - "María" vs "Maria": Distancia 1 → Similar
   - "Gonzalez" vs "Gonzales": Distancia 1 → Similar
   - Score ≈ 0.75
2. Modal se abre con alerta ALTA (borde naranja)
3. Recomendación: "REVISAR - Alta probabilidad de duplicado"
4. Usuario revisa comparación detallada:
   - Fecha de nacimiento
   - Género
   - Otros datos
5. Usuario decide informadamente

### Caso 3: Legajo de Otra Zona (Sin Permisos)

**Escenario:** Usuario de Zona Norte encuentra match en Zona Sur.

**Flujo:**
1. Modal muestra match con badge "Sin permisos"
2. Usuario hace clic en "Vincular"
3. Sistema abre PermisosSolicitudModal
4. Usuario elige:
   - **Acceso Temporal:** "Necesito vincular nueva demanda al legajo"
   - **Transferencia:** "El NNyA se mudó a nuestra zona"
5. Usuario ingresa motivo detallado (min 10 caracteres)
6. Sistema envía solicitud al responsable del legajo

### Caso 4: Hermanos Gemelos (Requiere Justificación)

**Escenario:** Dos hermanos gemelos con nombre/apellido similar, mismo barrio.

**Flujo:**
1. Sistema detecta alta similitud → Score 0.85
2. Usuario ve comparación y confirma que son personas diferentes
3. Usuario hace clic en "Crear Nuevo"
4. Sistema abre DuplicateJustificationModal
5. **Paso 1:** Usuario ingresa justificación:
   ```
   Se trata de hermanos gemelos. Juan y José Pérez nacidos 15/05/2010.
   Confirmado con partida de nacimiento que acredita identidades separadas.
   Cada uno tiene su propio DNI (Juan: 45678901, José: 45678902).
   Se adjunta documentación en expediente.
   ```
6. **Paso 2:** Sistema muestra confirmación final con advertencia de auditoría
7. Usuario confirma
8. Sistema crea legajo y registra justificación completa

## Configuración

### Ajustar Thresholds

**Archivo:** `src/components/forms/constants/duplicate-thresholds.ts`

```typescript
// Ajustar niveles de alerta
export const DUPLICATE_THRESHOLDS = {
  CRITICA: 1.0,   // Cambiar a 0.95 para ser más permisivo
  ALTA: 0.75,     // Cambiar a 0.80 para alertas más estrictas
  MEDIA: 0.50,    // Cambiar a 0.60 para capturar más casos
}

// Ajustar sensibilidad de Levenshtein
export const LEVENSHTEIN_THRESHOLDS = {
  NOMBRE_MAX_DISTANCE: 3,    // Reducir a 2 para ser más estricto
  APELLIDO_MAX_DISTANCE: 3,  // Aumentar a 4 para ser más permisivo
}

// Ajustar debounce
export const DUPLICATE_SEARCH_DEBOUNCE_MS = 500  // Reducir a 300ms para búsqueda más rápida
```

### Ajustar Validaciones

**Archivo:** `src/components/forms/utils/duplicate-detection-validator.ts`

```typescript
// Cambiar longitud mínima de justificación
export function validateJustification(
  justification: string,
  minLength: number = 20  // Cambiar a 50 para requerir más detalle
)
```

## Testing

### Tests Recomendados

1. **Unit Tests:**
   - `levenshtein.ts`: Algoritmo de distancia
   - `duplicate-detection-validator.ts`: Todas las validaciones
   - Cada componente modal individualmente

2. **Integration Tests:**
   - Flujo completo: Ingreso → Búsqueda → Modal → Vinculación
   - Manejo de errores de red
   - Validación de permisos

3. **E2E Tests:**
   - Crear demanda con duplicado detectado → Vincular
   - Crear demanda con duplicado detectado → Justificar y crear nuevo
   - Solicitar permisos para legajo de otra zona

### Datos de Prueba

**Archivo:** `tests/fixtures/duplicate-detection.json`

```json
{
  "test_cases": [
    {
      "name": "DNI Idéntico",
      "input": { "dni": 12345678, "nombre": "Juan", "apellido": "Pérez" },
      "expected_score": 1.0,
      "expected_alert": "CRITICA"
    },
    {
      "name": "Nombre Similar",
      "input": { "nombre": "María", "apellido": "González" },
      "existing": { "nombre": "Maria", "apellido": "Gonzalez" },
      "expected_score": 0.75,
      "expected_alert": "ALTA"
    }
  ]
}
```

## Troubleshooting

### Problema: Modal no se abre

**Causas posibles:**
1. `hasDuplicates` es false
2. `maxAlertLevel` es null
3. Condición de renderizado no se cumple

**Solución:**
```typescript
// Verificar en console:
console.log('hasDuplicates:', hasDuplicates)
console.log('duplicatesFound:', duplicatesFound)
console.log('maxAlertLevel:', maxAlertLevel)
```

### Problema: Búsqueda no se dispara

**Causas posibles:**
1. Datos insuficientes (falta nombre o apellido)
2. Debounce todavía activo
3. AbortController canceló la request

**Solución:**
```typescript
// Verificar validación:
const { isValid, errors } = validateSearchMinimumData(data)
console.log('Valid:', isValid, 'Errors:', errors)
```

### Problema: Error 403 al vincular

**Causa:** Usuario no tiene permisos sobre el legajo (otra zona).

**Solución:** Usar flujo de solicitud de permisos en lugar de vinculación directa.

### Problema: Justificación rechazada

**Causa:** Longitud < 20 caracteres.

**Solución:**
```typescript
const { isValid, error, charactersLeft } = validateJustification(text)
console.log('Valid:', isValid, 'Left:', charactersLeft)
```

## Mejoras Futuras

### Fase 2 (Opcional)

1. **Machine Learning:**
   - Entrenar modelo con casos históricos
   - Ajustar pesos automáticamente
   - Detección de patrones complejos

2. **Búsqueda Fonética:**
   - Algoritmo Soundex para apellidos (González = Gonzales)
   - Metaphone para nombres (María = Maria)

3. **Integración con RENAPER:**
   - Validación de DNI en tiempo real
   - Detección automática de homonimia

4. **Dashboard de Auditoría:**
   - Vista consolidada de todas las creaciones forzadas
   - Estadísticas de duplicados por zona
   - Reportes de calidad de datos

5. **Notificaciones Push:**
   - Alertas en tiempo real cuando se solicitan permisos
   - Workflow de aprobación/rechazo
   - Tracking de estado de solicitudes

## Contacto y Soporte

Para consultas sobre este módulo:
- **Documentación Técnica:** Este archivo
- **User Story:** `stories/LEG-01_Reconocimiento_Existencia_Legajo.md`
- **API Spec:** `stories/RUNNA API (6).yaml`

## Changelog

### v1.0.0 (2025-01-XX)

**Implementación inicial:**
- Sistema de detección con scoring multi-criterio
- Algoritmo Levenshtein para similitud de strings
- Modal interactivo con comparación lado a lado
- Manejo de permisos cross-zona
- Auditoría completa de decisiones
- Integración con Step3Form

**Archivos creados:** 14 archivos (types, services, hooks, components, utils, constants)
