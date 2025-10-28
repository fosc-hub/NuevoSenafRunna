# Medidas de Protección - Etapas & Estados CORRECTED Guide

## 🚨 Critical Understanding: Etapas vs Estados

### The Real Structure

```
Medida (e.g., MED-2025-001-MPE)
├── Etapa: APERTURA
│   ├── Estado 1: PENDIENTE_REGISTRO_INTERVENCION
│   ├── Estado 2: PENDIENTE_APROBACION_REGISTRO
│   ├── Estado 3: PENDIENTE_NOTA_AVAL
│   ├── Estado 4: PENDIENTE_INFORME_JURIDICO
│   └── Estado 5: PENDIENTE_RATIFICACION_JUDICIAL
│
├── Etapa: INNOVACION
│   ├── Estado 1: PENDIENTE_REGISTRO_INTERVENCION
│   ├── Estado 2: PENDIENTE_APROBACION_REGISTRO
│   ├── Estado 3: PENDIENTE_NOTA_AVAL
│   ├── Estado 4: PENDIENTE_INFORME_JURIDICO
│   └── Estado 5: PENDIENTE_RATIFICACION_JUDICIAL
│
├── Etapa: PRORROGA
│   └── (Same 5 estados)
│
├── Etapa: CESE
│   └── (Same 5 estados)
│
└── Etapa: POST_CESE (MPE only)
    └── (Different workflow)
```

### Key Concepts

**Etapa** (Stage):
- Represents a **major phase** in the medida lifecycle
- Types: `APERTURA`, `INNOVACION`, `PRORROGA`, `CESE`, `POST_CESE`, `PROCESO`
- Each etapa has its OWN set of estados (1-5)
- Each etapa has its OWN interventions
- Frontend shows **tabs** for each etapa type

**Estado** (State):
- Represents a **workflow step** within an etapa
- 5 sequential estados for MPE: 1 → 2 → 3 → 4 → 5
- 2 estados for MPI: 1 → 2
- Each estado determines which actions/endpoints are available

---

## Data Model Relationships

### TEtapaMedida

```typescript
interface EtapaMedida {
  id: number                                    // PK
  medida_id: number                             // FK to TMedida
  nombre: string                                // "Apertura", "Innovación", etc.
  tipo_etapa: TipoEtapa                         // APERTURA, INNOVACION, PRORROGA, CESE, POST_CESE, PROCESO
  estado_especifico: TEstadoEtapaMedida | null  // FK to catalog (estados 1-5)
  estado: EstadoEtapa | null                    // Legacy string field (deprecated)
  estado_display: string                        // Human-readable estado name
  fecha_inicio_estado: string
  fecha_fin_estado: string | null
  observaciones: string | null
}
```

### TIntervencionMedida

**CRITICAL**: Interventions belong to a SPECIFIC ETAPA, not just to the medida!

```typescript
interface IntervencionMedida {
  id: number
  medida_id: number                // FK to TMedida
  etapa_id: number                 // ⚠️ FK to TEtapaMedida (THIS IS THE MISSING LINK!)
  codigo_intervencion: string      // INT-MED-YYYY-NNNNNN
  fecha_intervencion: string       // YYYY-MM-DD
  estado: 'BORRADOR' | 'ENVIADO' | 'APROBADO' | 'RECHAZADO'
  motivo_id: number
  categoria_intervencion_id: number
  // ... other fields
}
```

### TMedida

```typescript
interface MedidaDetailResponse {
  id: number
  numero_medida: string
  tipo_medida: 'MPE' | 'MPI' | 'MPJ'
  estado_vigencia: 'VIGENTE' | 'CERRADA' | 'ARCHIVADA' | 'NO_RATIFICADA'

  etapa_actual: EtapaMedida | null     // Currently active etapa
  historial_etapas: EtapaMedida[]      // ALL etapas (Apertura, Innovación, etc.)

  intervenciones_count?: number         // Total across ALL etapas
}
```

---

## The Problem & Solution

### ❌ Current Problem

**GET Request**:
```typescript
GET /api/medidas/123/intervenciones/
// Returns: ALL interventions from ALL etapas (Apertura + Innovación + Prórroga + Cese)
```

**POST Request**:
```typescript
POST /api/medidas/123/intervenciones/
{
  "medida": 123,
  "fecha_intervencion": "2025-01-15",
  "motivo_id": 1,
  // ⚠️ NO etapa_id specified - backend doesn't know which etapa this belongs to!
}
```

