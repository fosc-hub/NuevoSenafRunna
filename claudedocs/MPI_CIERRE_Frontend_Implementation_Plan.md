# MPI Closure Flow - Frontend Implementation Plan

> **Backend Status**: ✅ Complete (endpoints documented in `RUNNA API (11).yaml`)  
> **Frontend Status**: 📋 To be implemented

---

## 🎯 Implementation Scope

Build frontend UI and integration for the **MPI Informe de Cierre** workflow:
- Estado 3: Equipo Técnico creates closure report
- Estado 4: Jefe Zonal approves/rejects
- Result: Medida closes or returns to Estado 3

---

## 📁 Files to Create/Modify

### 1️⃣ **API Layer** (Create New)

#### `src/app/(runna)/legajo-mesa/types/informe-cierre-api.ts`
```typescript
// TypeScript interfaces for API responses
export interface InformeCierreAdjunto {
  id: number
  tipo: "INFORME_TECNICO" | "EVALUACION" | "ACTA" | "OTRO"
  tipo_display: string
  nombre_original: string
  tamaño_bytes: number
  extension: string
  descripcion?: string
  url: string
  subido_por: {
    id: number
    nombre_completo: string
  }
  fecha_subida: string
}

export interface InformeCierre {
  id: number
  medida: number
  medida_detalle: {
    id: number
    numero_medida: string
    tipo_medida: string
    estado_vigencia: string
  }
  elaborado_por_detalle: {
    id: number
    nombre_completo: string
  }
  observaciones: string
  fecha_registro: string
  aprobado_por_jz: boolean
  fecha_aprobacion_jz: string | null
  jefe_zonal_aprobador: any | null
  rechazado: boolean
  observaciones_rechazo: string | null
  activo: boolean
  adjuntos: InformeCierreAdjunto[]
}

export interface CreateInformeCierreRequest {
  observaciones: string
}

export interface RechazarCierreRequest {
  observaciones: string
}
```

#### `src/app/(runna)/legajo-mesa/api/informe-cierre-api-service.ts`
```typescript
import { get, create, post } from "@/app/api/apiService"
import type { InformeCierre, CreateInformeCierreRequest, RechazarCierreRequest } from "../types/informe-cierre-api"

// GET /api/medidas/{medida_id}/informe-cierre/
export const getInformesCierre = async (medidaId: number): Promise<InformeCierre[]> => {
  return await get<InformeCierre[]>(`medidas/${medidaId}/informe-cierre/`)
}

// POST /api/medidas/{medida_id}/informe-cierre/
export const createInformeCierre = async (
  medidaId: number,
  data: CreateInformeCierreRequest
): Promise<InformeCierre> => {
  return await create<InformeCierre>(
    `medidas/${medidaId}/informe-cierre`,
    data as any
  )
}

// POST /api/medidas/{medida_id}/aprobar-cierre/
export const aprobarCierre = async (medidaId: number): Promise<any> => {
  return await post(`medidas/${medidaId}/informe-cierre/aprobar-cierre/`, {})
}

// POST /api/medidas/{medida_id}/rechazar-cierre/
export const rechazarCierre = async (
  medidaId: number,
  data: RechazarCierreRequest
): Promise<any> => {
  return await post(`medidas/${medidaId}/informe-cierre/rechazar-cierre/`, data)
}

// POST /api/medidas/{medida_id}/informe-cierre/adjuntos/
export const uploadAdjuntoInformeCierre = async (
  medidaId: number,
  informeCierreId: number,
  file: File,
  tipo: "INFORME_TECNICO" | "EVALUACION" | "ACTA" | "OTRO",
  descripcion?: string
): Promise<any> => {
  const formData = new FormData()
  formData.append("archivo", file)
  formData.append("informe_cierre_id", informeCierreId.toString())
  formData.append("tipo", tipo)
  if (descripcion) formData.append("descripcion", descripcion)

  const response = await fetch(`/api/medidas/${medidaId}/informe-cierre/adjuntos/`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) throw new Error(`Upload failed: ${response.statusText}`)
  return await response.json()
}
```

