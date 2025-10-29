# Demanda Adjuntos Implementation

## Overview
This implementation fetches full demanda details and routes attachments (adjuntos) to the appropriate tabs in the legajo view:
- **Root-level adjuntos** → `Oficios` tab
- **Evaluaciones adjuntos** → `Documentos` tab

## Files Created

### 1. Types Definition
**File:** `src/app/(runna)/legajo-mesa/types/demanda-api.ts`

Complete TypeScript interfaces for the demanda full detail API response structure, including:
- `DemandaFullDetailResponse` - Main response interface
- `DemandaEvaluacion` - Evaluacion structure with nested adjuntos
- `DemandaAdjunto` - Attachment structure
- Supporting interfaces for personas, localización, institución, etc.

### 2. API Service
**File:** `src/app/(runna)/legajo-mesa/api/demanda-api-service.ts`

Functions:
- `fetchDemandaFullDetail(demandaId)` - Fetch single demanda full detail
- `fetchMultipleDemandaDetails(demandaIds[])` - Fetch multiple demandas in parallel

Endpoint: `GET /api/registro-demanda-form/{id}/full-detail/`

### 3. Adjuntos Processor Utility
**File:** `src/app/(runna)/legajo-mesa/utils/demanda-adjuntos-processor.ts`

Key functions:
- `processAdjuntosToOficios(demandaDetail)` - Convert root adjuntos to oficios format
  - Extracts tipo_oficio, estado_demanda, fecha_oficio_documento
  - Calculates semaforo (verde/amarillo/rojo) based on vencimiento
  - Preserves archivo_url for file access

- `processAdjuntosToDocumentos(demandaDetail)` - Convert evaluacion adjuntos to documentos
  - Extracts file name from URL
  - Adds description with evaluacion context
  - Includes metadata (uploaded by, fecha, tipo)

- `processDemandaAdjuntos(demandasDetails[])` - Process multiple demandas and return both arrays

### 4. Enhanced Legajo Service
**File:** `src/app/(runna)/legajo-mesa/api/legajo-enhanced-service.ts`

**Main function:** `fetchEnhancedLegajoDetail(id, params)`

Workflow:
1. Fetch base legajo detail
2. Extract demanda IDs from `demandas_relacionadas.resultados[]`
3. Fetch full details for each demanda (parallel)
4. Process adjuntos and route to oficios/documentos
5. Merge with existing arrays
6. Return enhanced legajo with all attachments

Error handling: Continues with base legajo data if demanda fetching fails.

## Files Modified

### 1. Oficios Section Component
**File:** `src/app/(runna)/legajo/[id]/medida/[medidaId]/components/legajo/oficios-section.tsx`

**Changes:**
- Added new table column: "Archivo"
- Added new table column: "Acciones" with view/download buttons
- Added utility functions:
  - `extractFileName(url)` - Extract filename from URL
  - `handleViewFile(url)` - Open file in new tab
  - `handleDownloadFile(url, fileName)` - Trigger file download
- Display file icon and name for each oficio
- Show view (eye icon) and download buttons when archivo_url exists
- Show "Sin archivo" / "N/A" when no file attached

### 2. Legajo Detail Component
**File:** `src/app/(runna)/legajo/legajo-detail.tsx`

**Changes:**
- Import `fetchEnhancedLegajoDetail` instead of `fetchLegajoDetail`
- Use enhanced service in `loadLegajoData()` function
- Automatically fetches and merges demanda adjuntos on page load

### 3. Type Definitions
**File:** `src/app/(runna)/legajo-mesa/types/legajo-api.ts`

**Changes to `OficioConSemaforo` interface:**
```typescript
export interface OficioConSemaforo {
  id: number | string              // Allow string IDs for demanda-generated oficios
  tipo: "Ratificación" | "Pedido" | "Orden" | "Otros" | string  // Allow any string
  vencimiento: string
  semaforo: SemaforoEstado
  estado: string
  numero?: string
  archivo_url?: string            // NEW: URL to file attachment
  demanda_id?: number            // NEW: Related demanda ID
  tipo_oficio?: string           // NEW: Type from demanda
}
```