**Frontend Issue**:
- User is on "Innovación" tab
- Sees interventions from "Apertura" etapa mixed in
- Cannot distinguish which intervention belongs to which etapa

### ✅ Correct Implementation

#### Backend Changes Needed

**1. Add etapa_id to IntervencionResponse**:
```python
# infrastructure/serializers/intervencion_serializer.py
class IntervencionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TIntervencionMedida
        fields = [
            'id', 'codigo_intervencion', 'medida', 'etapa', 'etapa_id',  # Add etapa_id!
            'fecha_intervencion', 'estado', ...
        ]
```

**2. Accept etapa_id in POST**:
```python
# CreateIntervencionRequest must accept etapa_id
{
    "medida": 123,
    "etapa_id": 456,  # ← ADD THIS!
    "fecha_intervencion": "2025-01-15",
    "motivo_id": 1,
    ...
}
```

**3. Add etapa_id filter to GET**:
```python
# GET /api/medidas/{id}/intervenciones/?etapa_id=456
# Should filter interventions by etapa_id
```

#### Frontend Changes Needed

**1. Determine Current Etapa for Tab**:
```typescript
// In apertura-tab.tsx, innovacion-tab.tsx, etc.

// Find the specific etapa for this workflow phase
const getEtapaForWorkflow = (
  medidaApiData: MedidaDetailResponse,
  workflowPhase: WorkflowPhase
): EtapaMedida | null => {
  // Convert workflowPhase to TipoEtapa enum
  const tipoEtapa = workflowPhaseToTipoEtapa(workflowPhase)

  // Find the etapa that matches this workflow phase
  const etapaForThisWorkflow = medidaApiData.historial_etapas?.find(
    (etapa) => etapa.tipo_etapa === tipoEtapa
  )

  return etapaForThisWorkflow || null
}

// Example usage in apertura-tab:
const etapaApertura = getEtapaForWorkflow(medidaApiData, "apertura")
// etapaApertura.id = 456
// etapaApertura.tipo_etapa = "APERTURA"
// etapaApertura.estado_especifico.nombre = "Pendiente de Registro de Intervención"
```

**2. GET Interventions Filtered by Etapa**:
```typescript
// ✅ CORRECT: Filter by etapa_id
const intervenciones = await getIntervencionesByMedida(medidaId, {
  etapa_id: etapaApertura.id  // Only get interventions for Apertura etapa
})

// ❌ WRONG: Get all interventions from all etapas
const intervenciones = await getIntervencionesByMedida(medidaId)
```

**3. POST Intervention with Etapa ID**:
```typescript
// ✅ CORRECT: Specify which etapa this intervention belongs to
const newIntervencion = await createIntervencion(medidaId, {
  medida: medidaId,
  etapa_id: etapaApertura.id,  // Explicitly associate with Apertura etapa
  fecha_intervencion: "2025-01-15",
  motivo_id: 1,
  categoria_intervencion_id: 2,
  ...
})

// ❌ WRONG: No etapa_id - backend can't determine which etapa
const newIntervencion = await createIntervencion(medidaId, {
  medida: medidaId,
  fecha_intervencion: "2025-01-15",
  ...
})
```

---

## Complete Frontend Implementation

### Tab Structure

Each tab (Apertura, Innovación, Prórroga, Cese) must:
1. Find its corresponding etapa from `historial_etapas`
2. Display that etapa's current `estado_especifico` (Estado 1-5)
3. Fetch interventions ONLY for that etapa
4. Post new interventions WITH the etapa_id

### Example: Apertura Tab

