# PLTM-01 Gap Analysis: Frontend Implementation

**Document**: Gap Analysis between Current Frontend State and PLTM-01 Requirements
**Date**: 2025-10-19
**User Story**: PLTM-01 - Gestión de Actividades del Plan de Trabajo
**Backend API**: `/api/actividades/` (fully implemented)

---

## Executive Summary

### Current State
The frontend has **partial implementations** across 3 components with significant functionality gaps:
- ✅ Basic activity display in Plan Trabajo tab (mock data)
- ✅ Activity registration modal in Demanda context (different use case)
- ✅ Activity detail view in Evaluación context (read-only)
- ❌ **No integration with real `/api/actividades/` endpoints**
- ❌ **Missing 4th actor tab (Legal)**
- ❌ **No state management, attachments, or responsible user selection**

### Required State (PLTM-01)
Complete activity management system with:
- 4 actor tabs with specific form fields per actor
- Full CRUD operations via `/api/actividades/` API
- State transitions (5 states: PENDIENTE, EN_PROGRESO, REALIZADA, CANCELADA, VENCIDA)
- Multiple attachment support with 5 types
- Responsible user selection (principal + secondary)
- Draft mode for incomplete activities
- Auto-creation from Demanda/Oficio origins
- Filters, search, and pagination

### Gap Summary
**15 Critical Missing Features** requiring **43 hours of implementation** across **11 user stories**.

---

## Detailed Gap Analysis

### 1. Actor Tabs Coverage

| Actor | Backend Support | Frontend Implementation | Status | Gap |
|-------|----------------|-------------------------|--------|-----|
| **EQUIPO_TECNICO** | ✅ Supported | ⚠️ Placeholder form in `plan-accion-modal.tsx:279-296` | **PARTIAL** | Missing real form fields, no API integration |
| **EQUIPOS_RESIDENCIALES** | ✅ Supported | ⚠️ Placeholder form in `plan-accion-modal.tsx:298-315` | **PARTIAL** | Missing real form fields, no API integration |
| **ADULTOS_INSTITUCION** | ✅ Supported | ⚠️ Placeholder form in `plan-accion-modal.tsx:317-334` | **PARTIAL** | Missing real form fields, no API integration |
| **EQUIPO_LEGAL** | ✅ Supported | ❌ **NOT IMPLEMENTED** | **MISSING** | Entire tab missing from modal |

**Impact**:
- EQUIPO_LEGAL activities cannot be created from frontend
- Existing 3 tabs are non-functional (no data submission to backend)
- Users cannot fulfill PLTM-01 requirement: "El sistema debe permitir registrar actividades para 4 actores diferentes"

**Code Evidence**:
```typescript
// plan-accion-modal.tsx:224-227 - Only 3 tabs defined
<Tabs value={activeTab} onChange={handleTabChange}>
  <Tab label="Equipo técnico" />
  <Tab label="Equipos residenciales" />
  <Tab label="Adultos responsables/Institución" />
  {/* MISSING: <Tab label="Equipo legal" /> */}
</Tabs>
```

---

### 2. API Integration

| Feature | Backend Endpoint | Frontend Implementation | Status | Gap |
|---------|-----------------|-------------------------|--------|-----|
| **List Activities** | `GET /api/actividades/?plan_trabajo={id}` | ❌ Mock data in `plan-trabajo-tab.tsx:54-67` | **MISSING** | No real API call, using hardcoded array |
| **Create Activity** | `POST /api/actividades/` | ⚠️ Exists in `RegistrarActividadModal.tsx` (Demanda context) | **PARTIAL** | Wrong context, needs adaptation |
| **Update Activity** | `PATCH /api/actividades/{id}/` | ❌ Not implemented | **MISSING** | No edit functionality |
| **Cancel Activity** | `DELETE /api/actividades/{id}/` | ❌ Not implemented | **MISSING** | No cancel functionality |
| **Get Activity Detail** | `GET /api/actividades/{id}/` | ❌ Not implemented | **MISSING** | Detail modal shows mock data |
| **Add Attachment** | `POST /api/actividades/{id}/adjuntos/` | ❌ Not implemented in Plan Trabajo context | **MISSING** | No file upload |
| **Get Activity Types** | `GET /api/actividad-tipo/?actor={actor}` | ❌ Not implemented | **MISSING** | No dynamic catalog loading |

