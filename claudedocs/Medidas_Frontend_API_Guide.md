# Medidas de Protección - Frontend API Integration Guide

## Overview

This guide documents how the frontend at `src/app/(runna)/legajo/[id]/medida/[medidaId]/` should interact with the Medidas API based on the current `etapa_actual.estado` of each medida.

The workflow follows a state machine pattern where each estado determines which endpoints are available and which UI components should be rendered.

---

## Estado Workflow Diagram

```
MPE (Medida de Protección Excepcional) - Full Workflow:

Estado 1: PENDIENTE_REGISTRO_INTERVENCION
    ↓ (Equipo Técnico registers intervention)
Estado 2: PENDIENTE_APROBACION_REGISTRO
    ↓ (Jefe Zonal approves)           ↺ (Jefe Zonal rejects - stays in Estado 2)
Estado 3: PENDIENTE_NOTA_AVAL
    ↓ (Director approves)              ↩ (Director observes - back to Estado 2)
Estado 4: PENDIENTE_INFORME_JURIDICO
    ↓ (Equipo Legal sends report)
Estado 5: PENDIENTE_RATIFICACION_JUDICIAL
    ↓ (Court decision recorded)
Final: RATIFICADA or NO_RATIFICADA

MPI (Medida de Protección Integral) - Shortened Workflow:
Estado 1 → Estado 2 → [COMPLETE]
(No estados 3, 4, 5)

MPJ (Medida de Protección Judicial) - PLTM-driven:
(Different workflow rules, driven by PLTM system)
```

---

## Complete Endpoint Matrix

### Estado 1: PENDIENTE_REGISTRO_INTERVENCION

**Description**: Medida created, waiting for first intervention registration

#### Available GET Endpoints
| Endpoint | Description | Response |
|----------|-------------|----------|
| `GET /api/medidas/{id}/` | Retrieve medida details | `{ id, numero_medida, tipo_medida, etapa_actual: { estado: "PENDIENTE_REGISTRO_INTERVENCION" } }` |

#### Available POST Endpoints
| Endpoint | Action | Who Can Execute | Payload | Result |
|----------|--------|-----------------|---------|--------|
| `POST /api/medidas/{medida_id}/intervenciones/` | Register first intervention (MED-02) | Equipo Técnico | `{ fecha, modalidad, descripcion_situacion, descripcion_intervencion, profesionales[], adjuntos[] }` | Creates intervention in "BORRADOR" status |
| `PATCH /api/medidas/{medida_id}/intervenciones/{id}/enviar/` | Send intervention for approval | Equipo Técnico | - | Changes intervention.estado to "ENVIADO", transitions medida to Estado 2 |

#### Frontend UI Components
- ✅ Show medida details (numero_medida, tipo_medida, juzgado, etc.) - **readonly**
- ✅ Show "Registrar Intervención" button (if user is Equipo Técnico)
- ❌ Hide nota aval, informe jurídico, ratificación sections

---

### Estado 2: PENDIENTE_APROBACION_REGISTRO

**Description**: Intervention sent, waiting for Jefe Zonal approval/rejection

#### Available GET Endpoints
| Endpoint | Description | Response |
|----------|-------------|----------|
| `GET /api/medidas/{id}/` | Retrieve medida details | `{ ..., etapa_actual: { estado: "PENDIENTE_APROBACION_REGISTRO" } }` |
| `GET /api/medidas/{medida_id}/intervenciones/` | List all interventions | `[{ id, fecha, estado: "ENVIADO"\|"RECHAZADO"\|"APROBADO", ... }]` |
| `GET /api/medidas/{medida_id}/intervenciones/{id}/` | Get specific intervention | `{ id, descripcion_situacion, adjuntos[], estado }` |

