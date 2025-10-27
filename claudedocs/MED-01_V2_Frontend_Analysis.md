# MED-01 V2 Frontend Implementation Analysis

**Date:** 2025-10-26
**Status:** V2 Components Created but NOT Integrated
**Progress:** 100% component creation, 0% integration

---

## Executive Summary

### 🔴 **CRITICAL GAP IDENTIFIED**

The V2 estado-based catalog system has been **fully implemented** (8 new components, 100% TypeScript compliant) but is **NOT BEING USED** in the actual MPE/MPI workflows. The frontend is still using the legacy V1 4-step hardcoded workflow system.

### Current State

**✅ V2 Components Created (Complete):**
- `EstadoStepper.tsx` - Catalog-based estados 1-5 component
- `MPJStageStepper.tsx` - MPJ stage-only component
- `MPICeseCompletion.tsx` - MPI Cese completion message
- `MPEPostCeseSection.tsx` - MPE POST_CESE activities component
- `workflow-stepper.tsx` - Updated with dual-mode (V1 + V2) routing
- API service: `estado-etapa-api-service.ts`
- Types: `estado-etapa.ts`, `medida-api.ts` (V2 updated)
- Utils: `estado-validation.ts`

**❌ V2 Integration Missing:**
- MPE tabs still use V1 hardcoded workflow
- MPI tabs still use V1 hardcoded workflow
- No API calls to estado catalog endpoints
- No tipo_etapa-based estado filtering
- No catalog-based responsable validation

---

## Architecture Analysis

### MPE Tab Structure

**File:** `src/app/(runna)/legajo/[id]/medida/medida-detail.tsx`

```typescript
// Lines 505-531: MPE Rendering
{medidaData.tipo === "MPE" ? (
  <>
    <MPEHeader medidaData={medidaData} />
    <MPETabs
      medidaData={medidaData}
      legajoData={legajoData}
      planTrabajoId={medidaApiData?.plan_trabajo_id}
    />
  </>
) : ...}
```

### MPETabs Component Structure

**File:** `src/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/mpe-tabs.tsx`

**Tab Organization (Lines 50-56):**
```typescript
<Tabs>
  <Tab label="Apertura" />       {/* → AperturaTab */}
  <Tab label="Innovación" />     {/* → InnovacionTab */}
  <Tab label="Prórroga" />       {/* → ProrrogaTab */}
  <Tab label="Plan de trabajo" /> {/* → PlanTrabajoTab */}
  <Tab label="Cese" />           {/* → CeseTab */}
  <Tab label="Post cese" />      {/* → [Placeholder] */}
</Tabs>
```

**Tab Rendering (Lines 61-78):**
```typescript
{activeTab === 0 && <AperturaTab medidaData={medidaData} legajoData={legajoData} />}
{activeTab === 1 && <InnovacionTab medidaData={medidaData} legajoData={legajoData} />}
{activeTab === 2 && <ProrrogaTab medidaData={medidaData} legajoData={legajoData} />}
{activeTab === 3 && <PlanTrabajoTab medidaData={medidaData} planTrabajoId={planTrabajoId} />}
{activeTab === 4 && <CeseTab medidaData={medidaData} legajoData={legajoData} />}
{activeTab === 5 && <Box>Contenido de Post cese - En desarrollo</Box>}
```

### Individual Stage Tab Implementation

**File:** `src/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/mpe-tabs/apertura-tab.tsx`

```typescript
// ALL stage tabs (Apertura, Innovación, Prórroga, Cese) use the same pattern:
export const AperturaTabUnified = ({ medidaData, legajoData }) => {
  return (
    <UnifiedWorkflowTab
      medidaData={medidaData}
      legajoData={legajoData}
      workflowPhase="apertura"  // Only difference per tab
    />
  )
}
```

**Pattern:** Same for `innovacion-tab.tsx`, `prorroga-tab.tsx`, `cese-tab.tsx`

### UnifiedWorkflowTab Component (THE PROBLEM)

**File:** `src/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/unified-workflow-tab.tsx`

**Lines 314-320: V1 MODE USAGE**
```typescript
return (
  <WorkflowStepper
    steps={steps}              // V1 prop
    activeStep={activeStep}    // V1 prop
    onStepClick={setActiveStep} // V1 prop
    orientation="horizontal"
  />
)
```

