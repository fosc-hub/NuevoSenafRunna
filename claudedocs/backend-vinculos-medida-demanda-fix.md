# Backend Fix: Vinculos API - Include demanda_id in medida destino_info

## Problem

The `/api/vinculos-legajo/` endpoint returns medida-type vinculos without including the demanda_id in the `destino_info` object. This prevents the frontend from verifying if a medida actually belongs to the demanda being viewed.

## Current API Response

```json
{
  "id": 6,
  "legajo_origen": 19,
  "tipo_destino": "medida",
  "destino_info": {
    "tipo": "medida",
    "id": 21,
    "numero": "MED-2025-021",
    "tipo_medida": "MPJ",
    "legajo_numero": "LEG-2025-0019"
    // ❌ Missing: demanda_id field
  }
}
```

## Required Changes

### 1. Update Serializer to Include demanda_id

**Location**: Serializer for `TVinculoLegajoList` (the list serializer)

**Change needed**: In the `destino_info` SerializerMethodField, include the medida's demanda_id when tipo_destino="medida"

**Expected output**:
```json
{
  "id": 6,
  "legajo_origen": 19,
  "tipo_destino": "medida",
  "destino_info": {
    "tipo": "medida",
    "id": 21,
    "numero": "MED-2025-021",
    "tipo_medida": "MPJ",
    "legajo_numero": "LEG-2025-0019",
    "demanda_id": 11  // ✅ ADD THIS - from medida.demanda_id or medida.demanda.id
  }
}
```

### 2. Add demanda_id Filter Parameter (RECOMMENDED)

**Better approach**: Instead of using `demanda_destino` (which is ambiguous), add a new filter parameter `demanda_id` that returns ALL vinculos related to a demanda:

**New filter parameter**: `demanda_id`
- Returns vinculos where `demanda_destino = X` (direct demanda vinculos)
- Returns vinculos where `medida_destino.demanda = X` (medidas belonging to that demanda)

**Benefits**:
- More explicit and clearer intent
- Matches frontend use case: "get all vinculos for demanda X"
- `demanda_destino` remains available for exact filtering (only direct demanda vinculos)

**Implementation**:
```python
# In the ViewSet filter logic, ADD NEW FILTER:
if demanda_id:
    # Direct demanda vinculos
    demanda_filter = Q(demanda_destino_id=demanda_id)

    # Medida vinculos where medida belongs to this demanda
    medida_filter = Q(medida_destino__demanda_id=demanda_id)

    queryset = queryset.filter(demanda_filter | medida_filter)
```

**Filter behavior comparison**:
```python
# demanda_destino=11 (exact match - only direct vinculos)
GET /api/vinculos-legajo/?demanda_destino=11
→ Returns only vinculos where demanda_destino=11

# demanda_id=11 (related vinculos - both direct and medida)
GET /api/vinculos-legajo/?demanda_id=11
→ Returns vinculos where demanda_destino=11 OR medida_destino.demanda=11
```

**Test cases**:
1. Create medida 21 with demanda 11
2. Create vinculo: legajo 19 → medida 21
3. Query: `/api/vinculos-legajo/?demanda_id=11&activo=true`
4. Expected: Should return the vinculo with legajo_origen=19, medida_destino=21
5. Query: `/api/vinculos-legajo/?demanda_id=99&activo=true` (different demanda)
6. Expected: Should NOT return the same vinculo

## Files to Check

Based on Django REST Framework patterns, likely locations:

1. **Serializer**: `infrastructure/serializers/vinculo_serializers.py` or similar
   - Look for `TVinculoLegajoList` or `TVinculoLegajoListSerializer`
   - Find the `get_destino_info()` method
   - Add demanda_id when building medida destino_info

2. **ViewSet**: `infrastructure/views/vinculo_views.py` or similar
   - Look for `TVinculoLegajoViewSet`
   - Find the `filter_queryset()` or `get_queryset()` method
   - Verify demanda_destino filter includes medida JOIN

3. **Model**: `infrastructure/models/vinculo_models.py` or similar
   - Verify relationships: `TVinculoLegajo.medida_destino → TMedida → TMedida.demanda`

## Example Implementation

### Serializer Change

```python
class TVinculoLegajoListSerializer(serializers.ModelSerializer):
    # ... other fields ...

    destino_info = serializers.SerializerMethodField()

    def get_destino_info(self, obj):
        """Build destino_info object based on tipo_destino"""
        if obj.tipo_destino == 'medida' and obj.medida_destino:
            medida = obj.medida_destino
            return {
                'tipo': 'medida',
                'id': medida.id,
                'numero': medida.numero,
                'tipo_medida': medida.tipo_medida.codigo if medida.tipo_medida else None,
                'legajo_numero': medida.legajo.numero if medida.legajo else None,
                'demanda_id': medida.demanda_id,  # ✅ ADD THIS LINE
            }
        elif obj.tipo_destino == 'demanda' and obj.demanda_destino:
            demanda = obj.demanda_destino
            return {
                'tipo': 'demanda',
                'id': demanda.id,
                'objetivo': demanda.objetivo,
                'fecha_ingreso': demanda.fecha_ingreso_senaf,
            }
        # ... handle legajo case ...
```

### ViewSet Filter Implementation

```python
class TVinculoLegajoViewSet(viewsets.ModelViewSet):
    # ... other code ...

    def get_queryset(self):
        queryset = TVinculoLegajo.objects.filter(activo=True)

        # NEW FILTER: demanda_id (returns all vinculos related to demanda)
        demanda_id = self.request.query_params.get('demanda_id')
        if demanda_id:
            queryset = queryset.filter(
                Q(demanda_destino_id=demanda_id) |
                Q(medida_destino__demanda_id=demanda_id)
            )

        # EXISTING FILTER: demanda_destino (exact match - only direct vinculos)
        demanda_destino = self.request.query_params.get('demanda_destino')
        if demanda_destino:
            queryset = queryset.filter(demanda_destino_id=demanda_destino)

        # ... other filters: legajo_origen, tipo_vinculo, tipo_destino, activo ...

        return queryset
```