#### Available POST Endpoints
| Endpoint | Action | Who Can Execute | Payload | Result |
|----------|--------|-----------------|---------|--------|
| `POST /api/medidas/{medida_id}/intervenciones/{id}/aprobar/` | Approve intervention | Jefe Zonal | - | Transitions to Estado 3 (PENDIENTE_NOTA_AVAL) |
| `POST /api/medidas/{medida_id}/intervenciones/{id}/rechazar/` | Reject intervention | Jefe Zonal | `{ motivo_rechazo: string }` | intervention.estado = "RECHAZADO", medida stays in Estado 2 |
| `POST /api/medidas/{medida_id}/intervenciones/` | Create new intervention (if previous rejected) | Equipo Técnico | Same as Estado 1 | Creates new intervention in "BORRADOR" |

#### Frontend UI Components
- ✅ Show medida details - **readonly**
- ✅ Show intervention details with status badge ("ENVIADO", "RECHAZADO", "APROBADO")
- ✅ If user is **Jefe Zonal** AND intervention.estado === "ENVIADO":
  - Show "Aprobar Intervención" button
  - Show "Rechazar Intervención" button with motivo_rechazo textarea
- ✅ If intervention.estado === "RECHAZADO":
  - Show rejection reason
  - Show "Crear Nueva Intervención" button (if user is Equipo Técnico)
- ❌ Hide nota aval, informe jurídico, ratificación sections

**Special Case - MPI**: If `tipo_medida === "MPI"` and intervention is approved, this is the **final estado**. Show completion status, no further workflow.

---

### Estado 3: PENDIENTE_NOTA_AVAL

**Description**: Intervention approved, waiting for Director's nota de aval

#### Available GET Endpoints
| Endpoint | Description | Response |
|----------|-------------|----------|
| `GET /api/medidas/{id}/` | Retrieve medida details | `{ ..., etapa_actual: { estado: "PENDIENTE_NOTA_AVAL" } }` |
| `GET /api/medidas/{id}/intervenciones/` | View approved intervention | Intervention with estado: "APROBADO" (readonly) |
| `GET /api/medidas/{id}/nota-aval/` | Get nota aval if exists | `{ decision, comentarios, adjuntos[] }` or 404 |

#### Available POST Endpoints
| Endpoint | Action | Who Can Execute | Payload | Result |
|----------|--------|-----------------|---------|--------|
| `POST /api/medidas/{id_medida}/nota-aval/` | Create Director's approval note (MED-03) | Director | `{ decision: "APROBADO"\|"OBSERVADO", comentarios: string, adjuntos: File[] }` | If "APROBADO": → Estado 4. If "OBSERVADO": → Estado 2 (backward) |

#### Frontend UI Components
- ✅ Show medida and intervention details - **readonly**
- ✅ If user is **Director**:
  - Show "Nota de Aval del Director" form
  - Radio buttons: "APROBADO" / "OBSERVADO"
  - Textarea for comentarios (required)
  - File upload for adjuntos (at least 1 required)
  - Submit button
- ❌ Hide informe jurídico and ratificación sections

**Backward Transition**: If Director selects "OBSERVADO", medida returns to Estado 2. Frontend must show this in timeline and alert Equipo Técnico to revise.

---

### Estado 4: PENDIENTE_INFORME_JURIDICO

**Description**: Director approved, waiting for Equipo Legal's juridical report

#### Available GET Endpoints
| Endpoint | Description | Response |
|----------|-------------|----------|
| `GET /api/medidas/{id}/` | Retrieve medida details | `{ ..., etapa_actual: { estado: "PENDIENTE_INFORME_JURIDICO" } }` |
| `GET /api/medidas/{id}/intervenciones/` | View intervention | readonly |
| `GET /api/medidas/{id}/nota-aval/` | View Director's approval | readonly |
| `GET /api/medidas/{id}/informe-juridico/` | Get juridical report if exists | `{ comentarios, estado: "BORRADOR"\|"ENVIADO", adjuntos: [{ tipo: "INFORME"\|"ACUSE" }] }` or 404 |

