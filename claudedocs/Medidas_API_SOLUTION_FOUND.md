# 🎯 SOLUTION FOUND: Correct API Endpoints for Etapa-Specific Data

## Critical Discovery

**The backend API ALREADY has the solution implemented!**

You don't need to modify the backend - you just need to use the **correct endpoints** that are already available in `RUNNA API (11).yaml`.

---

## ❌ What You're Currently Doing (WRONG)

### Getting ALL Interventions (Mixed Etapas)

```typescript
// ❌ WRONG: Returns interventions from ALL etapas mixed together
GET /api/medidas/123/intervenciones/

Response: [
  { id: 1, medida: 123, ... }, // Could be from Apertura
  { id: 2, medida: 123, ... }, // Could be from Innovación
  { id: 3, medida: 123, ... }, // Could be from Prórroga
]
// ⚠️ No way to tell which etapa each intervention belongs to!
```

---

## ✅ What You Should Be Doing (RIGHT)

### Getting Etapa-Specific Data with `/etapa/{tipo_etapa}/`

The API provides a **dedicated endpoint** for fetching a specific etapa with ALL its related documents:

```http
GET /api/medidas/{id}/etapa/{tipo_etapa}/

Parameters:
- tipo_etapa: APERTURA | INNOVACION | PRORROGA | CESE | PROCESO | POST_CESE
```

**Example Request**:
```http
GET /api/medidas/123/etapa/APERTURA/
```

**Response Structure** (from RUNNA API (11).yaml line 5775-5801):
```json
{
  "medida": {
    "id": 123,
    "numero_medida": "MPE-2025-0001",
    "tipo_medida": "MPE"
  },
  "etapa": {
    "id": 456,
    "tipo_etapa": "APERTURA",
    "estado_actual": {
      "codigo": "PENDIENTE_NOTA_AVAL",
      "orden": 3,
      "nombre_display": "Pendiente Nota de Aval",
      "responsable_tipo": "DIRECTOR"
    },
    "fecha_inicio": "2025-10-01T10:00:00Z",
    "fecha_fin": null,
    "activa": true,
    "documentos": {
      "intervenciones": [...],      // ← Only APERTURA interventions!
      "notas_aval": [...],           // ← Only APERTURA notas de aval!
      "informes_juridicos": [...],   // ← Only APERTURA informes!
      "ratificaciones": [...]        // ← Only APERTURA ratificaciones!
    }
  }
}
```

---

## Frontend Implementation Solution

### 1. Create Etapa-Specific API Service

```typescript
// src/app/(runna)/legajo/[id]/medida/[medidaId]/api/etapa-detail-api-service.ts

import { get } from '@/app/api/apiService'
import type { TipoEtapa } from '../types/estado-etapa'

/**
 * Etapa Detail Response (from /api/medidas/{id}/etapa/{tipo_etapa}/)
 */
export interface EtapaDetailResponse {
  medida: {
    id: number
    numero_medida: string
    tipo_medida: 'MPE' | 'MPI' | 'MPJ'
  }
  etapa: {
    id: number
    tipo_etapa: TipoEtapa
    estado_actual: {
      codigo: string
      orden: number
      nombre_display: string
      responsable_tipo: string
    }
    fecha_inicio: string
    fecha_fin: string | null
    activa: boolean
    documentos: {
      intervenciones: IntervencionResponse[]
      notas_aval: NotaAvalBasicResponse[]
      informes_juridicos: InformeJuridicoBasicResponse[]
      ratificaciones: RatificacionJudicial[]
    }
  }
}

/**
 * Get detailed information for a specific etapa
 * GET /api/medidas/{id}/etapa/{tipo_etapa}/
 *
 * This endpoint returns the etapa with ALL its related documents
 * (interventions, notas de aval, informes juridicos, ratificaciones)
 *
 * @param medidaId ID of the medida
 * @param tipoEtapa Type of etapa (APERTURA, INNOVACION, PRORROGA, CESE, etc.)
 * @returns Etapa detail with all documents
 */
export const getEtapaDetail = async (
  medidaId: number,
  tipoEtapa: TipoEtapa
): Promise<EtapaDetailResponse> => {
  try {
    console.log(`[EtapaDetailService] Fetching etapa ${tipoEtapa} for medida ${medidaId}`)

    const response = await get<EtapaDetailResponse>(
      `medidas/${medidaId}/etapa/${tipoEtapa}/`
    )

    console.log('[EtapaDetailService] Etapa detail retrieved:', response)

    return response
  } catch (error: any) {
    console.error(`[EtapaDetailService] Error fetching etapa ${tipoEtapa}:`, error)
    console.error('[EtapaDetailService] Error details:', {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
    })
    throw error
  }
}

// Convenience functions for each etapa type
export const getAperturaDetail = (medidaId: number) => getEtapaDetail(medidaId, 'APERTURA')
export const getInnovacionDetail = (medidaId: number) => getEtapaDetail(medidaId, 'INNOVACION')
export const getProrrogaDetail = (medidaId: number) => getEtapaDetail(medidaId, 'PRORROGA')
export const getCeseDetail = (medidaId: number) => getEtapaDetail(medidaId, 'CESE')
export const getPostCeseDetail = (medidaId: number) => getEtapaDetail(medidaId, 'POST_CESE')
export const getProcesoDetail = (medidaId: number) => getEtapaDetail(medidaId, 'PROCESO')
```

