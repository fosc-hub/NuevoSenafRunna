# Vinculos System Fix - Summary

## Date: 2025-10-28

## What Was Changed

### Frontend Changes (COMPLETED)
**File**: `src/app/(runna)/demanda/ui/ConexionesDemandaTab.tsx`

1. **Updated filtering logic** (lines 207-251):
   - Now shows BOTH demanda-type and medida-type vinculos
   - Previously only showed demanda-type vinculos
   - Added comprehensive documentation explaining backend trust relationship

2. **Why the change**:
   - CARGA_OFICIOS workflow creates both demanda and medida vinculos
   - ConexionesDemandaTab should display all vinculos related to a demanda
   - Medidas that belong to demanda 11 should be visible when viewing demanda 11

### Backend Changes (PENDING)
**Prompt created**: `claudedocs/backend-vinculos-medida-demanda-fix.md`

**Required changes**:

1. **Add `demanda_id` filter parameter** (NEW):
   - Filter: `/api/vinculos-legajo/?demanda_id=11`
   - Returns: vinculos where `demanda_destino=11` OR `medida_destino.demanda=11`
   - More explicit than `demanda_destino` for "get all vinculos related to demanda X"

2. **Include `demanda_id` in medida `destino_info`**:
   - Current: `{ tipo: "medida", id: 21, numero: "MED-2025-021" }`
   - Required: `{ tipo: "medida", id: 21, numero: "MED-2025-021", demanda_id: 11 }`
   - Allows frontend to verify medidas belong to correct demanda

3. **Keep existing `demanda_destino` filter**:
   - For exact matches (only direct demanda vinculos)
   - Maintains backward compatibility

## The Problem We Solved

### Issue
The ConexionesDemandaTab component on demanda 11 was receiving medida-type vinculos:
```json
[
  { "id": 6, "tipo_destino": "medida", "destino_info": { "id": 21 } },
  { "id": 5, "tipo_destino": "medida", "destino_info": { "id": 19 } }
]
```

But it was FILTERING THEM OUT because:
- Previous filter only included vinculos where `tipo_destino === "demanda"`
- Medida vinculos were being excluded

### Root Cause
According to LEG-01 story and CARGA_OFICIOS workflow:
- A demanda can have BOTH direct vinculos AND medida vinculos
- Medida vinculos exist when a medida is created from/for a demanda
- The API response doesn't include `demanda_id` in medida `destino_info`
- Frontend cannot verify if medida 21 belongs to demanda 11

### Solution
**Frontend** (completed):
- Now includes medida-type vinculos in display
- Trusts backend `demanda_id` filter (once implemented)
- Documents the trust relationship with clear comments

**Backend** (pending):
- New `demanda_id` filter that includes both vinculos types
- Adds `demanda_id` to medida `destino_info` for verification
- Keeps existing filters for backward compatibility

## Impact on Related Stories

### Direct Impact (will benefit from fix)
- ✅ **REG-01** (Registro de Demanda): ConexionesDemandaTab now shows complete picture
- ✅ **LEG-01** (Vinculación Justificada): Filtering logic aligns with vinculos architecture
- ✅ **MED-01c** (Creación Automática): Medida vinculos now visible in demanda view

### Indirect Impact (uses vinculos system)
- **PLTM-01** (Gestión Grupal): Group activities can use better filtered vinculos
- **LEG-04** (Detalle Legajo): Same filtering approach can be applied
- **PLTM-02** (Acción sobre Actividad): Better group identification via vinculos

## Testing After Backend Fix

### Backend API Tests
1. Test new `demanda_id` filter returns both types
2. Test `demanda_id` is included in medida `destino_info`
3. Test existing `demanda_destino` filter still works

### Frontend Integration Tests
1. Update `ConexionesDemandaTab.tsx` to use `demanda_id` filter
2. Add client-side validation: `vinculo.destino_info.demanda_id === demandaId`
3. Verify only correct medidas appear for each demanda

## Next Steps

1. **Backend developer**: Read `claudedocs/backend-vinculos-medida-demanda-fix.md`
2. **Backend developer**: Implement the two changes (filter + serializer)
3. **Backend developer**: Run tests and verify API response
4. **Frontend developer**: Update to use `demanda_id` filter instead of `demanda_destino`
5. **Frontend developer**: Add client-side validation with `demanda_id` from response
6. **QA**: Test ConexionesDemandaTab shows correct vinculos for different demandas

## Related Files

### Stories
- `stories/LEG-01_Reconocimiento_Existencia_Legajo.md` (vinculos architecture)
- `stories/REG-01_Registro_Demanda.md` (ConexionesDemandaTab usage)
- `stories/PLTM-01_Gestion_Actividades_Plan_Trabajo.md` (group activities via vinculos)
- `stories/MED-01c_Creacion_Automatica.md` (medida creation and vinculos)

### Code
- Frontend: `src/app/(runna)/demanda/ui/ConexionesDemandaTab.tsx`
- Frontend hook: `src/app/(runna)/legajo/[id]/medida/[medidaId]/hooks/useVinculos.ts`
- Backend (to be found): ViewSet for `/api/vinculos-legajo/`
- Backend (to be found): Serializer for `TVinculoLegajoList`

### Documentation
- **Backend prompt**: `claudedocs/backend-vinculos-medida-demanda-fix.md`
- **This summary**: `claudedocs/vinculos-fix-summary.md`
- **API spec**: `stories/RUNNA API (11).yaml` (lines 7800-8040)