---

### 2️⃣ **UI Components** (Create New)

#### `src/app/(runna)/legajo/[id]/medida/[medidaId]/components/dialogs/informe-cierre-modal.tsx`

**Purpose**: Modal for Equipo Técnico to create closure report

**Key Features**:
- Textarea for observaciones (min 20 chars, required)
- Real-time character counter
- File upload (drag-drop + click)
- File validation (extensions, size)
- Error handling
- Success callback to refresh parent

**States**:
```typescript
const [observaciones, setObservaciones] = useState("")
const [archivos, setArchivos] = useState<File[]>([])
const [isSubmitting, setIsSubmitting] = useState(false)
const [error, setError] = useState<string | null>(null)
```

**Validation**:
```typescript
// Minimum 20 characters
if (observaciones.trim().length < 20) {
  setError("Las observaciones deben tener al menos 20 caracteres")
  return
}
```

**Submit Flow**:
```typescript
1. Create informe (POST /api/medidas/{id}/informe-cierre/)
2. Upload each file (POST .../adjuntos/)
3. Show success toast
4. Call onSuccess callback
5. Close modal
```

---

#### `src/app/(runna)/legajo/[id]/medida/[medidaId]/components/dialogs/rechazar-cierre-modal.tsx`

**Purpose**: Modal for Jefe Zonal to reject closure with observations

**Key Features**:
- Textarea for observaciones (required)
- Show current informe content for context
- Warning message about consequences
- Confirmation step

**States**:
```typescript
const [observaciones, setObservaciones] = useState("")
const [isSubmitting, setIsSubmitting] = useState(false)
```

**Submit Flow**:
```typescript
1. Validate observaciones not empty
2. POST /api/medidas/{id}/rechazar-cierre/
3. Show success: "Informe rechazado. Se notificó al Equipo Técnico"
4. Refresh medida data
5. Close modal
```

---

#### `src/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/informe-cierre-section.tsx`

**Purpose**: Display informe de cierre details and actions

**When to Show**: When medida is MPI and in Estado 3 or 4

**Layout**:
```tsx
<Card>
  <CardHeader title="Informe de Cierre" />
  <CardContent>
    {/* If Estado 3: Show "Registrar Informe" button */}
    {estado === 'PENDIENTE_DE_INFORME_DE_CIERRE' && (
      <Button onClick={() => setInformeCierreModalOpen(true)}>
        Registrar Informe de Cierre
      </Button>
    )}

    {/* If Estado 4 + informe exists: Show informe details */}
    {informe && (
      <>
        <Typography variant="h6">Observaciones</Typography>
        <Typography>{informe.observaciones}</Typography>
        
        {/* Attachments list */}
        <AdjuntosList adjuntos={informe.adjuntos} />
        
        {/* JZ Actions (only if user is JZ) */}
        {isJZ && estado === 'INFORME_DE_CIERRE_REDACTADO' && (
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="success"
              onClick={handleAprobar}
            >
              Aprobar Cierre
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => setRechazarModalOpen(true)}
            >
              Rechazar
            </Button>
          </Box>
        )}
      </>
    )}
  </CardContent>
</Card>
```

**State Management**:
```typescript
const [informe, setInforme] = useState<InformeCierre | null>(null)
const [isLoadingInforme, setIsLoadingInforme] = useState(false)
const [informeCierreModalOpen, setInformeCierreModalOpen] = useState(false)
const [rechazarModalOpen, setRechazarModalOpen] = useState(false)

// Load informe on mount
useEffect(() => {
  const loadInforme = async () => {
    const informes = await getInformesCierre(medidaId)
    const informeActivo = informes.find(i => i.activo)
    setInforme(informeActivo || null)
  }
  loadInforme()
}, [medidaId])
```

