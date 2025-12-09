# SEGUIMIENTO EN DISPOSITIVO - Implementation Summary

## Overview

This document describes the implementation of the **SEGUIMIENTO EN DISPOSITIVO** module for both MPE and MPJ medidas. Both modules share the same name but have different functionality tailored to their specific requirements.

## Implementation Date
November 2025

## What Was Implemented

### 1. Type Definitions (`types/seguimiento-dispositivo.ts`)

Complete TypeScript type definitions for all data structures:

- **Common Interfaces**:
  - `SituacionNNyA` - Base interface for situaciones
  - `InformacionEducativa` - Educational information (shared)
  - `InformacionSalud` - Health information (shared)
  - `TallerRecreativo` - Recreational/socio-labor workshops (shared)
  - `CambioLugarResguardo` - Change of custody location (shared)
  - `NotaSeguimiento` - Follow-up notes (shared)

- **MPE Specific**:
  - `SituacionResidenciaMPE` - Residence situation (Autorización, Permiso, Permiso Prolongado)
  - `SituacionCritica` - Critical situations (RSA, BP, DCS, SCP)
  - `SeguimientoDispositivoMPE` - Complete MPE seguimiento data

- **MPJ Specific**:
  - `SituacionInstitutoMPJ` - Instituto situation (Instituto, Sector, Permiso, Visita recibida)
  - `InstitutoOption` - Instituto/Sector dropdown options
  - `SeguimientoDispositivoMPJ` - Complete MPJ seguimiento data

- **API Types**:
  - `CreateSeguimientoRequest`
  - `UpdateSeguimientoRequest`
  - `SeguimientoResponse`

### 2. Constants (`constants/institutos-mpj.ts`)

Instituto and Sector dropdown data for MPJ:
- `INSTITUTOS_MPJ` - Array of instituto options with their sectors
- `getSectoresByInstituto()` - Helper to get sectors for a specific instituto
- `getInstitutoName()` - Helper to get instituto name by ID

**Note**: Currently contains placeholder data. Update with actual data from:
https://docs.google.com/spreadsheets/d/1qwbevOLXnB-87EzPlGbyIU1KvWwM7asr5GWZkYmWWKk/edit?usp=sharing

### 3. Shared Components

#### `components/medida/shared/InformacionEducativaSection.tsx`
Educational information form with fields:
- Nivel Educativo
- Establecimiento
- Grado/Curso
- Turno
- Rendimiento
- Asistencia
- Fecha de Actualización
- Observaciones

#### `components/medida/shared/InformacionSaludSection.tsx`
Health information form with fields:
- Obra Social
- Centro de Salud
- Médico de Cabecera
- Medicación Actual
- Alergias
- Condiciones Preexistentes
- Discapacidad
- CUD (Certificado Único de Discapacidad) - checkbox
- Fecha de Actualización
- Observaciones

#### `components/medida/shared/TalleresSection.tsx`
Dynamic taller management (up to 5 talleres):
- Nombre del Taller
- Institución
- Días y Horarios
- Referente
- Fecha de Inicio
- Fecha de Fin
- Observaciones
- Add/Remove taller functionality

### 4. MPJ Components

#### `components/medida/mpj-header.tsx`
New MPJ-specific header component featuring:
- Medida information display
- Estado chips (Apertura, Proceso, Cese)
- MPJ tipo/subtipo dropdowns:
  - Medidas socioeducativas no privativas de la libertad
  - Medidas socioeducativas privativas de la libertad
  - Medidas socioeducativas de resguardo institucional
- **"SEGUIMIENTO EN DISPOSITIVO" button** - Opens modal
- Modal dialog containing SeguimientoDispositivoMPJ component

#### `components/medida/mpj-tabs/seguimiento-dispositivo-tab.tsx`
Complete MPJ seguimiento module with sidebar navigation:

**Sections**:
1. **Situación del NNyA en Instituto**:
   - Instituto dropdown (from institutos-mpj constants)
   - Sector dropdown (dependent on selected instituto)
   - Permiso checkbox
   - Visita recibida (Sí/No radio buttons)
   - Fecha de Visita (shown when "Sí" selected)
   - Observaciones

2. **Información Educativa**: Uses shared component

3. **Información de Salud**: Uses shared component

4. **Talleres Recreativos y Sociolaborales**: Uses shared component (max 5)

5. **Cambio de Lugar de Resguardo**:
   - Current location display
   - New location dropdown (institutos)
   - Date picker
   - Motivo field
   - Register/Attach note buttons
   - History cards with attachments

6. **Notas de Seguimiento**:
   - Note text field
   - Date picker
   - Add note button
   - History cards with attachments

### 5. MPE Component Updates

#### Updated `components/medida/mpe-header.tsx`
- Changed button label from "Carga para Residencias" to **"SEGUIMIENTO EN DISPOSITIVO"**
- Changed modal title to **"SEGUIMIENTO EN DISPOSITIVO"**

#### Updated `components/medida/mpe-tabs/residencias-tab.tsx`
Complete restructure with new sidebar sections:

**New Sections**:
1. **Situación del NNyA en Residencia** (NEW):
   - Radio buttons: Autorización, Permiso, Permiso Prolongado
   - Fecha
   - Observaciones
   - Guardar button

2. **Información Educativa** (NEW): Uses shared component

3. **Información de Salud** (NEW): Uses shared component

4. **Talleres Recreativos y Sociolaborales** (NEW): Uses shared component (max 5)

5. **Cambio de Lugar de Resguardo**: Maintained existing functionality

6. **Notas de Seguimiento**: Maintained existing functionality

**Removed**: "Plan de acompañamiento" and "Situaciones críticas" sections (old structure)

### 6. API Service (`api/seguimiento-dispositivo-api-service.ts`)

Complete RESTful API service with methods:

**General**:
- `getSeguimiento()` - Get seguimiento data for a medida
- `createSeguimiento()` - Create new seguimiento record
- `updateSeguimiento()` - Update seguimiento data

**MPE Specific**:
- `addSituacionResidencia()` - Add residence situation
- `addSituacionCritica()` - Add critical situation

**MPJ Specific**:
- `addSituacionInstituto()` - Add instituto situation

**Shared Operations**:
- `updateInformacionEducativa()` - Update educational info
- `updateInformacionSalud()` - Update health info
- `addTaller()` - Add taller
- `updateTaller()` - Update taller
- `deleteTaller()` - Delete taller
- `addCambioResguardo()` - Add change of custody location
- `addNotaSeguimiento()` - Add follow-up note

**File Uploads**:
- `uploadAdjuntoCambioResguardo()` - Upload attachment for location change
- `uploadAdjuntoNota()` - Upload attachment for note

## File Structure

```
src/app/(runna)/legajo/[id]/medida/[medidaId]/
├── types/
│   └── seguimiento-dispositivo.ts (NEW)
├── constants/
│   └── institutos-mpj.ts (NEW)
├── components/
│   └── medida/
│       ├── shared/
│       │   ├── InformacionEducativaSection.tsx (NEW)
│       │   ├── InformacionSaludSection.tsx (NEW)
│       │   └── TalleresSection.tsx (NEW)
│       ├── mpj-header.tsx (NEW)
│       ├── mpe-header.tsx (UPDATED)
│       ├── mpj-tabs/
│       │   └── seguimiento-dispositivo-tab.tsx (NEW)
│       └── mpe-tabs/
│           └── residencias-tab.tsx (UPDATED)
└── api/
    └── seguimiento-dispositivo-api-service.ts (NEW)
```

## Integration Points

### For MPJ Medidas

To use the MPJ header with SEGUIMIENTO EN DISPOSITIVO:

```tsx
import { MPJHeader } from './components/medida/mpj-header'

// In your MPJ page component
<MPJHeader
  medidaData={medidaData}
  estados={{
    apertura: true,
    proceso: false,
    cese: false
  }}
  onFieldChange={(field, value) => {
    // Handle field changes
  }}
/>
```

### For MPE Medidas

The existing MPE header has been updated. No integration changes needed.

```tsx
import { MPEHeader } from './components/medida/mpe-header'

// Existing usage - button label automatically updated
<MPEHeader medidaData={medidaData} estados={estados} progreso={progreso} />
```

## Backend Requirements

The backend API needs to implement the following endpoints:

### Base Endpoints
- `GET /api/medidas/{medida_id}/seguimiento/` - Get seguimiento data
- `POST /api/medidas/{medida_id}/seguimiento/` - Create seguimiento
- `PUT /api/medidas/{medida_id}/seguimiento/{id}/` - Update seguimiento

### MPE Endpoints
- `POST /api/medidas/{medida_id}/seguimiento/situaciones-residencia/`
- `POST /api/medidas/{medida_id}/seguimiento/situaciones-criticas/`

### MPJ Endpoints
- `POST /api/medidas/{medida_id}/seguimiento/situaciones-instituto/`

### Shared Endpoints
- `PUT /api/medidas/{medida_id}/seguimiento/informacion-educativa/`
- `PUT /api/medidas/{medida_id}/seguimiento/informacion-salud/`
- `POST /api/medidas/{medida_id}/seguimiento/talleres/`
- `PUT /api/medidas/{medida_id}/seguimiento/talleres/{taller_id}/`
- `DELETE /api/medidas/{medida_id}/seguimiento/talleres/{taller_id}/`
- `POST /api/medidas/{medida_id}/seguimiento/cambios-resguardo/`
- `POST /api/medidas/{medida_id}/seguimiento/notas/`

### File Upload Endpoints
- `POST /api/medidas/{medida_id}/seguimiento/cambios-resguardo/{cambio_id}/adjunto/`
- `POST /api/medidas/{medida_id}/seguimiento/notas/{nota_id}/adjunto/`

## Data Integration (COMPLETED)

### Mapper Utility (`utils/seguimiento-mapper.ts`)

Transforms demanda full-detail data to seguimiento format:

**Functions**:
- `mapEducacionFromDemanda(demandaData, personaId?)` - Extracts education information from `personas[].educacion`
- `mapSaludFromDemanda(demandaData, personaId?)` - Extracts health information from `personas[].cobertura_medica`
- `mapSaludFromDemandaEnhanced(demandaData, personaId?)` - Enhanced version with CUD and discapacidad detection