**Impact**:
- Activities displayed are fake, do not reflect database state
- Users cannot create, edit, or delete activities in Plan Trabajo
- No synchronization between frontend and backend
- PLTM-01 requirement failed: "integración con backend mediante API REST"

**Code Evidence**:
```typescript
// plan-trabajo-tab.tsx:54-67 - Hardcoded mock data
const mockActividades: Actividad[] = [
  {
    id: 1,
    nombre: "actividad 1",
    fechaPlazo: "12/12/2025",
    estado: "Realizada",
    cantidadIntervenciones: 3,
  },
  // ... more mock data
]
```

**Available API Service** (needs adaptation from `RegistrarActividadModal.tsx:95-127`):
```typescript
// Example from Demanda context - can be reused
const submitActividad = async (data: any) => {
  const formData = new FormData()
  formData.append("nombre", data.nombre)
  formData.append("descripcion", data.descripcion)
  // ... append other fields

  const response = await fetch("/api/actividades/", {
    method: "POST",
    body: formData,
  })
}
```

---

### 3. Type System & Type Safety

| Component | TypeScript Types | Backend Alignment | Status | Gap |
|-----------|-----------------|-------------------|--------|-----|
| **Activity Entity** | ⚠️ Local interface `Actividad` in `plan-trabajo-tab.tsx:10-16` | ❌ Does not match backend schema | **PARTIAL** | Missing 30+ backend fields |
| **Activity Types Catalog** | ❌ Not typed | ❌ Not typed | **MISSING** | No `TTipoActividad` interface |
| **Attachments** | ❌ Not typed | ❌ Not typed | **MISSING** | No `TAdjuntoActividad` interface |
| **API Requests/Responses** | ❌ Not typed | ❌ Not typed | **MISSING** | No request/response interfaces |

**Impact**:
- No type safety for API communication (runtime errors likely)
- Frontend and backend data structures misaligned
- Developers lack autocomplete and type checking
- PLTM-01 requirement failed: "Frontend debe implementar tipado fuerte con TypeScript"

**Code Evidence**:
```typescript
// plan-trabajo-tab.tsx:10-16 - Incomplete local type
interface Actividad {
  id: number
  nombre: string
  fechaPlazo: string
  estado: string
  cantidadIntervenciones: number
}
// MISSING 30+ fields from backend:
// - tipo_actividad, tipo_actividad_info, subactividad, actor
// - fecha_creacion, fecha_realizacion, observaciones
// - responsable_principal, responsables_secundarios
// - es_borrador, origen, demanda, oficio, etc.
```

**Backend Schema** (from `RUNNA API (8).yaml` line 1234):
```yaml
TActividadPlanTrabajo:
  type: object
  properties:
    id: { type: integer }
    plan_trabajo: { type: integer }
    tipo_actividad: { type: integer }
    tipo_actividad_info: { $ref: '#/components/schemas/TTipoActividad' }
    subactividad: { type: string }
    actor: { type: string, enum: [EQUIPO_TECNICO, EQUIPOS_RESIDENCIALES, ...] }
    estado: { type: string, enum: [PENDIENTE, EN_PROGRESO, ...] }
    # ... 30+ more fields
```

---

### 4. Activity State Management

| State | Backend Support | Frontend Display | Frontend Transitions | Status | Gap |
|-------|----------------|------------------|---------------------|--------|-----|
| **PENDIENTE** | ✅ Supported | ⚠️ Display only in `plan-trabajo-tab.tsx` | ❌ No transitions | **PARTIAL** | Read-only, no state change UI |
| **EN_PROGRESO** | ✅ Supported | ⚠️ Display only | ❌ No transitions | **PARTIAL** | Read-only, no state change UI |
| **REALIZADA** | ✅ Supported | ⚠️ Display only | ❌ No transitions | **PARTIAL** | Read-only, no state change UI |
| **CANCELADA** | ✅ Supported | ❌ Not displayed | ❌ No transitions | **MISSING** | No cancel workflow |
| **VENCIDA** | ✅ Supported (auto-computed) | ❌ Not displayed | N/A (auto) | **PARTIAL** | Not shown in UI |