## Testing

After implementing the changes:

1. **Test API response includes demanda_id**:
   ```bash
   GET /api/vinculos-legajo/?demanda_id=11&activo=true

   # Verify response includes demanda_id in destino_info for medida-type vinculos
   # Example response:
   # {
   #   "tipo_destino": "medida",
   #   "destino_info": {
   #     "tipo": "medida",
   #     "id": 21,
   #     "numero": "MED-2025-021",
   #     "demanda_id": 11  ← Should be present
   #   }
   # }
   ```

2. **Test new demanda_id filter works correctly**:
   ```bash
   # Should return BOTH direct demanda vinculos AND medida vinculos for demanda 11
   GET /api/vinculos-legajo/?demanda_id=11&activo=true

   # Should return different results
   GET /api/vinculos-legajo/?demanda_id=12&activo=true
   ```

3. **Test existing demanda_destino filter still works**:
   ```bash
   # Should return ONLY direct demanda vinculos (not medidas)
   GET /api/vinculos-legajo/?demanda_destino=11&activo=true
   ```

4. **Frontend verification**:
   - Update frontend to use `demanda_id` instead of `demanda_destino`
   - Refresh the Conexiones tab on demanda 11
   - Check browser console logs for filtering decisions
   - Verify only relevant medidas appear (those with demanda_id=11)

## Priority

**Medium-High**: Frontend currently trusts backend filtering without verification. If the backend filter is broken, incorrect medidas may be displayed to users.

## Frontend Update Required

After backend implements the `demanda_id` filter, update the frontend:

**File**: `src/app/(runna)/demanda/ui/ConexionesDemandaTab.tsx`

**Change** (line 200):
```typescript
// OLD - using demanda_destino
loadVinculos({
  demanda_destino: demandaId,
  activo: true,
})

// NEW - using demanda_id
loadVinculos({
  demanda_id: demandaId,  // ✅ Changed parameter name
  activo: true,
})
```

**Additional change**: Update client-side filter to verify demanda_id:
```typescript
// Now we CAN verify medidas belong to this demanda
const includeMedida = isMedidaType && vinculo.destino_info?.demanda_id === demandaId
```

This provides double validation: backend filter + frontend verification.

## Related Stories and Documentation

### Core Stories (Vinculos System)
- **LEG-01** (`stories/LEG-01_Reconocimiento_Existencia_Legajo.md`):
  - Primary story defining vinculos architecture
  - Section 15: Model structure for `TVinculoLegajo` (lines 1582-1831)
  - Defines vinculo types: HERMANOS, MISMO_CASO_JUDICIAL, MEDIDAS_RELACIONADAS, TRANSFERENCIA
  - Justification requirements (min 20 characters)

### Dependent Stories
- **REG-01** (`stories/REG-01_Registro_Demanda.md` and `stories/REG-01_IMPLEMENTATION_MASTER.md`):
  - Uses vinculos to link demandas with legajos during registration
  - ConexionesDemandaTab component displays vinculos for a demanda
  - Section on "Vinculación Justificada" integration

- **LEG-04** (`stories/LEG-04_Detalle_Legajo.md`):
  - Displays vinculos in legajo detail view
  - Shows related legajos, medidas, and demandas

- **LEG-03** (`stories/LEG-03_Buscar_Filtrar_Legajos.md`):
  - Search and filter functionality for legajos
  - May need to search by vinculo relationships

- **MED-01c** (`stories/MED-01c_Creacion_Automatica.md`):
  - Automatic medida creation from demandas
  - Creates vinculos between legajos and medidas

- **PLTM-01** (`stories/PLTM-01_Gestion_Actividades_Plan_Trabajo.md`):
  - Gestión grupal de actividades (group activity management)
  - Uses vinculos to identify hermanos (siblings) for group activities
  - `permite_gestion_grupal` flag depends on vinculo system

- **PLTM-02** (`stories/PLTM-02_Accion_Sobre_Actividad.md`):
  - Actions on activities for groups of vinculated medidas

### API Documentation
- **API Spec**: `stories/RUNNA API (11).yaml` (lines 7800-8040)
  - Endpoint: `/api/vinculos-legajo/`
  - Schema: `TVinculoLegajoList`, `TVinculoLegajoDetail`, `TVinculoLegajoCreate`
  - Available filters documented (note: `demanda_id` needs to be added)

### Frontend Components
- **Main Component**: `src/app/(runna)/demanda/ui/ConexionesDemandaTab.tsx`
  - Lines 207-217: Filtering logic and comments about backend behavior
  - Lines 195-205: API call using `demanda_destino` parameter
  - Lines 459-645: UI for displaying legajo vinculos

- **Hook**: `src/app/(runna)/legajo/[id]/medida/[medidaId]/hooks/useVinculos.ts`
  - Generic hook for loading vinculos with filters
  - Used by multiple components (legajo, medida, demanda)

### Workflow Context: CARGA_OFICIOS
The CARGA_OFICIOS workflow creates both demanda vinculos and medida vinculos:
1. Judicial demanda arrives (oficio judicial)
2. System creates vinculos: Legajo → Demanda (direct)
3. System creates vinculos: Legajo → Medida (for the medida created from demanda)
4. ConexionesDemandaTab should show BOTH types when viewing demanda

This fix ensures the filtering logic correctly returns all related vinculos.