**Data Sources**:
- Education: `personas[].educacion` → nivel_educativo, establecimiento, grado_curso, turno, rendimiento, asistencia
- Health: `personas[].cobertura_medica` → obra_social, institucion_sanitaria, medico_cabecera
- Medications: `personas[].persona_enfermedades[].informacion_tratamiento` → medicacion_actual
- Conditions: `personas[].persona_enfermedades[].enfermedad.nombre` → condiciones_preexistentes
- CUD: `personas[].persona_enfermedades[].certificacion` (checks for CUD keywords)
- Discapacidad: `personas[].condiciones_vulnerabilidad[]` or `persona_enfermedades[]`

### Component Integration (COMPLETED)

**Updated Components**:
1. **MPJ Header** (`mpj-header.tsx`):
   - Accepts `demandaData` prop
   - Passes to `SeguimientoDispositivoMPJ` with `personaId`

2. **MPE Header** (`mpe-header.tsx`):
   - Accepts `demandaData` prop
   - Passes to `ResidenciasTab` with `personaId`

3. **SeguimientoDispositivoMPJ** (`seguimiento-dispositivo-tab.tsx`):
   - Accepts `demandaData` and `personaId` props
   - Uses `useMemo` to transform data with mapper functions
   - Passes transformed data to shared sections

4. **ResidenciasTab** (`residencias-tab.tsx`):
   - Accepts `demandaData` and `personaId` props
   - Uses `useMemo` to transform data with mapper functions
   - Passes transformed data to shared sections

5. **Shared Components** (Already compatible):
   - `InformacionEducativaSection` - Accepts `data` prop, initializes form fields
   - `InformacionSaludSection` - Accepts `data` prop, initializes form fields

**Data Flow**:
```
Parent Component (medida-detail.tsx)
  ↓ demandaData
MPJHeader / MPEHeader
  ↓ demandaData + personaId
SeguimientoDispositivoMPJ / ResidenciasTab
  ↓ useMemo(mappers)
  ↓ educacionData, saludData
InformacionEducativaSection / InformacionSaludSection
  ↓ initialized form fields
```

## Next Steps

1. **Fetch Demanda Data in Parent** (COMPLETED): Updated `medida-detail.tsx` to:
   - Fetch demanda full-detail data when legajo loads using API service
   - Pass demanda data to MPJHeader/MPEHeader
   - Implementation (lines 260-281):
   ```typescript
   import { get } from "@/app/api/apiService"

   const [demandaData, setDemandaData] = useState<any>(null)

   useEffect(() => {
     const loadDemanda = async () => {
       if (!legajoData?.demandas_relacionadas?.resultados) return
       const demandas = legajoData.demandas_relacionadas.resultados
       if (demandas.length === 0) return

       const activeDemanda = demandas.find((d: any) => d.estado === 'ACTIVA') || demandas[0]
       if (!activeDemanda?.id) return

       try {
         const fullDemanda = await get<any>(`registro-demanda-form/${activeDemanda.id}/full-detail/`)
         setDemandaData(fullDemanda)
       } catch (err: any) {
         console.error('Error loading demanda full-detail:', err)
       }
     }
     loadDemanda()
   }, [legajoData])

   // Headers updated (lines 549 and 579):
   <MPJHeader medidaData={medidaData} demandaData={demandaData} ... />
   <MPEHeader medidaData={medidaData} demandaData={demandaData} ... />
   ```

   **Note**: Uses the project's API service with configured base URL (Railway backend in development)

2. **Update Instituto Data**: Replace placeholder data in `institutos-mpj.ts` with actual data from the Google Sheets document

3. **Backend Implementation**: Implement the API endpoints listed above

4. **Connect Save Actions**: Update "Guardar" buttons to use the API service:
   - SeguimientoDispositivoMPJ component
   - ResidenciasTab component
   - Add loading states
   - Add error handling

5. **File Upload Integration**: Implement file upload functionality for:
   - Cambio de lugar de resguardo attachments
   - Notas de seguimiento attachments

6. **Testing**: Comprehensive testing of:
   - Data mapping from demanda to seguimiento
   - Form initialization with demanda data
   - MPJ seguimiento module
   - MPE seguimiento module (updated)
   - API integration
   - File uploads
   - Form validations

7. **Permissions**: Implement appropriate user permissions for:
   - Viewing seguimiento data
   - Creating/updating seguimiento records
   - File uploads

## Notes

- Both MPE and MPJ modules use the same name "SEGUIMIENTO EN DISPOSITIVO" but have different content
- Shared components (Información Educativa, Información de Salud, Talleres) are reusable across both modules
- The instituto/sector data is currently placeholder and needs to be updated with real data
- All components use Material-UI for consistency with the existing design system
- API service includes comprehensive error handling
- Components are designed to be extensible for future requirements

## Support

For questions or issues related to this implementation, please refer to:
- Type definitions in `types/seguimiento-dispositivo.ts`
- API documentation in `api/seguimiento-dispositivo-api-service.ts`
- Component examples in the respective component files