**Impact**:
- Users cannot advance activity states (PENDIENTE → EN_PROGRESO → REALIZADA)
- No cancel workflow for activities
- Overdue activities (VENCIDA) not visually distinguished
- PLTM-01 requirement failed: "Gestión de estados del ciclo de vida de la actividad"

**Code Evidence**:
```typescript
// plan-trabajo-tab.tsx:172-174 - Only displays estado as text
<TableCell>
  <Chip label={actividad.estado} color="success" size="small" />
</TableCell>
// MISSING: State transition buttons, validation, API calls
```

**Backend State Logic** (from API YAML):
```yaml
# Estado can be updated via PATCH /api/actividades/{id}/
# Rules (from PLTM-01 requirements):
# - PENDIENTE → EN_PROGRESO (when work starts)
# - EN_PROGRESO → REALIZADA (when completed, requires fecha_realizacion)
# - Any state → CANCELADA (with motivo_cancelacion)
# - VENCIDA is auto-set when fecha_plazo < today and estado != REALIZADA
```

---

### 5. Responsible User Selection

| Responsibility Type | Backend Support | Frontend Implementation | Status | Gap |
|---------------------|----------------|-------------------------|--------|-----|
| **responsable_principal** | ✅ ForeignKey to Usuario | ❌ Not implemented | **MISSING** | No single-select user dropdown |
| **responsables_secundarios** | ✅ ManyToMany to Usuario | ❌ Not implemented | **MISSING** | No multi-select user component |

**Impact**:
- Cannot assign activities to specific users
- No accountability tracking
- PLTM-01 requirement failed: "Cada actividad debe tener un responsable principal y puede tener responsables secundarios"

**Code Evidence**:
```typescript
// plan-accion-modal.tsx - No responsable fields in any tab
// MISSING: User selection components for:
// - responsable_principal (required, single select)
// - responsables_secundarios (optional, multi select)
```

**Backend Schema**:
```yaml
TActividadPlanTrabajo:
  properties:
    responsable_principal:
      type: integer
      description: "ID del usuario responsable principal (requerido)"
    responsables_secundarios:
      type: array
      items: { type: integer }
      description: "IDs de usuarios responsables secundarios (opcional)"
    responsable_principal_info:
      $ref: '#/components/schemas/TUsuario'
    responsables_secundarios_info:
      type: array
      items: { $ref: '#/components/schemas/TUsuario' }
```

---

### 6. Multiple Attachments Management

| Attachment Type | Backend Support | Frontend Implementation | Status | Gap |
|-----------------|----------------|-------------------------|--------|-----|
| **ACTA_COMPROMISO** | ✅ Supported | ❌ Not implemented in Plan Trabajo context | **MISSING** | No file upload UI |
| **EVIDENCIA** | ✅ Supported | ❌ Not implemented | **MISSING** | No file upload UI |
| **INFORME** | ✅ Supported | ❌ Not implemented | **MISSING** | No file upload UI |
| **FOTO** | ✅ Supported | ❌ Not implemented | **MISSING** | No file upload UI |
| **OTRO** | ✅ Supported | ❌ Not implemented | **MISSING** | No file upload UI |
| **Upload Component** | ✅ API ready | ⚠️ Exists in `RegistrarActividadModal.tsx` (Demanda context) | **PARTIAL** | Needs adaptation |

**Impact**:
- Cannot attach evidence documents to activities
- No proof of completion or supporting materials
- PLTM-01 requirement failed: "Gestión de múltiples adjuntos por actividad con tipificación"

**Code Evidence - Missing in Plan Trabajo**:
```typescript
// plan-accion-modal.tsx - No file upload section in any tab
// MISSING: File upload component with:
// - Drag & drop support
// - tipo_adjunto selection (5 types)
// - Multiple file support
// - Preview and removal
```

**Available Implementation** (can be reused from `RegistrarActividadModal.tsx:236-280`):
```typescript
// File upload handling exists in Demanda context
const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  if (event.target.files) {
    const filesArray = Array.from(event.target.files).map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      uploaded: false,
    }))
    setFiles([...files, ...filesArray])
  }
}
// Can be adapted for Plan Trabajo context with tipo_adjunto selection
```