**Actions**:
```typescript
const handleAprobar = async () => {
  try {
    await aprobarCierre(medidaId)
    showToast("Medida cerrada exitosamente", "success")
    // Refresh medida data
    onRefresh?.()
  } catch (error) {
    showToast("Error al aprobar cierre", "error")
  }
}
```

---

### 3️⃣ **Integration Points** (Modify Existing)

#### `src/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/unified-workflow-tab.tsx`

**Changes Needed**:

1. **Add Estado 3 Detection**:
```typescript
const isEstado3 = medidaApiData?.etapa_actual?.estado === 'PENDIENTE_DE_INFORME_DE_CIERRE'
const isEstado4 = medidaApiData?.etapa_actual?.estado === 'INFORME_DE_CIERRE_REDACTADO'
```

2. **Render Informe Cierre Section** (after intervention section):
```typescript
{medidaData.tipo_medida === 'MPI' && (isEstado3 || isEstado4) && (
  <InformeCierreSection
    medidaId={medidaData.id}
    medidaApiData={medidaApiData}
    isJZ={isJZ}
    onRefresh={refetchMedidaData}
  />
)}
```

3. **Update Workflow Steps** (for MPI only):
```typescript
// Add Estado 3 and 4 to MPI workflow visualization
const mpiSteps: WorkflowStep[] = [
  { id: 1, name: 'Intervención', status: 'completed' },
  { id: 2, name: 'Aprobación JZ', status: 'completed' },
  { id: 3, name: 'Informe de Cierre', status: isEstado3 ? 'in_progress' : 'completed' },
  { id: 4, name: 'Aprobación Cierre', status: isEstado4 ? 'in_progress' : 'pending' },
]
```

---

#### `src/app/(runna)/legajo/[id]/medida/medida-detail.tsx`

**Changes Needed**:

1. **Import new section**:
```typescript
import { InformeCierreSection } from './[medidaId]/components/medida/informe-cierre-section'
```

2. **Add conditional rendering**:
```typescript
{/* Show for MPI in closure phase */}
{medidaApiData?.tipo_medida === 'MPI' && 
 ['PENDIENTE_DE_INFORME_DE_CIERRE', 'INFORME_DE_CIERRE_REDACTADO'].includes(
   medidaApiData?.etapa_actual?.estado || ''
 ) && (
  <Grid item xs={12}>
    <InformeCierreSection
      medidaId={medidaApiData.id}
      medidaApiData={medidaApiData}
      isJZ={isJZ}
      onRefresh={loadData}
    />
  </Grid>
)}
```

---

### 4️⃣ **Utility Functions** (Create/Modify)

#### `src/app/(runna)/legajo/[id]/medida/[medidaId]/utils/file-validation.ts`

```typescript
export const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png']
export const MAX_FILE_SIZE_MB = 10
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

export interface FileValidationResult {
  valid: boolean
  error?: string
}

export const validateFile = (file: File): FileValidationResult => {
  // Check extension
  const extension = file.name.split('.').pop()?.toLowerCase()
  if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: `Extensión no permitida. Solo: ${ALLOWED_EXTENSIONS.join(', ')}`
    }
  }

  // Check size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMB = (file.size / 1024 / 1024).toFixed(2)
    return {
      valid: false,
      error: `Archivo muy grande (${sizeMB}MB). Máximo: ${MAX_FILE_SIZE_MB}MB`
    }
  }

  return { valid: true }
}

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}
```

---

## 🔄 User Flows

### Flow 1: Equipo Técnico Creates Closure Report

```
1. User navigates to medida MPI in Estado 3
2. UnifiedWorkflowTab shows InformeCierreSection
3. Section displays "Registrar Informe de Cierre" button
4. User clicks button → InformeCierreModal opens
5. User enters observaciones (min 20 chars)
6. User uploads files (optional)
7. User clicks "Enviar Informe"
8. Frontend calls:
   - POST /api/medidas/{id}/informe-cierre/
   - POST .../adjuntos/ (for each file)
9. Success toast: "Informe registrado. Estado actualizado a 'Informe de cierre redactado'"
10. Modal closes, medida data refreshes
11. UnifiedWorkflowTab now shows Estado 4
```