```typescript
// src/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/mpe-tabs/apertura-tab.tsx

export const AperturaTab: React.FC<Props> = ({ medidaData, medidaApiData, legajoData }) => {
  // 1. Find the Apertura etapa
  const etapaApertura = medidaApiData.historial_etapas?.find(
    (etapa) => etapa.tipo_etapa === 'APERTURA'
  )

  if (!etapaApertura) {
    return <Alert>Etapa Apertura no iniciada</Alert>
  }

  // 2. Get current estado for Apertura etapa
  const estadoActual = etapaApertura.estado_especifico
  // estadoActual.numero = 1, 2, 3, 4, or 5
  // estadoActual.nombre = "Pendiente de Registro de Intervención", etc.

  // 3. Fetch interventions ONLY for Apertura etapa
  const [intervenciones, setIntervenciones] = useState<IntervencionResponse[]>([])

  useEffect(() => {
    const fetchIntervenciones = async () => {
      const data = await getIntervencionesByMedida(medidaData.id, {
        etapa_id: etapaApertura.id  // ← CRITICAL: Filter by etapa
      })
      setIntervenciones(data)
    }

    fetchIntervenciones()
  }, [medidaData.id, etapaApertura.id])

  // 4. Handle creating new intervention FOR Apertura etapa
  const handleCreateIntervencion = async (formData: IntervencionFormData) => {
    const newIntervencion = await createIntervencion(medidaData.id, {
      medida: medidaData.id,
      etapa_id: etapaApertura.id,  // ← CRITICAL: Specify Apertura etapa
      fecha_intervencion: formData.fecha,
      motivo_id: formData.motivo_id,
      categoria_intervencion_id: formData.categoria_id,
      intervencion_especifica: formData.intervencion_especifica,
      requiere_informes_ampliatorios: formData.requiere_informes,
    })

    // Refresh list
    setIntervenciones([...intervenciones, newIntervencion])
  }

  // 5. Render workflow based on Apertura's estado
  return (
    <UnifiedWorkflowTab
      medidaData={medidaData}
      medidaApiData={medidaApiData}
      legajoData={legajoData}
      workflowPhase="apertura"
      etapaActual={etapaApertura}              // Pass the specific etapa
      intervenciones={intervenciones}          // Only Apertura interventions
      onCreateIntervencion={handleCreateIntervencion}
    />
  )
}
```

### Example: Innovación Tab

```typescript
// src/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/mpe-tabs/innovacion-tab.tsx

export const InnovacionTab: React.FC<Props> = ({ medidaData, medidaApiData, legajoData }) => {
  // 1. Find the Innovación etapa
  const etapaInnovacion = medidaApiData.historial_etapas?.find(
    (etapa) => etapa.tipo_etapa === 'INNOVACION'
  )

  // If Innovación etapa hasn't been created yet, show "Iniciar Innovación" button
  if (!etapaInnovacion) {
    return (
      <Box>
        <Alert severity="info">
          La etapa de Innovación no ha sido iniciada.
        </Alert>
        <Button onClick={handleIniciarInnovacion}>
          Iniciar Etapa de Innovación
        </Button>
      </Box>
    )
  }

  // 2. Get current estado for Innovación etapa
  const estadoActual = etapaInnovacion.estado_especifico

  // 3. Fetch interventions ONLY for Innovación etapa
  const [intervenciones, setIntervenciones] = useState<IntervencionResponse[]>([])

  useEffect(() => {
    const fetchIntervenciones = async () => {
      const data = await getIntervencionesByMedida(medidaData.id, {
        etapa_id: etapaInnovacion.id  // ← CRITICAL: Filter by Innovación etapa
      })
      setIntervenciones(data)
    }

    fetchIntervenciones()
  }, [medidaData.id, etapaInnovacion.id])

  // 4. Handle creating new intervention FOR Innovación etapa
  const handleCreateIntervencion = async (formData: IntervencionFormData) => {
    const newIntervencion = await createIntervencion(medidaData.id, {
      medida: medidaData.id,
      etapa_id: etapaInnovacion.id,  // ← CRITICAL: Specify Innovación etapa
      // ... rest of the form data
    })

    setIntervenciones([...intervenciones, newIntervencion])
  }

  // 5. Handle creating Innovación etapa if it doesn't exist
  const handleIniciarInnovacion = async () => {
    await transicionarEtapa(medidaData.id, {
      tipo_etapa: 'INNOVACION',
      observaciones: 'Inicio de etapa de Innovación'
    })

    // Refresh medida data to get new etapa
    router.refresh()
  }

  return (
    <UnifiedWorkflowTab
      medidaData={medidaData}
      medidaApiData={medidaApiData}
      legajoData={legajoData}
      workflowPhase="innovacion"
      etapaActual={etapaInnovacion}
      intervenciones={intervenciones}
      onCreateIntervencion={handleCreateIntervencion}
    />
  )
}
```

---

## API Endpoint Corrections

### GET /api/medidas/{id}/intervenciones/

**Current (❌ WRONG)**:
```http
GET /api/medidas/123/intervenciones/

Response: [
  { id: 1, medida: 123, fecha_intervencion: "2025-01-10", ... },  // Apertura
  { id: 2, medida: 123, fecha_intervencion: "2025-02-15", ... },  // Innovación
  { id: 3, medida: 123, fecha_intervencion: "2025-03-20", ... },  // Prórroga
]
// ⚠️ Returns ALL interventions from ALL etapas - frontend can't distinguish!
```