**❌ PROBLEM:** This is calling `WorkflowStepper` in **V1 mode** with hardcoded steps, NOT in V2 mode with catalog-based estados!

**Lines 188-302: Hardcoded 3-4 Step Workflow**
```typescript
const steps: WorkflowStep[] = [
  { id: 1, label: "Registro de Intervención", ... },
  { id: 2, label: "Nota de Aval", ... },
  { id: 3, label: "Informe Jurídico", ... },
  ...(!isMPI ? [{ id: 4, label: "Ratificación Judicial", ... }] : []),
]
```

**❌ PROBLEM:** Hardcoded step definitions instead of fetching from catalog!

---

## V2 Specification Requirements vs. Current Implementation

### MPE Requirements (from MED-01 V2 spec)

**Specification (Lines 29-31):**
```
### MPE (Medida de Protección Excepcional)
- **Todas las etapas**: Estados 1-5 completos (jurídico completo)
```

**CA-3 (Line 272):**
```
✅ MPE permite estados 1-5 para todas las etapas (APERTURA/INNOVACION/PRORROGA/CESE)
```

### What Should Happen (V2 Expected)

**For MPE Apertura Tab:**
```typescript
// EXPECTED (V2 mode)
<WorkflowStepper
  tipoMedida="MPE"
  tipoEtapa="APERTURA"
  etapaActual={medidaApiData.etapa_actual}
  medidaId={medidaApiData.id}
  availableEstados={estadosCatalog}  // Fetched from API
/>
```

**This would automatically:**
1. Fetch estados 1-5 from catalog filtered by tipo_medida='MPE' and tipo_etapa='APERTURA'
2. Display current estado from `etapaActual.estado_especifico`
3. Show responsable_tipo for each estado
4. Display siguiente_accion for next steps
5. Validate transitions based on catalog rules

### What Actually Happens (V1 Current)

**For MPE Apertura Tab:**
```typescript
// ACTUAL (V1 mode)
<WorkflowStepper
  steps={[
    { id: 1, label: "Registro de Intervención" },
    { id: 2, label: "Nota de Aval" },
    { id: 3, label: "Informe Jurídico" },
    { id: 4, label: "Ratificación Judicial" }
  ]}
  activeStep={0}
  onStepClick={setActiveStep}
/>
```

**This uses:**
1. Hardcoded 4-step workflow (not catalog-based)
2. No tipo_etapa differentiation
3. No responsable_tipo validation
4. No siguiente_accion guidance
5. Same workflow for ALL stages (Apertura, Innovación, Prórroga, Cese)

---

## TIPO_ETAPA Handling Analysis

### Backend Model (from spec lines 173-180)

```python
TIPO_ETAPA_CHOICES = [
    ('APERTURA', 'Apertura'),
    ('INNOVACION', 'Innovación'),
    ('PRORROGA', 'Prórroga'),
    ('CESE', 'Cese'),
    ('POST_CESE', 'Post-cese'),
    ('PROCESO', 'Proceso'),
]
```

### Frontend Type Definition

**File:** `src/app/(runna)/legajo/[id]/medida/[medidaId]/types/estado-etapa.ts`

**Lines 37-43:**
```typescript
export type TipoEtapa =
  | 'APERTURA'
  | 'INNOVACION'
  | 'PRORROGA'
  | 'CESE'
  | 'POST_CESE'
  | 'PROCESO'
```

### Current Frontend Tab → TipoEtapa Mapping

| Tab Name | workflowPhase | Expected TipoEtapa | Currently Used |
|----------|--------------|-------------------|----------------|
| Apertura | "apertura" | APERTURA | ❌ V1 hardcoded |
| Innovación | "innovacion" | INNOVACION | ❌ V1 hardcoded |
| Prórroga | "prorroga" | PRORROGA | ❌ V1 hardcoded |
| Plan de trabajo | N/A | N/A (PLTM activities) | ✅ Correct |
| Cese | "cese" | CESE | ❌ V1 hardcoded |
| Post cese | N/A | POST_CESE | ⚠️ Placeholder only |

**❌ PROBLEM:** The `workflowPhase` prop is NOT being used to fetch tipo_etapa-specific estados!

