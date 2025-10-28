# Vínculo Medida Optional Implementation

## Summary

Updated the `CrearVinculoLegajoDialog` component to support **two distinct vínculo workflows**:

1. **Demanda-Only** (Direct Legajo → Demanda connection)
2. **Medida-Required** (CARGA_OFICIOS workflow: Legajo → Medida + Legajo → Demanda)

## Changes Made

### 1. CrearVinculoLegajoDialog.tsx

#### New Workflow Types
```typescript
type VinculoWorkflowType = "demanda-only" | "medida-required"
```

#### New State Management
- Added `workflowType` state to track selected workflow
- Made medida selection conditional based on workflow type

#### Updated Validation Logic
```typescript
// Medida is only required for "medida-required" workflow
if (workflowType === "medida-required" && !selectedMedida) {
  newErrors.medida = "Debe seleccionar una medida del legajo para este tipo de vínculo"
}
```

#### Updated Submit Handler
- **Demanda-Only Workflow**: Creates single vínculo (Legajo → Demanda)
- **Medida-Required Workflow**: Creates two vínculos (Legajo → Medida + Legajo → Demanda)

#### UI Improvements
1. **Workflow Type Selector** (new field at top):
   - **Vinculación Directa**: Direct legajo-demanda connection
   - **Vinculación con Medida**: CARGA_OFICIOS workflow

2. **Conditional Info Alerts**:
   - Shows different guidance based on selected workflow
   - Explains what vínculos will be created

3. **Conditional Medida Selector**:
   - Only shows when `workflowType === "medida-required"`
   - Validation only applies in medida-required workflow

4. **Updated Dialog Title**: "Crear Vínculo de Legajo" (more generic)

### 2. ConexionesDemandaTab.tsx

#### Updated Reload Logic
Changed from `demanda_destino` to `demanda_id` filter to ensure both workflow types are loaded:

```typescript
loadVinculos({
  demanda_id: demandaId,  // ✅ Loads both demanda AND medida vinculos
  activo: true,
})
```

## Technical Rationale

### According to LEG-01 Documentation

**TVinculoLegajo Model** supports three destination types:
- `legajo_destino` (for HERMANOS, MISMO_CASO_JUDICIAL)
- `medida_destino` (for MEDIDAS_RELACIONADAS)
- `demanda_destino` (for direct demanda connections)

**Constraint**: Exactly ONE destination must be populated.

### Two Valid Workflows

1. **Direct Legajo-Demanda** (NEW - Now Supported):
   - User Story: Connect related legajos (hermanos, mismo caso judicial)
   - Vínculo: `legajo_origen` → `demanda_destino`
   - Medida: NOT required

2. **CARGA_OFICIOS** (Existing):
   - User Story: Load oficio into specific medida
   - Vínculos:
     - `legajo_origen` → `medida_destino` (backend signal)
     - `legajo_origen` → `demanda_destino` (UI display)
   - Medida: REQUIRED

## User Experience

### Before Changes
- Medida selection was ALWAYS required
- Error: "Debe seleccionar una medida del legajo"
- Blocked direct legajo-demanda connections

### After Changes
- User selects workflow type first
- Medida field only appears when needed
- Both workflows fully supported

## Backend Integration

### API Calls

**Demanda-Only Workflow**:
```typescript
POST /api/vinculos-legajo/
{
  legajo_origen: 123,
  demanda_destino: 456,  // ✅ Direct connection
  tipo_vinculo: 1,
  justificacion: "..."
}
```

**Medida-Required Workflow**:
```typescript
// Call 1: Legajo → Medida
POST /api/vinculos-legajo/
{
  legajo_origen: 123,
  medida_destino: 789,
  tipo_vinculo: 1,
  justificacion: "[MEDIDA: ...] ..."
}

// Call 2: Legajo → Demanda
POST /api/vinculos-legajo/
{
  legajo_origen: 123,
  demanda_destino: 456,
  tipo_vinculo: 1,
  justificacion: "[DEMANDA→MEDIDA: ...] ..."
}
```

### Backend Filter Support

Uses `demanda_id` filter (backend feature) to retrieve both types:
```typescript
GET /api/vinculos-legajo/?demanda_id=456&activo=true

// Returns:
// - Vínculos where demanda_destino = 456 (direct)
// - Vínculos where medida_destino.demanda = 456 (medida-based)
```

## Testing Checklist

- [ ] Demanda-only workflow creates single vínculo
- [ ] Medida-required workflow creates two vínculos
- [ ] Medida field only shows for medida-required workflow
- [ ] Validation works correctly for both workflows
- [ ] ConexionesDemandaTab displays both vínculo types
- [ ] Reload after creation works for both workflows
- [ ] Info alerts show correct guidance per workflow

## Files Modified

1. `src/app/(runna)/demanda/ui/dialogs/CrearVinculoLegajoDialog.tsx`
2. `src/app/(runna)/demanda/ui/ConexionesDemandaTab.tsx`

## Related Documentation

- `stories/LEG-01_Reconocimiento_Existencia_Legajo.md` (lines 1605-1831)
- `src/app/(runna)/legajo-mesa/types/vinculo-types.ts` (lines 92-110)