### Flow 2: Jefe Zonal Approves Closure

```
1. JZ navigates to medida MPI in Estado 4
2. InformeCierreSection shows:
   - Informe details (observaciones, attachments)
   - "Aprobar Cierre" button (green)
   - "Rechazar" button (red)
3. JZ clicks "Aprobar Cierre"
4. Confirmation dialog: "¿Está seguro de cerrar esta medida?"
5. JZ confirms
6. Frontend calls: POST /api/medidas/{id}/aprobar-cierre/
7. Success toast: "Medida cerrada exitosamente"
8. Medida data refreshes
9. Medida now shows estado_vigencia='CERRADA'
10. fecha_cierre displayed
```

### Flow 3: Jefe Zonal Rejects Closure

```
1. JZ navigates to medida MPI in Estado 4
2. JZ clicks "Rechazar" button
3. RechazarCierreModal opens
4. Modal shows:
   - Current informe observaciones (read-only)
   - Textarea for observaciones de rechazo (required)
   - Warning: "La medida volverá a Estado 3"
5. JZ enters observaciones explaining what needs correction
6. JZ clicks "Rechazar Informe"
7. Frontend calls: POST /api/medidas/{id}/rechazar-cierre/
8. Success toast: "Informe rechazado. Se notificó al Equipo Técnico"
9. Modal closes, medida data refreshes
10. Medida now back in Estado 3
11. ET sees observaciones de rechazo
12. ET can correct and resubmit
```

---

## 📋 Implementation Checklist

### Phase 1: API Layer ⏱️ 2-3 hours
- [ ] Create `types/informe-cierre-api.ts` with all interfaces
- [ ] Create `api/informe-cierre-api-service.ts` with 5 functions
- [ ] Test API calls in browser console
- [ ] Handle error cases (400, 403, 404, 413)

### Phase 2: Core Components ⏱️ 4-5 hours
- [ ] Create `InformeCierreModal` component
  - [ ] Observaciones textarea with validation
  - [ ] Character counter (min 20)
  - [ ] File upload (drag-drop + click)
  - [ ] File list with remove option
  - [ ] Submit logic with error handling
- [ ] Create `RechazarCierreModal` component
  - [ ] Show current informe context
  - [ ] Observaciones textarea (required)
  - [ ] Warning message
  - [ ] Confirmation step
- [ ] Create `InformeCierreSection` component
  - [ ] Conditional rendering by estado
  - [ ] Display informe details
  - [ ] Attachments list with download links
  - [ ] Approve/Reject buttons (JZ only)

### Phase 3: Integration ⏱️ 2-3 hours
- [ ] Update `unified-workflow-tab.tsx`
  - [ ] Add Estado 3/4 detection
  - [ ] Integrate InformeCierreSection
  - [ ] Update MPI workflow steps visualization
- [ ] Update `medida-detail.tsx`
  - [ ] Add conditional rendering for MPI closure
  - [ ] Pass correct props
- [ ] Update workflow stepper to show Estados 3-4 for MPI

### Phase 4: Utilities & Polish ⏱️ 1-2 hours
- [ ] Create `file-validation.ts` utilities
- [ ] Add loading states and skeletons
- [ ] Add success/error toasts
- [ ] Add confirmation dialogs for critical actions
- [ ] Test responsive design (mobile/tablet)

### Phase 5: Testing ⏱️ 2-3 hours
- [ ] Test create informe flow (happy path)
- [ ] Test file upload (valid/invalid files)
- [ ] Test approval flow
- [ ] Test rejection flow with corrections
- [ ] Test permission visibility (ET vs JZ)
- [ ] Test error handling (network errors, validation errors)
- [ ] Cross-browser testing (Chrome, Firefox, Safari)