#### Available POST Endpoints
| Endpoint | Action | Who Can Execute | Payload | Result |
|----------|--------|-----------------|---------|--------|
| `POST /api/medidas/{id_medida}/informe-juridico/` | Create juridical report (MED-04) | Equipo Legal | `{ comentarios: string, adjuntos: [{ tipo: "INFORME", archivo }, { tipo: "ACUSE", archivo }] }` | Creates TInformeJuridico with estado: "BORRADOR" |
| `POST /api/medidas/{id_medida}/informe-juridico/adjuntos/` | Add additional attachments | Equipo Legal | `{ tipo: "INFORME"\|"ACUSE", archivo: File }` | Adds adjunto to existing report |
| `POST /api/medidas/{id_medida}/informe-juridico/enviar/` | Send report to court | Equipo Legal | - | Changes estado to "ENVIADO", transitions medida to Estado 5 |

#### Frontend UI Components
- ✅ Show timeline view: intervention → nota aval - **all readonly**
- ✅ If user is **Equipo Legal**:
  - If no informe exists: Show "Crear Informe Jurídico" button
  - If informe.estado === "BORRADOR":
    - Show edit form with comentarios textarea
    - File upload section requiring:
      - ✅ **INFORME** (required, tipo: "INFORME")
      - ✅ **ACUSE DE RECIBO** (required, tipo: "ACUSE")
    - "Enviar a Juzgado" button (disabled until both adjuntos present)
  - If informe.estado === "ENVIADO": Show readonly view
- ❌ Hide ratificación section until Estado 5

**Validation**: Cannot send informe without both INFORME and ACUSE adjuntos. Frontend must validate and show error message.

---

### Estado 5: PENDIENTE_RATIFICACION_JUDICIAL

**Description**: Juridical report sent to court, waiting for judicial ratification

#### Available GET Endpoints
| Endpoint | Description | Response |
|----------|-------------|----------|
| `GET /api/medidas/{id}/` | Retrieve medida details | `{ ..., etapa_actual: { estado: "PENDIENTE_RATIFICACION_JUDICIAL" } }` |
| `GET /api/medidas/{id}/timeline/` | Complete workflow history | All previous steps (intervention, nota aval, informe jurídico) |
| `GET /api/medidas/{id}/ratificacion/` | Get ratification if exists | `{ decision: "RATIFICADA"\|"NO_RATIFICADA", fecha_resolucion, archivo_resolucion_judicial }` or 404 |

#### Available POST Endpoints
| Endpoint | Action | Who Can Execute | Payload | Result |
|----------|--------|-----------------|---------|--------|
| `POST /api/medidas/{medida_id}/ratificacion/` | Record judicial decision (MED-05) | Equipo Legal or Director | `{ decision: "RATIFICADA"\|"NO_RATIFICADA", fecha_resolucion: Date, archivo_resolucion_judicial: File, comentarios?: string }` | **CRITICAL**: Only for tipo_medida === "MPE". Transitions to final estado (RATIFICADA or NO_RATIFICADA) |

#### Frontend UI Components
- ✅ Show complete timeline of all previous steps - **all readonly**
- ✅ Display prominent status: "⏳ Pendiente de Ratificación Judicial"
- ✅ If user has permission (Equipo Legal or Director) AND **tipo_medida === "MPE"**:
  - Show "Registrar Resolución Judicial" form
  - Radio buttons: "RATIFICADA" / "NO RATIFICADA"
  - Date picker for fecha_resolucion (required)
  - File upload for archivo_resolucion_judicial (required)
  - Textarea for comentarios (optional)
  - Submit button