---

### 7. Activity Detail Modal

| Feature | Backend Data Available | Frontend Display | Status | Gap |
|---------|------------------------|------------------|--------|-----|
| **Basic Info** | ✅ All fields available | ⚠️ Partial in `actividades.tsx` (Evaluación context) | **PARTIAL** | Wrong context, needs Plan Trabajo version |
| **Responsible Users** | ✅ responsable_principal_info, responsables_secundarios_info | ❌ Not displayed | **MISSING** | No user info display |
| **Activity Type Info** | ✅ tipo_actividad_info with full catalog details | ❌ Not displayed | **MISSING** | No type details shown |
| **Attachments List** | ✅ adjuntos[] array | ⚠️ Partial in Evaluación context | **PARTIAL** | Not in Plan Trabajo |
| **State History** | ⚠️ Not in backend | ❌ Not displayed | **NOT SUPPORTED** | Backend limitation |
| **Origin Info** | ✅ origen, demanda, oficio fields | ❌ Not displayed | **MISSING** | No origin tracking display |

**Impact**:
- Users cannot view complete activity details
- No visibility into who is responsible
- Cannot see activity type details or origin
- PLTM-01 requirement partially failed: "Vista detallada de actividad con toda la información relevante"

**Code Evidence**:
```typescript
// actividades.tsx:90-148 - Detail view in Evaluación context
<TableRow>
  <TableCell colSpan={7}>
    <Box sx={{ p: 2 }}>
      <Typography variant="subtitle2">Adjuntos:</Typography>
      {/* Shows adjuntos, but missing: */}
      {/* - responsable_principal_info */}
      {/* - responsables_secundarios_info */}
      {/* - tipo_actividad_info details */}
      {/* - origen, demanda, oficio info */}
    </Box>
  </TableCell>
</TableRow>
```

---

### 8. Activity Edit & Cancel

| Operation | Backend Endpoint | Frontend Implementation | Status | Gap |
|-----------|-----------------|-------------------------|--------|-----|
| **Edit Activity** | `PATCH /api/actividades/{id}/` | ❌ Not implemented | **MISSING** | No edit modal or form |
| **Cancel Activity** | `DELETE /api/actividades/{id}/` (soft delete) | ❌ Not implemented | **MISSING** | No cancel button or workflow |
| **motivo_cancelacion** | ✅ Required field for cancellation | ❌ Not implemented | **MISSING** | No cancellation reason input |

**Impact**:
- Cannot modify activities after creation (typos, changed dates, etc.)
- Cannot cancel activities that are no longer needed
- PLTM-01 requirement failed: "Edición de actividades existentes" and "Cancelación con motivo"

**Code Evidence**:
```typescript
// plan-trabajo-tab.tsx - No edit or cancel actions
<TableBody>
  {mockActividades.map((actividad) => (
    <TableRow key={actividad.id}>
      {/* ... display cells */}
      {/* MISSING: */}
      {/* <TableCell> */}
      {/*   <IconButton onClick={() => handleEdit(actividad.id)}> */}
      {/*     <EditIcon /> */}
      {/*   </IconButton> */}
      {/*   <IconButton onClick={() => handleCancel(actividad.id)}> */}
      {/*     <CancelIcon /> */}
      {/*   </IconButton> */}
      {/* </TableCell> */}
    </TableRow>
  ))}
</TableBody>
```

---

### 9. Draft Mode & Validation

| Feature | Backend Support | Frontend Implementation | Status | Gap |
|---------|----------------|-------------------------|--------|-----|
| **es_borrador Flag** | ✅ Boolean field | ❌ Not implemented | **MISSING** | No draft save functionality |
| **Save Draft Button** | ✅ API accepts partial data when es_borrador=true | ❌ Not implemented | **MISSING** | No "Save as Draft" option |
| **Draft Validation** | ✅ Less strict validation in backend | ❌ No validation logic | **MISSING** | No separate validation for drafts |
| **Draft Visual Indicator** | ✅ Data available | ❌ Not displayed | **MISSING** | No visual distinction in list |