### 2. Update Tab Components

**Apertura Tab Example**:

```typescript
// src/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/mpe-tabs/apertura-tab.tsx

import React, { useState, useEffect } from 'react'
import { getAperturaDetail } from '../../../api/etapa-detail-api-service'
import type { EtapaDetailResponse } from '../../../api/etapa-detail-api-service'

export const AperturaTab: React.FC<Props> = ({
  medidaData,
  medidaApiData,
  legajoData
}) => {
  const [etapaDetail, setEtapaDetail] = useState<EtapaDetailResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEtapaDetail = async () => {
      try {
        setIsLoading(true)

        // ✅ CORRECT: Fetch ONLY Apertura etapa with its interventions
        const detail = await getAperturaDetail(medidaData.id)

        setEtapaDetail(detail)
        setError(null)
      } catch (err: any) {
        console.error('Error fetching Apertura detail:', err)
        setError(err.message || 'Failed to load Apertura data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchEtapaDetail()
  }, [medidaData.id])

  if (isLoading) {
    return <CircularProgress />
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>
  }

  if (!etapaDetail) {
    return <Alert severity="info">Etapa Apertura no iniciada</Alert>
  }

  // Extract Apertura-specific data
  const etapaApertura = etapaDetail.etapa
  const intervenciones = etapaDetail.etapa.documentos.intervenciones // ← Only Apertura interventions!
  const notasAval = etapaDetail.etapa.documentos.notas_aval
  const informesJuridicos = etapaDetail.etapa.documentos.informes_juridicos
  const ratificaciones = etapaDetail.etapa.documentos.ratificaciones

  // Current estado for Apertura
  const estadoActual = etapaApertura.estado_actual

  return (
    <UnifiedWorkflowTab
      medidaData={medidaData}
      medidaApiData={medidaApiData}
      legajoData={legajoData}
      workflowPhase="apertura"
      etapaDetail={etapaDetail}              // Pass full etapa detail
      intervenciones={intervenciones}        // Only Apertura interventions
      notasAval={notasAval}                  // Only Apertura notas
      informesJuridicos={informesJuridicos}  // Only Apertura informes
      ratificaciones={ratificaciones}        // Only Apertura ratificaciones
    />
  )
}
```

**Innovación Tab Example**:

```typescript
// src/app/(runna)/legajo/[id]/medida/[medidaId]/components/medida/mpe-tabs/innovacion-tab.tsx

export const InnovacionTab: React.FC<Props> = ({
  medidaData,
  medidaApiData,
  legajoData
}) => {
  const [etapaDetail, setEtapaDetail] = useState<EtapaDetailResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEtapaDetail = async () => {
      try {
        setIsLoading(true)

        // ✅ CORRECT: Fetch ONLY Innovación etapa with its interventions
        const detail = await getInnovacionDetail(medidaData.id)

        setEtapaDetail(detail)
        setError(null)
      } catch (err: any) {
        console.error('Error fetching Innovación detail:', err)

        // If 404, etapa hasn't been created yet
        if (err.response?.status === 404) {
          setEtapaDetail(null)
          setError(null)
        } else {
          setError(err.message || 'Failed to load Innovación data')
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchEtapaDetail()
  }, [medidaData.id])

  // If Innovación etapa doesn't exist yet
  if (!etapaDetail && !isLoading && !error) {
    return (
      <Box>
        <Alert severity="info">
          La etapa de Innovación no ha sido iniciada.
        </Alert>
        <Button
          variant="contained"
          onClick={handleIniciarInnovacion}
          startIcon={<AddIcon />}
        >
          Iniciar Etapa de Innovación
        </Button>
      </Box>
    )
  }

  if (isLoading) {
    return <CircularProgress />
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>
  }

  // Extract Innovación-specific data
  const intervenciones = etapaDetail.etapa.documentos.intervenciones // ← Only Innovación interventions!

  return (
    <UnifiedWorkflowTab
      medidaData={medidaData}
      medidaApiData={medidaApiData}
      legajoData={legajoData}
      workflowPhase="innovacion"
      etapaDetail={etapaDetail}
      intervenciones={intervenciones}
    />
  )

  async function handleIniciarInnovacion() {
    try {
      // Create new Innovación etapa
      await transicionarEtapa(medidaData.id, {
        tipo_etapa: 'INNOVACION',
        observaciones: 'Inicio de etapa de Innovación'
      })

      // Refresh medida data
      router.refresh()
    } catch (error) {
      console.error('Error creating Innovación etapa:', error)
    }
  }
}
```

---

## Key Endpoints Reference

### Get Specific Etapa with ALL Documents

```http
GET /api/medidas/{id}/etapa/{tipo_etapa}/

Where tipo_etapa is:
- APERTURA
- INNOVACION
- PRORROGA
- CESE
- POST_CESE
- PROCESO
```

