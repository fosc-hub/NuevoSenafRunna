# Medida Documentos Implementation

## Overview
This implementation adds a "Documentos Demanda" tab to the medida view (both MPE and MPJ) that displays the demanda documents that originated the medida.

The system:
1. Extracts the demanda ID from `observaciones` field (e.g., "Medida creada automáticamente desde demanda 6")
2. Fetches the full demanda details including all adjuntos
3. Displays oficios and evaluacion documents in separate tabs

## Files Created

### 1. Demanda ID Extraction Utility
**File:** `src/app/(runna)/legajo-mesa/utils/extract-demanda-from-observaciones.ts`

**Functions:**
- `extractDemandaIdFromObservaciones(observaciones: string)` - Extracts demanda ID from text using regex
  - Matches patterns like: "demanda 6", "DEMANDA 123", etc.
  - Returns `number | null`

- `extractDemandaIdFromMedida(medidaApiData: any)` - Extracts from multiple sources
  - Tries `etapa_actual.observaciones` first
  - Falls back to `historial_etapas[].observaciones`
  - Falls back to top-level `observaciones`
  - Returns `number | null`

**Pattern matching:**
```typescript
// Matches:
"Medida creada automáticamente desde demanda 6"  → 6
"Creada desde demanda 123"                       → 123
"Demanda 456"                                     → 456
```

### 2. Medida Documentos Section Component
**File:** `src/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/medida-documentos-section.tsx`

**Features:**
- Automatically extracts demanda ID from medida observaciones
- Fetches demanda full details
- Processes adjuntos into oficios and documentos
- Two-tab interface:
  - **Oficios Tab** - Root-level adjuntos from demanda
  - **Evaluaciones Tab** - Adjuntos from demanda evaluaciones

**Display:**
- Loading state with CircularProgress
- Info message if no demanda found
- Empty state if no documents
- File count badge in header
- View and download buttons for each file

**Table columns:**

*Oficios Tab:*
| Tipo | Archivo | Estado | Acciones |
|------|---------|--------|----------|
| Ratificación | archivo.pdf | PENDIENTE | 👁️ ⬇️ |

*Evaluaciones Tab:*
| Archivo | Descripción | Tipo | Subido por | Fecha | Acciones |
|---------|-------------|------|------------|-------|----------|
| doc.pdf | Evaluación por... | Evaluación | Usuario | 29/10/2025 | 👁️ ⬇️ |

## Files Modified

### 1. MPETabs Component
**File:** `src/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/mpe-tabs.tsx`

**Changes:**
- Added import for `MedidaDocumentosSection`
- Added 7th tab: "Documentos Demanda"
- Added tab content at index 6
- Component renders when `medidaApiData` is available

**Tab structure:**
```
0. Apertura
1. Innovación
2. Prórroga
3. Plan de trabajo
4. Cese
5. Post cese
6. Documentos Demanda  ← NEW
```

### 2. MPJTabs Component
**File:** `src/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/mpj-tabs.tsx`

**Changes:**
- Added import for `MedidaDocumentosSection`
- Added `medidaApiData` prop to interface
- Added `medidaApiData` to component signature
- Added 4th tab: "Documentos Demanda"
- Added tab content at index 3

**Tab structure:**
```
0. Apertura
1. Proceso
2. Cese
3. Documentos Demanda  ← NEW
```

### 3. Medida Detail Component
**File:** `src/app/(runna)/legajo/[id]/medida/medida-detail.tsx`**

**Changes:**
- Pass `medidaApiData` prop to `MPJTabs` component

## Data Flow

```
User opens medida (ID: 21)
  ↓
medida-detail.tsx loads
  ↓
Fetches medidaApiData from API
  ↓
User clicks "Documentos Demanda" tab
  ↓
MedidaDocumentosSection renders
  ↓
1. Extract demanda ID from observaciones
   "Medida creada automáticamente desde demanda 6" → demandaId = 6
  ↓
2. Fetch demanda full details
   GET /api/registro-demanda-form/6/full-detail/
  ↓
3. Process adjuntos:
   ├─ Root adjuntos (demanda.adjuntos[]) → Oficios Tab
   │  - Tipo from tipo_oficio.nombre
   │  - Estado from estado_demanda
   │  - archivo_url for view/download
   │
   └─ Evaluaciones adjuntos (demanda.evaluaciones[].adjuntos[]) → Evaluaciones Tab
      - File name extracted from URL
      - Description from evaluacion context
      - Metadata (subido_por, fecha, tipo)
  ↓
4. Display in tabs with view/download actions
```