**Impact**:
- Users must complete all fields or lose data
- Cannot save partial progress
- PLTM-01 requirement failed: "Guardar actividades como borrador para completar más tarde"

**Code Evidence**:
```typescript
// plan-accion-modal.tsx - Only one submit action (save complete)
<Button type="submit" variant="contained">
  Registrar
</Button>
// MISSING:
// <Button onClick={handleSaveDraft} variant="outlined">
//   Guardar como Borrador
// </Button>
```

**Backend Support** (from API schema):
```yaml
TActividadPlanTrabajo:
  properties:
    es_borrador:
      type: boolean
      description: "Indica si la actividad está en borrador (validación parcial)"
    # When es_borrador=true, only tipo_actividad and actor are required
    # When es_borrador=false, all required fields must be present
```

---

### 10. Filters, Search & Pagination

| Feature | Backend Support | Frontend Implementation | Status | Gap |
|---------|----------------|-------------------------|--------|-----|
| **Filter by Estado** | ✅ `?estado=PENDIENTE` | ❌ Not implemented | **MISSING** | No filter UI |
| **Filter by Actor** | ✅ `?actor=EQUIPO_TECNICO` | ❌ Not implemented | **MISSING** | No filter UI |
| **Filter by Responsable** | ✅ `?responsable_principal={id}` | ❌ Not implemented | **MISSING** | No filter UI |
| **Search by Subactividad** | ✅ `?search={query}` | ❌ Not implemented | **MISSING** | No search input |
| **Pagination** | ✅ `?page=1&page_size=20` | ❌ Not implemented | **MISSING** | Shows all results (no pagination) |
| **Ordering** | ✅ `?ordering=-fecha_plazo` | ❌ Not implemented | **MISSING** | Fixed order |

**Impact**:
- Cannot find specific activities in large lists
- Poor performance with many activities
- No user control over data view
- PLTM-01 requirement failed: "Filtros por estado, actor y responsable" and "Búsqueda por nombre/descripción"

**Code Evidence**:
```typescript
// plan-trabajo-tab.tsx - No filters or pagination
const mockActividades: Actividad[] = [ /* hardcoded array */ ]
// Displays all activities without any filtering

// MISSING:
// - Filter dropdowns for estado, actor, responsable
// - Search input for subactividad
// - Pagination component
// - API calls with query parameters
```

---

### 11. Activity Types Catalog Integration

| Feature | Backend Support | Frontend Implementation | Status | Gap |
|---------|----------------|-------------------------|--------|-----|
| **Load Activity Types** | ✅ `GET /api/actividad-tipo/?actor={actor}&activo=true` | ❌ Not implemented | **MISSING** | No catalog API call |
| **Dynamic Dropdown** | ✅ Filtered by actor | ❌ Hardcoded or non-functional | **MISSING** | No dynamic select component |
| **tipo_actividad_info** | ✅ Full catalog object returned | ❌ Not used | **MISSING** | No display of catalog details |

**Impact**:
- Activity types are not dynamically loaded
- Cannot add new activity types without code changes
- Catalog filtering by actor not working
- PLTM-01 requirement failed: "Catálogo de tipos de actividad filtrado por actor"

**Code Evidence**:
```typescript
// plan-accion-modal.tsx - No tipo_actividad selection component
// MISSING:
// const [tiposActividad, setTiposActividad] = useState<TTipoActividad[]>([])
// useEffect(() => {
//   fetch(`/api/actividad-tipo/?actor=${actor}&activo=true`)
//     .then(res => res.json())
//     .then(data => setTiposActividad(data.results))
// }, [actor])
```

**Backend Catalog Endpoint** (from API YAML):
```yaml
/api/actividad-tipo/:
  get:
    summary: "Listar tipos de actividad"
    parameters:
      - name: actor
        in: query
        schema: { type: string, enum: [EQUIPO_TECNICO, ...] }
      - name: activo
        in: query
        schema: { type: boolean }
    responses:
      200:
        content:
          application/json:
            schema:
              type: object
              properties:
                results:
                  type: array
                  items: { $ref: '#/components/schemas/TTipoActividad' }
```

---

### 12. Auto-creation from Demanda/Oficio