---

## API Endpoint Usage Analysis

### Expected V2 API Calls

**Endpoint:** `GET /api/estados-etapa-medida/`

**Query Parameters:**
- `tipo_medida=MPE`
- `tipo_etapa=APERTURA` (or INNOVACION, PRORROGA, CESE)
- `activo=true`

**Expected Response:**
```json
{
  "count": 5,
  "results": [
    {
      "id": 1,
      "codigo": "PENDIENTE_REGISTRO_INTERVENCION",
      "nombre_display": "(1) Pendiente de registro de intervención",
      "orden": 1,
      "responsable_tipo": "EQUIPO_TECNICO",
      "siguiente_accion": "Registrar intervención (MED-02)",
      "aplica_a_tipos_medida": ["MPI", "MPE"],
      "aplica_a_tipos_etapa": ["APERTURA", "INNOVACION", "PRORROGA", "CESE"]
    },
    // ... estados 2-5
  ]
}
```

### Current API Calls

**From UnifiedWorkflowTab (lines 109-134):**
```typescript
// Fetch nota de aval
const notaAvalData = await getMostRecentNotaAval(medidaData.id)

// Fetch informe juridico existence
const hasInforme = await hasInformeJuridico(medidaData.id)

// Fetch ratificacion activa
const ratifData = await getRatificacionActiva(medidaData.id)
```

**❌ MISSING:** No call to `/api/estados-etapa-medida/` catalog endpoint!

### Required API Service

**File:** `src/app/(runna)/legajo/[id]/medida/[medidaId]/api/estado-etapa-api-service.ts`

**✅ IMPLEMENTED (Lines 108-131):**
```typescript
export async function getEstadosCatalog(
  params: EstadoCatalogQueryParams
): Promise<TEstadoEtapaResponse> {
  const queryString = new URLSearchParams()

  if (params.tipo_medida) {
    queryString.append('tipo_medida', params.tipo_medida)
  }
  if (params.tipo_etapa) {
    queryString.append('tipo_etapa', params.tipo_etapa)
  }
  // ... other params

  const response = await axiosInstance.get<TEstadoEtapaResponse>(
    `estados-etapa-medida/?${queryString}`
  )

  return response.data
}
```

**✅ AVAILABLE but NOT USED in UnifiedWorkflowTab!**

---

## V2 WorkflowStepper Router Logic

### How V2 Works (workflow-stepper.tsx lines 295-350)

```typescript
if (isV2Props(props)) {
  const { tipoMedida, tipoEtapa, etapaActual, medidaId, availableEstados } = props

  // MPJ: Show stage-only stepper (no estados)
  if (tipoMedida === 'MPJ') {
    return <MPJStageStepper etapaActual={etapaActual} />
  }

  // MPI Cese OR MPE POST_CESE: Show completion/post-cese sections (no estados)
  if (shouldSkipEstados(tipoMedida, tipoEtapa)) {
    if (tipoMedida === 'MPI' && tipoEtapa === 'CESE') {
      return <MPICeseCompletion etapaActual={etapaActual} />
    }
    if (tipoMedida === 'MPE' && tipoEtapa === 'POST_CESE') {
      return <MPEPostCeseSection {...props} />
    }
  }

  // Standard workflow: Estado-based stepper (MPI 1-2 estados, MPE 1-5 estados)
  return (
    <EstadoStepper
      availableEstados={availableEstados}
      etapaActual={etapaActual}
      tipoMedida={tipoMedida}
      showMetadata={true}
      orientation={isMobile ? "vertical" : "horizontal"}
    />
  )
}
```

**✅ V2 router is READY but NOT CALLED from MPE tabs!**

---

## Gap Summary

### Component Level

| Component | Status | Issue |
|-----------|--------|-------|
| EstadoStepper | ✅ Created | Not integrated |
| WorkflowStepper V2 | ✅ Ready | Not called with V2 props |
| UnifiedWorkflowTab | ❌ Using V1 | Needs V2 migration |
| AperturaTab (MPE) | ❌ Using V1 | Calls UnifiedWorkflowTab V1 |
| InnovacionTab (MPE) | ❌ Using V1 | Calls UnifiedWorkflowTab V1 |
| ProrrogaTab (MPE) | ❌ Using V1 | Calls UnifiedWorkflowTab V1 |
| CeseTab (MPE) | ❌ Using V1 | Calls UnifiedWorkflowTab V1 |
| MPJStageStepper | ✅ Created | Not integrated (MPJ uses V1) |
| MPICeseCompletion | ✅ Created | Not integrated (MPI uses V1) |
| MPEPostCeseSection | ✅ Created | Placeholder in MPETabs |