- ❌ If tipo_medida !== "MPE": **Hide ratification section entirely** (MPI and MPJ don't have judicial ratification)

**Critical Validation**: Only MPE medidas go through judicial ratification. MPI medidas are complete after Estado 2. MPJ medidas have different rules.

---

### Final Estados: RATIFICADA / NO_RATIFICADA

**Description**: Workflow complete, medida is in final state

#### Available GET Endpoints
| Endpoint | Description | Response |
|----------|-------------|----------|
| `GET /api/medidas/{id}/` | Retrieve medida with final estado | `{ ..., etapa_actual: { estado: "RATIFICADA"\|"NO_RATIFICADA", fecha_fin } }` |
| `GET /api/medidas/{id}/timeline/` | Complete workflow history | All steps including ratification |

#### No POST Endpoints
- ❌ No further modifications allowed
- Workflow is complete and readonly

#### Frontend UI Components
- ✅ Show complete timeline with all steps
- ✅ Display final status prominently:
  - ✅ "RATIFICADA": Green badge, success message
  - ⚠️ "NO_RATIFICADA": Yellow/orange badge, show judicial rejection details
- ✅ Show fecha_resolucion and download link for archivo_resolucion_judicial
- ✅ Show all historical data - **completely readonly**
- ✅ No action buttons, workflow is closed

---

## Role-Based Access Control Matrix

| Role | Estado 1 Actions | Estado 2 Actions | Estado 3 Actions | Estado 4 Actions | Estado 5 Actions |
|------|------------------|------------------|------------------|------------------|------------------|
| **Equipo Técnico** | ✅ Create intervention<br>✅ Send intervention | ✅ Create new intervention (if rejected) | ❌ None | ❌ None | ❌ None |
| **Jefe Zonal** | ❌ None | ✅ Approve intervention<br>✅ Reject intervention | ❌ None | ❌ None | ❌ None |
| **Director** | ❌ None | ❌ None | ✅ Create nota aval (approve/observe) | ❌ None | ✅ Record ratification* |
| **Equipo Legal** | ❌ None | ❌ None | ❌ None | ✅ Create informe<br>✅ Send to court | ✅ Record ratification* |
| **All Roles** | ✅ View medida | ✅ View medida + intervention | ✅ View all previous steps | ✅ View all previous steps | ✅ View all previous steps |

*Only for MPE tipo_medida

---

## Special Cases

### MPI (Medida de Protección Integral)

**Workflow**: Estado 1 → Estado 2 → **COMPLETE**

**Key Differences**:
- No Estados 3, 4, or 5
- After intervention is approved in Estado 2, medida is considered complete
- Frontend must check: `if (tipo_medida === "MPI" && estado === "PENDIENTE_APROBACION_REGISTRO" && intervention.estado === "APROBADO")` → show completion status
- Hide nota aval, informe jurídico, ratificación sections for MPI

### MPJ (Medida de Protección Judicial)

**Workflow**: PLTM-driven (Plan de Trabajo/Tratamiento)

**Key Differences**:
- Different estado progression rules
- Driven by PLTM system integration
- Frontend needs special handling for MPJ type
- Consult PLTM documentation for specific workflow

### Backward Transitions

#### Rejection at Estado 2 (stays in Estado 2)
```
Jefe Zonal rejects intervention
→ intervention.estado = "RECHAZADO"
→ medida.etapa_actual.estado remains "PENDIENTE_APROBACION_REGISTRO"
→ Frontend shows rejection reason
→ Equipo Técnico must create NEW intervention
```

#### Observation at Estado 3 (goes back to Estado 2)
```
Director observes nota aval
→ POST /api/medidas/{id}/nota-aval/ with decision: "OBSERVADO"
→ medida.etapa_actual.estado changes back to "PENDIENTE_APROBACION_REGISTRO"
→ Frontend shows Director's comentarios
→ Equipo Técnico must revise intervention
```

**No backward transitions from Estado 4 or 5**: Once informe jurídico is sent, workflow cannot go backward.

---

## Frontend Implementation Strategy

### 1. Initial Data Fetch Pattern

```typescript
// In src/app/(runna)/legajo/[id]/medida/[medidaId]/page.tsx

async function getMedidaData(medidaId: string) {
  const medida = await fetch(`/api/medidas/${medidaId}`).then(r => r.json())

  const currentEstado = medida.etapa_actual.estado
  const tipoMedida = medida.tipo_medida
  const userRole = getCurrentUserRole() // From auth context

  return { medida, currentEstado, tipoMedida, userRole }
}
```

### 2. Conditional Component Rendering

```typescript
// Main page component structure

export default async function MedidaPage({ params }: { params: { medidaId: string } }) {
  const { medida, currentEstado, tipoMedida, userRole } = await getMedidaData(params.medidaId)

  return (
    <div>
      {/* Always show medida header */}
      <MedidaHeader medida={medida} />

      {/* Estado-based conditional rendering */}
      {currentEstado === "PENDIENTE_REGISTRO_INTERVENCION" && (
        <RegistroIntervencionView
          medida={medida}
          canCreate={userRole === "Equipo Técnico"}
        />
      )}

      {currentEstado === "PENDIENTE_APROBACION_REGISTRO" && (
        <AprobacionRegistroView
          medida={medida}
          canApprove={userRole === "Jefe Zonal"}
          isMPI={tipoMedida === "MPI"}
        />
      )}

      {currentEstado === "PENDIENTE_NOTA_AVAL" && (
        <NotaAvalView
          medida={medida}
          canCreate={userRole === "Director"}
        />
      )}

      {currentEstado === "PENDIENTE_INFORME_JURIDICO" && (
        <InformeJuridicoView
          medida={medida}
          canCreate={userRole === "Equipo Legal"}
        />
      )}

      {currentEstado === "PENDIENTE_RATIFICACION_JUDICIAL" && tipoMedida === "MPE" && (
        <RatificacionJudicialView
          medida={medida}
          canRecord={["Equipo Legal", "Director"].includes(userRole)}
        />
      )}

      {["RATIFICADA", "NO_RATIFICADA"].includes(currentEstado) && (
        <FinalStatusView medida={medida} />
      )}

      {/* Always show timeline of completed steps */}
      <WorkflowTimeline medida={medida} />
    </div>
  )
}
```

### 3. Validation Before POST Operations

```typescript
// Example: Before submitting intervention

function validateIntervencion(data: IntervencionData, medida: Medida) {
  const errors = []

  // Check estado
  if (medida.etapa_actual.estado !== "PENDIENTE_REGISTRO_INTERVENCION") {
    errors.push("No puede registrar intervención en este estado")
  }

  // Validate required fields
  if (!data.fecha) errors.push("Fecha es requerida")
  if (!data.modalidad) errors.push("Modalidad es requerida")
  if (!data.descripcion_situacion) errors.push("Descripción de situación es requerida")

  // Validate profesionales
  if (!data.profesionales || data.profesionales.length === 0) {
    errors.push("Debe seleccionar al menos un profesional")
  }

  return errors
}

// Use validation before POST
async function submitIntervencion(data: IntervencionData, medidaId: string, medida: Medida) {
  const errors = validateIntervencion(data, medida)

  if (errors.length > 0) {
    showErrors(errors)
    return
  }

  try {
    const response = await fetch(`/api/medidas/${medidaId}/intervenciones/`, {
      method: 'POST',
      body: JSON.stringify(data)
    })

    if (response.ok) {
      // Success handling
      router.refresh() // Refresh to get new estado
    }
  } catch (error) {
    // Error handling
  }
}
```

### 4. Role-Based Button Visibility

```typescript
// Example: Approval buttons in Estado 2

function IntervencionApprovalActions({
  intervention,
  medida,
  userRole
}: Props) {
  const canApprove =
    userRole === "Jefe Zonal" &&
    medida.etapa_actual.estado === "PENDIENTE_APROBACION_REGISTRO" &&
    intervention.estado === "ENVIADO"

  if (!canApprove) return null

  return (
    <div className="flex gap-2">
      <Button
        onClick={() => handleAprobar(intervention.id)}
        variant="success"
      >
        ✅ Aprobar Intervención
      </Button>

      <Button
        onClick={() => openRechazarModal(intervention.id)}
        variant="destructive"
      >
        ❌ Rechazar Intervención
      </Button>
    </div>
  )
}
```

### 5. Handling Backward Transitions

```typescript
// Display rejection/observation messages

function RejectionAlert({ intervention }: Props) {
  if (intervention.estado !== "RECHAZADO") return null

  return (
    <Alert variant="warning">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Intervención Rechazada</AlertTitle>
      <AlertDescription>
        <p>Jefe Zonal: {intervention.motivo_rechazo}</p>
        <p className="mt-2">Debe crear una nueva intervención corrigiendo las observaciones.</p>
      </AlertDescription>
    </Alert>
  )
}

function ObservacionAlert({ notaAval }: Props) {
  if (notaAval.decision !== "OBSERVADO") return null

  return (
    <Alert variant="warning">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Observado por Director</AlertTitle>
      <AlertDescription>
        <p>{notaAval.comentarios}</p>
        <p className="mt-2">La intervención debe ser revisada por el Equipo Técnico.</p>
      </AlertDescription>
    </Alert>
  )
}
```

### 6. Timeline Component for Workflow Visualization

```typescript
function WorkflowTimeline({ medida }: { medida: Medida }) {
  const steps = buildTimelineSteps(medida)

  return (
    <div className="timeline">
      {steps.map((step, index) => (
        <TimelineStep
          key={index}
          step={step}
          isCompleted={step.completed}
          isCurrent={step.current}
          isRejected={step.rejected}
        />
      ))}
    </div>
  )
}

function buildTimelineSteps(medida: Medida): TimelineStep[] {
  const currentEstado = medida.etapa_actual.estado
  const tipoMedida = medida.tipo_medida

  const steps = [
    {
      estado: "PENDIENTE_REGISTRO_INTERVENCION",
      label: "Registro de Medida",
      completed: !["PENDIENTE_REGISTRO_INTERVENCION"].includes(currentEstado)
    },
    {
      estado: "PENDIENTE_APROBACION_REGISTRO",
      label: "Aprobación de Intervención",
      completed: !["PENDIENTE_REGISTRO_INTERVENCION", "PENDIENTE_APROBACION_REGISTRO"].includes(currentEstado)
    },
  ]

  // Only add remaining steps for MPE
  if (tipoMedida === "MPE") {
    steps.push(
      { estado: "PENDIENTE_NOTA_AVAL", label: "Nota de Aval Director", ... },
      { estado: "PENDIENTE_INFORME_JURIDICO", label: "Informe Jurídico", ... },
      { estado: "PENDIENTE_RATIFICACION_JUDICIAL", label: "Ratificación Judicial", ... }
    )
  }

  return steps.map(step => ({
    ...step,
    current: step.estado === currentEstado
  }))
}
```

---

## Error Handling

### Backend Validation Errors

All POST endpoints will return validation errors if:
- Estado requirement not met (e.g., trying to create nota aval in Estado 2)
- User doesn't have required role
- Required fields missing
- Business logic violations (e.g., missing both adjuntos for informe jurídico)

**Frontend handling**:
```typescript
async function handlePost(url: string, data: any) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const error = await response.json()

      if (response.status === 400) {
        // Validation error
        showValidationErrors(error.errors)
      } else if (response.status === 403) {
        // Permission error
        showError("No tiene permisos para realizar esta acción")
      } else if (response.status === 409) {
        // Estado conflict
        showError("El estado de la medida ha cambiado. Refresque la página.")
        router.refresh()
      }

      return null
    }

    return await response.json()
  } catch (error) {
    showError("Error de conexión")
    return null
  }
}
```

---

## Testing Checklist

### Estado 1 Tests
- [ ] Medida details display correctly
- [ ] "Registrar Intervención" button visible for Equipo Técnico
- [ ] Button hidden for other roles
- [ ] POST to create intervention succeeds with valid data
- [ ] Validation errors shown for invalid data
- [ ] After sending intervention, estado transitions to Estado 2

### Estado 2 Tests
- [ ] Intervention details display correctly
- [ ] "Aprobar" and "Rechazar" buttons visible for Jefe Zonal
- [ ] Buttons hidden for other roles
- [ ] POST to approve transitions to Estado 3 (or completes for MPI)
- [ ] POST to reject keeps in Estado 2, shows rejection reason
- [ ] After rejection, "Nueva Intervención" button appears for Equipo Técnico
- [ ] MPI medidas show completion status after approval

### Estado 3 Tests
- [ ] Nota aval form visible for Director
- [ ] Form hidden for other roles
- [ ] POST with "APROBADO" transitions to Estado 4
- [ ] POST with "OBSERVADO" transitions back to Estado 2
- [ ] At least 1 adjunto required
- [ ] Timeline shows observation status when Director observes

### Estado 4 Tests
- [ ] Informe jurídico form visible for Equipo Legal
- [ ] Form hidden for other roles
- [ ] Cannot send informe without both INFORME and ACUSE adjuntos
- [ ] "Enviar" button disabled until both adjuntos present
- [ ] POST to send transitions to Estado 5
- [ ] Timeline shows all previous steps readonly

### Estado 5 Tests
- [ ] Ratificación form visible ONLY for MPE tipo_medida
- [ ] Ratificación form hidden for MPI and MPJ
- [ ] Form visible for authorized roles (Equipo Legal, Director)
- [ ] POST with "RATIFICADA" transitions to final RATIFICADA estado
- [ ] POST with "NO_RATIFICADA" transitions to final NO_RATIFICADA estado
- [ ] Timeline shows all steps including ratification

### Final Estado Tests
- [ ] All data displayed readonly
- [ ] No action buttons visible
- [ ] Final status badge displays correctly (RATIFICADA green, NO_RATIFICADA yellow/orange)
- [ ] Archivo de resolución judicial downloadable
- [ ] Complete timeline visible

---

## Quick Reference

### Key Estado Checks in Frontend

```typescript
// Check if can create intervention
if (medida.etapa_actual.estado === "PENDIENTE_REGISTRO_INTERVENCION" &&
    userRole === "Equipo Técnico") {
  // Show "Registrar Intervención" button
}

// Check if can approve/reject
if (medida.etapa_actual.estado === "PENDIENTE_APROBACION_REGISTRO" &&
    intervention.estado === "ENVIADO" &&
    userRole === "Jefe Zonal") {
  // Show "Aprobar" and "Rechazar" buttons
}

// Check if can create nota aval
if (medida.etapa_actual.estado === "PENDIENTE_NOTA_AVAL" &&
    userRole === "Director") {
  // Show nota aval form
}

// Check if can create informe
if (medida.etapa_actual.estado === "PENDIENTE_INFORME_JURIDICO" &&
    userRole === "Equipo Legal") {
  // Show informe jurídico form
}

// Check if can record ratification (IMPORTANT: Only MPE!)
if (medida.etapa_actual.estado === "PENDIENTE_RATIFICACION_JUDICIAL" &&
    medida.tipo_medida === "MPE" &&
    ["Equipo Legal", "Director"].includes(userRole)) {
  // Show ratificación form
}
```

### Key tipo_medida Checks

```typescript
// MPI: Shortened workflow
if (tipoMedida === "MPI") {
  // Hide estados 3, 4, 5
  // Show completion after Estado 2 approval
}

// MPE: Full workflow
if (tipoMedida === "MPE") {
  // Show all 5 estados
  // Include ratificación judicial
}

// MPJ: PLTM-driven
if (tipoMedida === "MPJ") {
  // Special handling, consult PLTM docs
}
```

---

## Additional Resources

- **MED-01 Story**: Initial medida registration and Estado 1
- **MED-02 Story**: Intervention registration and Estado 2 workflow
- **MED-03 Story**: Nota de aval (Director) and Estado 3 → 4 transition
- **MED-04 Story**: Informe jurídico (Legal) and Estado 4 → 5 transition
- **MED-05 Story**: Ratificación judicial (final estado for MPE)

---

**Document Version**: 1.0
**Last Updated**: Based on MED-01 through MED-05 documentation analysis
**Frontend Path**: `src/app/(runna)/legajo/[id]/medida/[medidaId]/`