| Feature | Backend Support | Frontend Display | Status | Gap |
|---------|----------------|------------------|--------|-----|
| **origen Field** | ✅ Enum: MANUAL, DEMANDA_PI, DEMANDA_OFICIO, OFICIO | ❌ Not displayed | **MISSING** | No origin indicator |
| **demanda Reference** | ✅ ForeignKey when origen=DEMANDA_* | ❌ Not displayed | **MISSING** | No link to source Demanda |
| **oficio Reference** | ✅ ForeignKey when origen=OFICIO | ❌ Not displayed | **MISSING** | No link to source Oficio |
| **Auto-creation Logic** | ⚠️ Backend creates, frontend must display | ❌ Not handled | **PARTIAL** | Activities appear but origin unclear |

**Impact**:
- Users don't know which activities were auto-created vs manually added
- Cannot navigate back to source Demanda or Oficio
- PLTM-01 requirement partially failed: "Diferenciación visual de actividades creadas automáticamente"

**Code Evidence**:
```typescript
// plan-trabajo-tab.tsx - No origen or demanda/oficio display
interface Actividad {
  // MISSING:
  // origen: 'MANUAL' | 'DEMANDA_PI' | 'DEMANDA_OFICIO' | 'OFICIO'
  // demanda?: number
  // oficio?: number
  // demanda_info?: { /* ... */ }
  // oficio_info?: { /* ... */ }
}
```

---

### 13. Indicators & Metadata Display

| Indicator | Backend Computation | Frontend Display | Status | Gap |
|-----------|---------------------|------------------|--------|-----|
| **cantidad_intervenciones** | ✅ Auto-computed | ⚠️ Displayed in mock data | **PARTIAL** | Not loaded from API |
| **dias_hasta_vencimiento** | ✅ Computed field | ❌ Not displayed | **MISSING** | No days-remaining indicator |
| **es_vencida** | ✅ Boolean (fecha_plazo < today && estado != REALIZADA) | ❌ Not displayed | **MISSING** | No overdue indicator |
| **Overdue Visual Warning** | N/A | ❌ Not implemented | **MISSING** | No red badge or alert |

**Impact**:
- Users cannot see how many interventions an activity has
- No visibility into approaching deadlines
- Overdue activities not visually highlighted
- PLTM-01 requirement failed: "Indicadores de vencimiento y progreso"

**Code Evidence**:
```typescript
// plan-trabajo-tab.tsx:172 - Shows cantidad_intervenciones from mock data
<TableCell>{actividad.cantidadIntervenciones}</TableCell>
// But this is hardcoded, not from API

// MISSING:
// - dias_hasta_vencimiento calculation and display
// - Visual warning for es_vencida activities
// - Color coding (green: >7 days, yellow: 3-7 days, red: <3 days or overdue)
```

---

### 14. Form Validation

| Validation Rule | Backend Enforcement | Frontend Validation | Status | Gap |
|-----------------|---------------------|---------------------|--------|-----|
| **Required Fields** | ✅ tipo_actividad, actor, fecha_plazo (when not draft) | ❌ No validation | **MISSING** | No client-side validation |
| **Date Format** | ✅ YYYY-MM-DD | ❌ No format validation | **MISSING** | No date picker validation |
| **Actor-specific Fields** | ✅ Different required fields per actor | ❌ No conditional validation | **MISSING** | All tabs have same validation |
| **Draft vs Final** | ✅ Less strict when es_borrador=true | ❌ No conditional validation | **MISSING** | Same validation for draft/final |
| **File Size Limits** | ✅ Max 10MB per file | ❌ No client check | **MISSING** | Large files sent to server |

**Impact**:
- Users discover validation errors after submission (poor UX)
- Invalid data sent to backend (wasted network requests)
- No guidance on required fields
- PLTM-01 requirement failed: "Validación de formularios antes del envío"

**Code Evidence**:
```typescript
// plan-accion-modal.tsx - No validation schema
const handleSubmit = (event: React.FormEvent) => {
  event.preventDefault()
  // MISSING:
  // - Zod schema validation
  // - Required field checks
  // - Date format validation
  // - Actor-specific field validation
  // Direct submission without validation
}
```

---

### 15. Error Handling & User Feedback