### API Integration Level

| API Call | Status | Issue |
|----------|--------|-------|
| `GET /api/estados-etapa-medida/` | ❌ Not called | Catalog not fetched |
| `GET /api/medidas/{id}/` | ✅ Called | Returns etapa_actual |
| `getEstadosCatalog()` service | ✅ Implemented | Not used anywhere |

### Type Safety Level

| Type | Status | Issue |
|------|--------|-------|
| TipoEtapa | ✅ Defined | Not used for filtering |
| TEstadoEtapaMedida | ✅ Defined | Not used in components |
| EtapaMedida.tipo_etapa | ✅ Added | Not read from API |
| EtapaMedida.estado_especifico | ✅ Object type | Not used (still using estado string) |

---

## Required Integration Work

### Phase 1: Update UnifiedWorkflowTab to V2

**File:** `unified-workflow-tab.tsx`

**Changes needed:**

1. **Add API call to fetch estados catalog:**
```typescript
const [estadosCatalog, setEstadosCatalog] = useState<TEstadoEtapaMedida[]>([])

useEffect(() => {
  const fetchEstados = async () => {
    const response = await getEstadosCatalog({
      tipo_medida: medidaData.tipo_medida,
      tipo_etapa: workflowPhaseToTipoEtapa(workflowPhase),
      activo: true
    })
    setEstadosCatalog(response.results)
  }
  fetchEstados()
}, [medidaData.tipo_medida, workflowPhase])
```

2. **Create workflowPhase → TipoEtapa mapper:**
```typescript
function workflowPhaseToTipoEtapa(phase: WorkflowPhase): TipoEtapa {
  const map: Record<WorkflowPhase, TipoEtapa> = {
    'apertura': 'APERTURA',
    'innovacion': 'INNOVACION',
    'prorroga': 'PRORROGA',
    'cese': 'CESE'
  }
  return map[phase]
}
```

3. **Replace V1 WorkflowStepper call with V2:**
```typescript
// BEFORE (V1):
return (
  <WorkflowStepper
    steps={steps}
    activeStep={activeStep}
    onStepClick={setActiveStep}
  />
)

// AFTER (V2):
return (
  <WorkflowStepper
    tipoMedida={medidaData.tipo_medida}
    tipoEtapa={workflowPhaseToTipoEtapa(workflowPhase)}
    etapaActual={medidaApiData.etapa_actual}
    medidaId={medidaData.id}
    availableEstados={estadosCatalog}
  />
)
```

4. **Update medida-detail.tsx to pass etapa_actual:**
```typescript
<UnifiedWorkflowTab
  medidaData={medidaData}
  medidaApiData={medidaApiData}  // NEW: Pass full API response
  legajoData={legajoData}
  workflowPhase="apertura"
/>
```

### Phase 2: Update MPE Post-Cese Tab

**File:** `mpe-tabs.tsx` Line 74-78

```typescript
// CURRENT:
{activeTab === 5 && (
  <Box>Contenido de Post cese - En desarrollo</Box>
)}

// UPDATE TO:
{activeTab === 5 && (
  <MPEPostCeseSection
    medidaId={medidaData.id}
    fechaCeseEfectivo={medidaApiData?.fecha_cese_efectivo}
    planTrabajoId={planTrabajoId}
    etapaNombre={medidaApiData?.etapa_actual?.nombre}
  />
)}
```

### Phase 3: Update MPI Workflow

**File:** `medida-detail.tsx` Lines 571-594

**Update to use V2:**
```typescript
<UnifiedWorkflowTab
  medidaData={medidaData}
  medidaApiData={medidaApiData}  // Pass full API response
  legajoData={legajoData}
  workflowPhase="apertura"
/>
```