---

## 🎨 UI/UX Guidelines

### Color Coding
- **Estado 3** (Pending): Blue/Info color
- **Estado 4** (Ready for approval): Warning/Yellow color
- **Approved** (Closed): Success/Green
- **Rejected**: Error/Red

### Button Hierarchy
- **Primary Action**: "Enviar Informe", "Aprobar Cierre" (contained button)
- **Secondary Action**: "Rechazar" (outlined button)
- **Tertiary Action**: "Cancelar" (text button)

### Loading States
```tsx
{isSubmitting && (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <CircularProgress size={20} />
    <Typography>Procesando...</Typography>
  </Box>
)}
```

### Empty States
```tsx
{!informe && estado === 'PENDIENTE_DE_INFORME_DE_CIERRE' && (
  <Alert severity="info">
    Esta medida está lista para cierre. Registre el informe de cierre para continuar.
  </Alert>
)}
```

### Success Feedback
```tsx
showToast({
  message: "Informe registrado exitosamente",
  severity: "success",
  duration: 5000
})
```

---

## 🐛 Error Handling

### Common Errors to Handle

| Error | Status | Message | Action |
|-------|--------|---------|--------|
| Observaciones < 20 chars | 400 | "Las observaciones deben tener al menos 20 caracteres" | Show inline validation |
| File too large | 413 | "Archivo muy grande (15MB). Máximo: 10MB" | Prevent upload, show error |
| Invalid extension | 400 | "Solo se permiten archivos PDF, DOC, DOCX, JPG, PNG" | Filter in file picker |
| Not MPI | 400 | "El informe de cierre solo aplica a medidas MPI" | Hide UI for non-MPI |
| Wrong state | 400 | "La medida no está en estado válido" | Show state mismatch message |
| Permission denied | 403 | "No tiene permisos para esta acción" | Hide action buttons |

### Error Display Pattern
```tsx
{error && (
  <Alert 
    severity="error" 
    onClose={() => setError(null)}
    sx={{ mb: 2 }}
  >
    {error}
  </Alert>
)}
```

---

## 📊 Total Estimated Time

| Phase | Hours |
|-------|-------|
| API Layer | 2-3h |
| Core Components | 4-5h |
| Integration | 2-3h |
| Utilities & Polish | 1-2h |
| Testing | 2-3h |
| **TOTAL** | **11-16 hours** |

**Recommendation**: Split into 2-3 working days for quality implementation and testing.

---

## ✅ Definition of Done

- [ ] All 5 API functions work correctly
- [ ] ET can create closure report with files
- [ ] JZ can approve (medida closes)
- [ ] JZ can reject (returns to Estado 3)
- [ ] File validation works (extensions, size)
- [ ] Character counter works (min 20)
- [ ] Loading states display correctly
- [ ] Error messages are user-friendly
- [ ] Responsive design works on mobile
- [ ] No console errors or warnings
- [ ] Code follows project conventions
- [ ] Comments added for complex logic

---

## 🚀 Quick Start Commands

```bash
# Create new files
touch src/app/(runna)/legajo-mesa/types/informe-cierre-api.ts
touch src/app/(runna)/legajo-mesa/api/informe-cierre-api-service.ts
touch src/app/(runna)/legajo/[id]/medida/[medidaId]/components/dialogs/informe-cierre-modal.tsx
touch src/app/(runna)/legajo/[id]/medida/[medidaId]/components/dialogs/rechazar-cierre-modal.tsx
touch src/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/informe-cierre-section.tsx
touch src/app/(runna)/legajo/[id]/medida/[medidaId]/utils/file-validation.ts

# Start dev server
npm run dev

# Open in browser
# Navigate to: http://localhost:3000/legajo/{id}/medida/{medidaId}
```

---

**Ready to implement!** Start with Phase 1 (API Layer) and test thoroughly before moving to Phase 2. 🎯