| Scenario | Backend Response | Frontend Handling | Status | Gap |
|----------|------------------|-------------------|--------|-----|
| **API Error (4xx/5xx)** | ✅ Returns error details | ❌ No error display | **MISSING** | No error messages shown |
| **Validation Error (400)** | ✅ Returns field-level errors | ❌ No field error highlighting | **MISSING** | No inline error messages |
| **Success Confirmation** | ✅ Returns 201 Created | ❌ No success message | **MISSING** | No confirmation feedback |
| **Loading State** | N/A | ❌ No loading indicators | **MISSING** | No spinners or disabled states |
| **Network Timeout** | N/A | ❌ No timeout handling | **MISSING** | Indefinite wait |

**Impact**:
- Users don't know if operations succeeded or failed
- No guidance on fixing validation errors
- Poor user experience during slow operations
- PLTM-01 requirement failed: "Retroalimentación clara al usuario sobre el estado de las operaciones"

**Code Evidence**:
```typescript
// plan-accion-modal.tsx - No error handling
const handleSubmit = async (event: React.FormEvent) => {
  event.preventDefault()
  // MISSING:
  // try {
  //   const response = await actividadService.create(formData)
  //   showSuccess("Actividad creada exitosamente")
  //   onClose()
  // } catch (error) {
  //   if (error.status === 400) {
  //     showFieldErrors(error.data)
  //   } else {
  //     showError("Error al crear actividad")
  //   }
  // }
}
```

---

## Priority Matrix

### P0 - Blocker (Must implement first)
1. **US-FE-01: Type System & API Integration Layer** → Foundation for all other work
2. **US-FE-03: Four Actor Tabs** → Core requirement, blocks activity creation

### P1 - Critical (High impact, user-facing)
3. **US-FE-05: Activity List with Real Data** → Replaces mock data, enables core workflow
4. **US-FE-07: Activity State Management** → Core lifecycle functionality
5. **US-FE-04: Responsible Users Selection** → Required for accountability

### P2 - Important (Expected features)
6. **US-FE-02: Activity Types Catalog** → Dynamic data, better UX
7. **US-FE-06: Activity Detail Modal** → Information access
8. **US-FE-09: Activity Edit & Cancel** → Data management

### P3 - Nice to Have (Enhanced functionality)
9. **US-FE-08: Multiple Attachments** → Evidence management
10. **US-FE-10: Draft Mode & Validation** → Improved UX
11. **US-FE-11: Indicators & Metadata** → Enhanced visibility

---

## Implementation Complexity Assessment

| User Story | Complexity | Risk | Dependencies | Rationale |
|-----------|-----------|------|--------------|-----------|
| US-FE-01 | **Low** | Low | None | Type definitions and service layer, no UI |
| US-FE-02 | **Low** | Low | US-FE-01 | Simple dropdown component with API call |
| US-FE-03 | **Medium** | Medium | US-FE-01, US-FE-02 | 4 forms with different fields, validation logic |
| US-FE-04 | **Medium** | Low | US-FE-01 | Autocomplete components, needs user API |
| US-FE-05 | **Medium** | Low | US-FE-01 | Table with filters, API integration |
| US-FE-06 | **Low** | Low | US-FE-01, US-FE-05 | Read-only modal, display existing data |
| US-FE-07 | **Medium** | Medium | US-FE-05 | State transition logic, validation, UI updates |
| US-FE-08 | **High** | Medium | US-FE-01, US-FE-05 | File upload, multiple types, existing reference code |
| US-FE-09 | **High** | High | US-FE-03, US-FE-05 | Edit modal, validation, cancel workflow |
| US-FE-10 | **Medium** | Low | US-FE-03 | Draft flag logic, separate validation |
| US-FE-11 | **Low** | Low | US-FE-05 | Display computed fields, visual indicators |

**Risk Factors:**
- **Medium Risk**: State management (US-FE-07), Attachments (US-FE-08), Four tabs (US-FE-03)
- **High Risk**: Edit & Cancel (US-FE-09) due to data integrity concerns
- **Low Risk**: Most others due to existing patterns in codebase

---

## Testing Coverage Gaps