## Data Flow

```
User opens legajo (ID: 21)
  ↓
fetchEnhancedLegajoDetail(21)
  ↓
1. Fetch base legajo → demandas_relacionadas: [{ demanda: { demanda_id: 9 } }]
  ↓
2. Extract demanda IDs → [9]
  ↓
3. Fetch demanda full details in parallel
   GET /api/registro-demanda-form/9/full-detail/
  ↓
4. Process adjuntos:
   ├─ Root adjuntos (demanda.adjuntos[]) → oficios[]
   │  - id: "demanda-9-oficio-0"
   │  - tipo: "Ratificación"
   │  - archivo_url: "http://.../archivo.pdf"
   │  - semaforo: "rojo" (calculated from vencimiento)
   │
   └─ Evaluaciones adjuntos (demanda.evaluaciones[].adjuntos[]) → documentos[]
      - id: "demanda-9-evaluacion-6-doc-0"
      - nombre: "Tablero-de-Comando.pdf"
      - archivo_url: "http://.../archivo.pdf"
      - tipo: "Evaluación"
  ↓
5. Merge with existing legajo.oficios and legajo.documentos
  ↓
6. Display in UI:
   - Oficios tab: Shows 1 oficio with file name and view/download buttons
   - Documentos tab: Shows evaluation documents
```

## UI Features

### Oficios Tab
Now displays:
- **Semáforo** - Status indicator (🟢 verde / 🟡 amarillo / 🔴 rojo)
- **Tipo** - Oficio type (Ratificación, Pedido, Orden, etc.)
- **Número** - Oficio number
- **Estado** - Current status
- **Archivo** - 📄 File icon + filename (e.g., "Tablero-de-Comando.pdf")
- **Fecha Vencimiento** - Due date
- **Días restantes** - Days remaining/overdue
- **Acciones**:
  - 👁️ **Ver** button - Opens file in new tab
  - ⬇️ **Descargar** button - Downloads file

### Documentos Tab
Already had view/download functionality. Now receives:
- Documents from demanda evaluaciones
- Proper metadata (evaluacion description, uploaded by, date)

## Testing Checklist

✅ TypeScript compilation successful (no errors in new files)
✅ Type safety maintained throughout
✅ Error handling for missing demandas
✅ Error handling for missing archivo_url
✅ Parallel API calls for performance
✅ File name extraction from URLs
✅ Semaforo calculation for oficios

## Runtime Testing Required

1. **Open legajo with demandas:**
   - Navigate to `/legajo/21`
   - Should see loading spinner
   - Should fetch demanda details automatically

2. **Check Oficios tab:**
   - Should show oficios from both API and demandas
   - File name should display with icon
   - Click "Ver" - should open file in new tab
   - Click "Descargar" - should download file

3. **Check Documentos tab:**
   - Should show documents from evaluaciones
   - Verify metadata is correct
   - Test view/download functionality

4. **Error scenarios:**
   - Legajo without demandas - should work normally
   - Demanda API failure - should continue with base data
   - Oficio without archivo_url - should show "Sin archivo"

## API Dependencies

This implementation requires:
- `GET /api/legajos/{id}/` - Base legajo detail (existing)
- `GET /api/registro-demanda-form/{id}/full-detail/` - Demanda full detail (must exist)

Expected demanda response structure matches the provided JSON example.

## Performance Considerations

- Multiple demandas fetched in parallel (not sequential)
- Graceful degradation if demanda API fails
- No blocking - base legajo loads first
- Efficient processing with functional utilities

## Future Enhancements

Potential improvements:
1. Add file preview modal (PDF viewer)
2. Add file type icons based on extension
3. Cache demanda details to reduce API calls
4. Add loading indicators for demanda fetching
5. Add error messages if demanda fetch fails
6. Add filters to show only demanda-sourced oficios/documentos