## UI Features

### Header
- 📁 Folder icon
- "Documentos de Demanda {id}"
- File count badge (e.g., "3 archivos")
- Description: "Documentos adjuntos de la demanda que originó esta medida"

### Oficios Tab
- Chip with oficio type (Ratificación, Pedido, etc.)
- File icon + filename
- Estado column
- View (eye icon) and Download buttons
- Shows "Sin archivo" if no attachment

### Evaluaciones Tab
- File icon + filename
- Description with evaluacion context
- Type chip (Evaluación)
- Uploaded by user name
- Formatted date
- View and Download buttons

### States
1. **Loading** - CircularProgress spinner
2. **No Demanda** - Info alert: "No se encontró información de demanda asociada"
3. **No Documents** - Empty state with folder icon: "No hay documentos adjuntos en la demanda X"
4. **Success** - Two-tab interface with documents

### Actions
- **View (👁️)** - Opens file in new browser tab via `window.open(url, "_blank")`
- **Download (⬇️)** - Triggers download via programmatic link click

## Integration with Existing Code

### Reuses Existing Utilities
- `fetchDemandaFullDetail()` from `demanda-api-service.ts`
- `processDemandaAdjuntos()` from `demanda-adjuntos-processor.ts`
- Same file handling as oficios-section in legajo view

### Consistent UI/UX
- Same Material-UI components and styling
- Same table structure as other document sections
- Same icon usage and color scheme
- Same error handling patterns

## Testing Checklist

### Basic Functionality
- [ ] Open medida created from demanda (observaciones contains "demanda X")
- [ ] Navigate to "Documentos Demanda" tab
- [ ] Should show loading spinner
- [ ] Should display demanda ID in header
- [ ] Should show file count badge

### Oficios Tab
- [ ] Switch to Oficios tab
- [ ] Should show root-level adjuntos from demanda
- [ ] File names should be visible
- [ ] Click "Ver" - should open file in new tab
- [ ] Click "Descargar" - should download file

### Evaluaciones Tab
- [ ] Switch to Evaluaciones tab
- [ ] Should show adjuntos from demanda evaluaciones
- [ ] Descriptions should include evaluacion context
- [ ] Click "Ver" - should open file in new tab
- [ ] Click "Descargar" - should download file

### Edge Cases
- [ ] Medida without demanda reference - should show info message
- [ ] Demanda with no adjuntos - should show empty state
- [ ] Demanda API error - should show error message
- [ ] Malformed observaciones - should handle gracefully
- [ ] Both MPE and MPJ medidas - both should work

## Example Data

### Input (Medida API Response)
```json
{
  "id": 21,
  "numero_medida": "MED-2025-021",
  "tipo_medida": "MPE",
  "etapa_actual": {
    "observaciones": "Medida creada automáticamente desde demanda 6"
  }
}
```

### Processing
1. Extract: `demandaId = 6`
2. Fetch: `GET /api/registro-demanda-form/6/full-detail/`
3. Process adjuntos
4. Display in tabs

### Output Display
```
┌─────────────────────────────────────────────────────────┐
│ 📁 Documentos de Demanda 6                    3 archivos│
│ Documentos adjuntos de la demanda que originó esta medida│
├─────────────────────────────────────────────────────────┤
│ [Oficios (1)] [Evaluaciones (2)]                         │
├─────────────────────────────────────────────────────────┤
│ Tipo         │ Archivo      │ Estado  │ Acciones        │
│ Ratificación │ 📄 doc.pdf   │ ADMITIDA│ [👁️] [⬇️]      │
└─────────────────────────────────────────────────────────┘
```

## Performance Considerations

- Demanda full detail fetched only when tab is opened
- Loading state prevents UI blocking
- Error handling allows graceful degradation
- Reuses existing API infrastructure

## Future Enhancements

Potential improvements:
1. Cache demanda details to avoid refetching
2. Add file preview modal (PDF viewer)
3. Add file type icons based on extension
4. Add filters/search for documents
5. Add bulk download option
6. Show demanda link to navigate to demanda detail