| Test Type | Current Coverage | Required Coverage | Gap |
|-----------|------------------|-------------------|-----|
| **Unit Tests** | ❌ None for Plan Trabajo components | ✅ All service functions, utility functions | **100% gap** |
| **Integration Tests** | ❌ None | ✅ API service layer, component interactions | **100% gap** |
| **E2E Tests** | ❌ None | ✅ Critical flows (create, edit, state change) | **100% gap** |
| **Accessibility Tests** | ❌ None | ✅ WCAG 2.1 AA compliance | **100% gap** |

**Testing Requirements from PLTM-01:**
- Unit tests for all service layer functions
- Integration tests for API communication
- E2E tests for user workflows
- Accessibility validation

---

## Performance Considerations

| Concern | Current State | Risk | Mitigation Strategy |
|---------|---------------|------|---------------------|
| **Large Activity Lists** | No pagination, loads all | **HIGH** | Implement pagination (20 per page) |
| **Attachment Upload** | No chunking | **MEDIUM** | Use existing pattern from RegistrarActividadModal |
| **Activity Types Loading** | Not implemented | **LOW** | Cache catalog data, reload on actor change |
| **State Transitions** | Not implemented | **LOW** | Optimistic UI updates with rollback |

---

## Security Considerations

| Concern | Current State | Risk | Mitigation Strategy |
|---------|---------------|------|---------------------|
| **File Upload Validation** | Not implemented | **HIGH** | Validate file types, size limits (10MB) |
| **CSRF Protection** | ⚠️ Django provides, needs frontend token | **MEDIUM** | Include CSRF token in all POST/PATCH/DELETE |
| **Authorization** | ⚠️ Backend enforces, frontend must respect | **MEDIUM** | Disable actions based on user permissions |
| **XSS in Activity Data** | ⚠️ Risk if user input not sanitized | **MEDIUM** | Sanitize all user-generated content |

---

## Reusable Code Opportunities

### From `RegistrarActividadModal.tsx` (Demanda Context)
**Lines 95-127**: API submission logic with FormData
**Lines 236-280**: File upload handling with preview
**Lines 150-220**: Form structure with validation
→ **Can be adapted** for Plan Trabajo context with minimal changes

### From `actividades.tsx` (Evaluación Context)
**Lines 90-148**: Expandable row detail view
**Lines 60-85**: Attachment display logic
→ **Can be reused** for Plan Trabajo detail modal

### From Existing Components
- Date picker components
- User selection dropdowns
- MUI table patterns
- Form validation schemas

---

## Migration Path from Mock to Real Data

### Phase 1: Foundation (Week 1)
1. Create TypeScript types matching backend schema
2. Create API service layer
3. Test service layer independently

### Phase 2: Core Integration (Week 2)
4. Replace mock data with API calls in `plan-trabajo-tab.tsx`
5. Update modal to submit real data
6. Implement 4th actor tab

### Phase 3: Advanced Features (Week 3)
7. Add filters, pagination, search
8. Implement state management
9. Add attachments, edit, draft mode

**Critical Success Factors:**
- ✅ Backend API is stable and documented
- ✅ Existing code patterns can be reused
- ✅ TypeScript will catch type mismatches early
- ⚠️ User testing needed for UX validation
- ⚠️ Performance testing with large datasets

---

## Conclusion

### Summary of Gaps
- **15 critical missing features** across 11 user stories
- **43 hours** of development work estimated
- **3-week sprint plan** recommended
- **P0 blocker**: Type system and API integration must be completed first
- **Highest risk**: Edit & Cancel functionality due to data integrity

### Readiness Assessment
✅ **Ready**: Backend API fully implemented and documented
✅ **Ready**: Existing code patterns available for reuse
✅ **Ready**: Frontend framework (React, MUI) already in use
⚠️ **Needs Work**: No type definitions, no API integration
⚠️ **Needs Work**: Missing 4th actor tab (Legal)
❌ **Critical Gap**: No real data, entirely mock-based currently

### Recommendation
**Proceed with implementation following the 3-sprint plan in the Implementation Workflow document.** Begin immediately with US-FE-01 (Type System & API Integration Layer) as it is the P0 blocker for all other work.

---

**Document Version**: 1.0
**Last Updated**: 2025-10-19
**Next Review**: After US-FE-01 completion