**Corrected (✅ RIGHT)**:
```http
GET /api/medidas/123/intervenciones/?etapa_id=456

Response: [
  {
    id: 1,
    medida: 123,
    etapa_id: 456,             // ← Added!
    etapa_tipo: "APERTURA",    // ← Added for convenience!
    fecha_intervencion: "2025-01-10",
    ...
  }
]
// ✅ Returns ONLY interventions for Apertura etapa (etapa_id=456)
```

### POST /api/medidas/{id}/intervenciones/

**Current (❌ WRONG)**:
```http
POST /api/medidas/123/intervenciones/
{
  "medida": 123,
  "fecha_intervencion": "2025-01-15",
  "motivo_id": 1,
  "categoria_intervencion_id": 2,
  "intervencion_especifica": "Visita domiciliaria",
  "requiere_informes_ampliatorios": true
}

// ⚠️ Backend doesn't know which etapa this belongs to!
// Backend might:
// - Associate with etapa_actual (but that might be Innovación when user is on Apertura tab)
// - Create without etapa_id (orphaned intervention)
// - Fail with validation error
```

**Corrected (✅ RIGHT)**:
```http
POST /api/medidas/123/intervenciones/
{
  "medida": 123,
  "etapa_id": 456,          // ← CRITICAL: Specify Apertura etapa!
  "fecha_intervencion": "2025-01-15",
  "motivo_id": 1,
  "categoria_intervencion_id": 2,
  "intervencion_especifica": "Visita domiciliaria",
  "requiere_informes_ampliatorios": true
}

Response: {
  "id": 789,
  "codigo_intervencion": "INT-MED-2025-000123",
  "medida": 123,
  "etapa_id": 456,          // ← Backend confirms association!
  "etapa_tipo": "APERTURA", // ← Convenience field
  "estado": "BORRADOR",
  "fecha_intervencion": "2025-01-15",
  ...
}
```

---

## Backend Modifications Required

### 1. Update TIntervencionMedida Model

```python
# infrastructure/models/intervencion.py

class TIntervencionMedida(models.Model):
    medida = models.ForeignKey(
        'TMedida',
        on_delete=models.CASCADE,
        related_name='intervenciones'
    )

    etapa = models.ForeignKey(
        'TEtapaMedida',
        on_delete=models.CASCADE,
        related_name='intervenciones',
        help_text='Etapa a la que pertenece esta intervención'
    )
    # ↑ Make sure this FK exists!

    codigo_intervencion = models.CharField(max_length=50, unique=True)
    fecha_intervencion = models.DateField()
    estado = models.CharField(
        max_length=20,
        choices=[
            ('BORRADOR', 'Borrador'),
            ('ENVIADO', 'Enviado'),
            ('APROBADO', 'Aprobado'),
            ('RECHAZADO', 'Rechazado'),
        ],
        default='BORRADOR'
    )
    # ... other fields
```

### 2. Update IntervencionSerializer

```python
# infrastructure/serializers/intervencion_serializer.py

class IntervencionSerializer(serializers.ModelSerializer):
    # Read-only fields for display
    etapa_tipo = serializers.CharField(source='etapa.tipo_etapa', read_only=True)
    etapa_nombre = serializers.CharField(source='etapa.nombre', read_only=True)

    class Meta:
        model = TIntervencionMedida
        fields = [
            'id',
            'codigo_intervencion',
            'medida',
            'etapa',             # ← Write field (FK id)
            'etapa_id',          # ← Explicit (same as etapa)
            'etapa_tipo',        # ← Read-only display
            'etapa_nombre',      # ← Read-only display
            'fecha_intervencion',
            'estado',
            'estado_display',
            # ... other fields
        ]
        read_only_fields = [
            'id',
            'codigo_intervencion',
            'etapa_tipo',
            'etapa_nombre',
            # ... other read-only fields
        ]
```

### 3. Update IntervencionViewSet