**Note:** UnifiedWorkflowTab will need to detect MPI and call WorkflowStepper in V2 mode with:
- `tipoMedida="MPI"`
- `tipoEtapa="APERTURA"` (for apertura workflow)
- `availableEstados` fetched filtered by MPI (should only get estados 1-2)

### Phase 4: Update MPJ Tabs

**File:** `mpj-tabs.tsx` (needs to be read and updated)

MPJ should use the `MPJStageStepper` component directly, no estados.

---

## Backend API Endpoint Verification

### Expected Backend Endpoints (from RUNNA API spec)

**Line 11641-11747: TEstadoEtapaMedida Schema**
```yaml
TEstadoEtapaMedida:
  description: Serializer para el catálogo TEstadoEtapaMedida.
  properties:
    id: integer
    codigo: string
    nombre_display: string
    orden: integer
    responsable_tipo: enum
    siguiente_accion: string
    aplica_a_tipos_medida: array
    aplica_a_tipos_etapa: array
    activo: boolean
```

**Line 11693-11775: TEtapaMedida Schema**
```yaml
TEtapaMedida:
  properties:
    id: integer
    tipo_etapa:
      - $ref: '#/components/schemas/TEtapaMedidaEstadoEnum'
    estado_especifico:
      - $ref: '#/components/schemas/TEstadoEtapaMedida'
```

**✅ AVAILABLE:** Backend V2 models and schemas are ready

**❌ NOT SEARCHED:** Did not find explicit `/api/estados-etapa-medida/` endpoint definition in YAML (file too large - 389KB)

**Assumption:** Endpoint should exist since:
1. Frontend service is implemented pointing to `estados-etapa-medida/`
2. Spec shows TEstadoEtapaMedida schema
3. Implementation status doc confirms backend V2 is ready

---

## Recommendations

### Immediate Actions

1. **Update UnifiedWorkflowTab to V2 mode** (Highest priority)
   - Add getEstadosCatalog() API call
   - Convert workflowPhase to TipoEtapa
   - Replace V1 WorkflowStepper call with V2 props
   - Test with MPE Apertura tab first

2. **Implement MPE Post-Cese tab** (Medium priority)
   - Replace placeholder with MPEPostCeseSection component
   - Fetch fecha_cese_efectivo from API
   - Display PLTM activities post-cese

3. **Update MPI Cese workflow** (Medium priority)
   - Detect MPI + CESE combination
   - Show MPICeseCompletion component
   - Skip estados, show only closure report

4. **Update MPJ workflow** (Low priority - MPJ may not be implemented yet)
   - Replace V1 workflow with MPJStageStepper
   - Show stage transitions only, no estados

### Testing Checklist

- [ ] MPE Apertura shows estados 1-5 from catalog
- [ ] MPE Innovación shows estados 1-5 from catalog
- [ ] MPE Prórroga shows estados 1-5 from catalog
- [ ] MPE Cese shows estados 1-5 from catalog
- [ ] MPE Post-cese shows PLTM activities section (no estados)
- [ ] MPI Apertura shows estados 1-2 only from catalog
- [ ] MPI Cese shows completion message (no estados)
- [ ] MPJ shows stage stepper (no estados)
- [ ] Current estado_especifico from API is highlighted correctly
- [ ] Responsable tipo is displayed for each estado
- [ ] Siguiente acción is shown for current estado

### Code Quality

- ✅ All V2 components are TypeScript compliant (0 errors)
- ✅ All V2 types are properly defined
- ✅ All V2 API services are implemented
- ✅ V2 WorkflowStepper router logic is complete
- ❌ V2 integration is missing (0% adoption)

---

## Conclusion

**V2 Implementation Status: 50% Complete**

- **Backend:** ✅ Assumed ready (models, serializers, endpoints)
- **Frontend Components:** ✅ 100% complete (8 files created)
- **Frontend Integration:** ❌ 0% complete (not called anywhere)

**Next Step:** Migrate UnifiedWorkflowTab from V1 to V2 mode to activate the catalog-based estado system.

**Estimated Work:** 4-6 hours for full V2 integration (all tabs, all types)

**Risk:** Low (V2 system is backward compatible, V1 still works)

**Impact:** High (unlocks correct MPE/MPI/MPJ differentiation per specification)