**Returns**: Complete etapa information with interventions, notas de aval, informes juridicos, and ratificaciones that belong ONLY to that etapa.

### Create New Etapa

```http
POST /api/medidas/{id}/transicionar-etapa/

Body:
{
  "tipo_etapa": "INNOVACION",
  "observaciones": "Motivación de la transición..."
}
```

**Rules** (from RUNNA API line 5844-5850):
- **MPI**: APERTURA → CESE
- **MPE**: APERTURA → INNOVACION/PRORROGA/CESE
          INNOVACION → PRORROGA/CESE
          PRORROGA → CESE
- **MPJ**: APERTURA → PROCESO/CESE
          PROCESO → CESE

### Create Intervention (Stays the Same)

```http
POST /api/medidas/{medida_id}/intervenciones/

Body:
{
  "medida": 123,
  "fecha_intervencion": "2025-01-15",
  "motivo_id": 1,
  "categoria_intervencion_id": 2,
  "intervencion_especifica": "Visita domiciliaria",
  "requiere_informes_ampliatorios": true
}
```

**Important**: The intervention is automatically associated with the **active etapa** (`medida.etapa_actual`) by the backend.

---

## Implementation Checklist

### ✅ Backend Changes Required: **NONE!**

The backend already has all the necessary endpoints. No modifications needed!

### ✅ Frontend Changes Required:

1. **Create new API service** for etapa detail endpoint
   - File: `api/etapa-detail-api-service.ts`
   - Function: `getEtapaDetail(medidaId, tipoEtapa)`

2. **Update all tab components** (apertura, innovacion, prorroga, cese)
   - Use `getEtapaDetail()` instead of `getIntervencionesByMedida()`
   - Extract interventions from `etapaDetail.etapa.documentos.intervenciones`

3. **Update UnifiedWorkflowTab component**
   - Accept `etapaDetail` prop instead of parsing from `medidaApiData.historial_etapas`
   - Use `etapaDetail.etapa.estado_actual` for current estado
   - Use `etapaDetail.etapa.documentos` for all documents

4. **Handle etapa creation** for tabs that don't exist yet
   - Show "Iniciar Etapa" button if GET returns 404
   - Use `POST /api/medidas/{id}/transicionar-etapa/` to create new etapa

---

## Benefits of This Approach

1. ✅ **No Backend Changes Required** - Use existing endpoints
2. ✅ **Clean Separation** - Each tab gets ONLY its etapa's data
3. ✅ **Correct Estado** - Each etapa has its own estado (1-5)
4. ✅ **All Documents Included** - Interventions, notas, informes, ratificaciones
5. ✅ **Type Safety** - Clear API response structure
6. ✅ **Performance** - Single API call gets all data for an etapa

---

## Example: Full Workflow for Apertura Tab

### 1. User Opens Apertura Tab

```typescript
// Tab fetches Apertura etapa detail
const detail = await getAperturaDetail(medidaId)

// Response:
{
  "etapa": {
    "tipo_etapa": "APERTURA",
    "estado_actual": {
      "orden": 3,  // Estado 3: PENDIENTE_NOTA_AVAL
      "nombre_display": "Pendiente Nota de Aval",
      "responsable_tipo": "DIRECTOR"
    },
    "documentos": {
      "intervenciones": [
        { id: 1, estado: "APROBADO", fecha_intervencion: "2025-01-10", ... }
      ],
      "notas_aval": [],
      "informes_juridicos": [],
      "ratificaciones": []
    }
  }
}
```

### 2. UI Renders Based on Estado

```typescript
// Show workflow stepper with Estado 3 active
const estadoActual = detail.etapa.estado_actual.orden // 3

// Show intervention (Estado 1-2 completed)
const intervenciones = detail.etapa.documentos.intervenciones // 1 intervention

// Show nota de aval form (Estado 3 - current)
const canCreateNotaAval =
  detail.etapa.estado_actual.responsable_tipo === 'DIRECTOR' &&
  userIsDirector

// Hide informe juridico and ratificación (Estados 4-5 not reached)
```

### 3. User Opens Innovación Tab

```typescript
// Try to fetch Innovación etapa
try {
  const detail = await getInnovacionDetail(medidaId)
  // Success - etapa exists, render normally
} catch (error) {
  if (error.response?.status === 404) {
    // Innovación etapa hasn't been created yet
    // Show "Iniciar Etapa de Innovación" button
  }
}
```

---

## Summary

**The Problem**: Frontend was mixing interventions from all etapas because it was using the wrong endpoint.

**The Solution**: Use the `/api/medidas/{id}/etapa/{tipo_etapa}/` endpoint that returns a specific etapa with ALL its related documents.

**Result**: Each tab (Apertura, Innovación, Prórroga, Cese) shows ONLY the interventions that belong to that specific etapa.

---

**Document Version**: SOLUTION
**Backend Changes**: NONE (API already correct)
**Frontend Changes**: Use `/etapa/{tipo_etapa}/` endpoint instead of `/intervenciones/` endpoint