```python
# infrastructure/api/viewsets/intervencion_viewset.py

class IntervencionViewSet(viewsets.ModelViewSet):
    serializer_class = IntervencionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        medida_pk = self.kwargs.get('medida_pk')
        queryset = TIntervencionMedida.objects.filter(medida_id=medida_pk)

        # ✅ Add etapa_id filter
        etapa_id = self.request.query_params.get('etapa_id')
        if etapa_id:
            queryset = queryset.filter(etapa_id=etapa_id)

        # Other filters
        estado = self.request.query_params.get('estado')
        if estado:
            queryset = queryset.filter(estado=estado)

        return queryset.select_related('medida', 'etapa')

    def perform_create(self, serializer):
        medida_pk = self.kwargs.get('medida_pk')
        medida = TMedida.objects.get(pk=medida_pk)

        # ✅ Validate etapa_id is provided
        etapa_id = serializer.validated_data.get('etapa')
        if not etapa_id:
            raise ValidationError({
                'etapa': 'El campo etapa es requerido. Debe especificar a qué etapa pertenece la intervención.'
            })

        # ✅ Validate etapa belongs to this medida
        if not TEtapaMedida.objects.filter(id=etapa_id.id, medida=medida).exists():
            raise ValidationError({
                'etapa': f'La etapa {etapa_id.id} no pertenece a la medida {medida_pk}.'
            })

        serializer.save(medida=medida)
```

---

## Estado Workflow Within Each Etapa

Once the frontend correctly filters by etapa, the estado workflow (1-5) works the same as documented before:

### For Each Etapa (Apertura, Innovación, Prórroga, Cese):

**Estado 1**: PENDIENTE_REGISTRO_INTERVENCION
- Equipo Técnico registers intervention
- POST /api/medidas/{id}/intervenciones/ (with etapa_id!)

**Estado 2**: PENDIENTE_APROBACION_REGISTRO
- Jefe Zonal approves or rejects
- POST /api/medidas/{id}/intervenciones/{id}/aprobar/
- POST /api/medidas/{id}/intervenciones/{id}/rechazar/

**Estado 3**: PENDIENTE_NOTA_AVAL
- Director creates nota de aval
- POST /api/medidas/{id}/nota-aval/ (associated with etapa_id)

**Estado 4**: PENDIENTE_INFORME_JURIDICO
- Equipo Legal creates juridical report
- POST /api/medidas/{id}/informe-juridico/ (associated with etapa_id)

**Estado 5**: PENDIENTE_RATIFICACION_JUDICIAL (MPE only)
- Record judicial decision
- POST /api/medidas/{id}/ratificacion/ (associated with etapa_id)

---

## Quick Reference

### Finding Current Etapa for Tab

```typescript
const etapaApertura = medidaApiData.historial_etapas?.find(
  (etapa) => etapa.tipo_etapa === 'APERTURA'
)

const etapaInnovacion = medidaApiData.historial_etapas?.find(
  (etapa) => etapa.tipo_etapa === 'INNOVACION'
)
```

### Getting Interventions for Specific Etapa

```typescript
// ✅ CORRECT
const intervenciones = await getIntervencionesByMedida(medidaId, {
  etapa_id: etapaApertura.id
})

// ❌ WRONG
const intervenciones = await getIntervencionesByMedida(medidaId)
```

### Creating Intervention for Specific Etapa

```typescript
// ✅ CORRECT
const newIntervencion = await createIntervencion(medidaId, {
  medida: medidaId,
  etapa_id: etapaApertura.id,  // Specify which etapa!
  fecha_intervencion: "2025-01-15",
  motivo_id: 1,
  ...
})

// ❌ WRONG
const newIntervencion = await createIntervencion(medidaId, {
  medida: medidaId,
  // Missing etapa_id!
  fecha_intervencion: "2025-01-15",
  ...
})
```

### Creating New Etapa (Innovación, Prórroga, Cese)

```typescript
// When user clicks "Iniciar Innovación" button
const nuevaEtapa = await transicionarEtapa(medidaId, {
  tipo_etapa: 'INNOVACION',
  observaciones: 'Inicio de etapa de Innovación'
})

// Backend creates TEtapaMedida with:
// - tipo_etapa = 'INNOVACION'
// - estado_especifico = Estado 1 (PENDIENTE_REGISTRO_INTERVENCION)
// - fecha_inicio_estado = now()
```

---

## Summary

**The Core Problem**: Interventions are created for a MEDIDA, but they actually belong to a specific ETAPA within that medida.

**The Solution**:
1. Backend must expose `etapa_id` in IntervencionResponse
2. Backend must accept `etapa_id` in CreateIntervencionRequest
3. Backend must filter GET requests by `etapa_id` query parameter
4. Frontend must determine which etapa corresponds to each tab
5. Frontend must pass `etapa_id` when GET/POST interventions

**Result**: Each tab (Apertura, Innovación, etc.) shows ONLY the interventions that belong to that specific etapa, and new interventions are correctly associated with the current etapa.

---

**Document Version**: 2.0 CORRECTED
**Critical Fix**: Added etapa_id relationship to interventions
**Frontend Path**: `src/app/(runna)/legajo/[id]/medida/[medidaId]/`
