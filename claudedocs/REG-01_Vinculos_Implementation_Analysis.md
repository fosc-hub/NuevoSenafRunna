# REG-01: Vinculación de Legajos y Medidas durante Registro de Demanda

## 📊 Análisis de Implementación

### Estado Actual

#### ✅ Implementado
1. **Vinculación Post-Creación** (ConexionesDemandaTab.tsx)
   - Permite crear vínculos DESPUÉS de que la demanda ya existe
   - Usa `CrearVinculoLegajoDialog` para crear vínculos uno por uno
   - Workflow: Demanda creada → Tab "Conexiones" → Crear vínculo → Seleccionar legajo → Seleccionar medida → Justificar

2. **Modelos de Vínculo** (vinculo-types.ts)
   - `TVinculoLegajoCreate`: Interfaz completa con validaciones
   - `TTipoVinculo`: Catálogo de tipos de vínculo
   - Validación de justificación (mínimo 20 caracteres)
   - Soporte para legajo, medida y demanda como destinos

3. **API de Vínculos** (useVinculos hook)
   - `crearVinculo`: POST /api/vinculos-legajo/
   - `loadTiposVinculo`: GET /api/tipos-vinculo/
   - Manejo completo de errores y carga

4. **Componentes de UI**
   - `LegajoSearchAutocomplete`: Búsqueda de legajos con medidas activas
   - `CrearVinculoLegajoDialog`: Dialog completo para crear vínculos

#### ❌ Faltante
1. **Vinculación Durante Registro**
   - NO hay forma de agregar vínculos al crear la demanda
   - El usuario debe esperar a que la demanda se cree, luego ir a la tab "Conexiones"
   - Workflow fragmentado y con más pasos

2. **Campo vinculos en FormData**
   - FormData NO incluye array `vinculos`
   - submitCleanFormData NO maneja vínculos

3. **UI en el Wizard**
   - No hay sección en Step1, Step2 o Step3 para agregar vínculos
   - No hay preview de vínculos antes de enviar

---

## 🎯 Requisitos del Usuario

### Payload Esperado

```json
{
  "objetivo_de_demanda": "CARGA_OFICIOS",
  "fecha_ingreso_senaf": "2025-10-27",
  "fecha_oficio_documento": "2025-10-25",
  "descripcion": "Oficio judicial para situación de riesgo",
  "institucion": { ... },
  "localizacion": { ... },
  "relacion_demanda": {
    "codigos_demanda": [],
    "demanda_zona": { "zona": 1 }
  },
  "vinculos": [
    {
      "legajo": 123,
      "medida": null,
      "tipo_vinculo": 5,
      "justificacion": "Oficio de ratificación judicial recibido el 2025-10-27 para el menor Juan Pérez DNI 12345678"
    },
    {
      "legajo": 456,
      "medida": 789,
      "tipo_vinculo": 5,
      "justificacion": "Oficio judicial vinculando legajo 456 con medida de protección existente 789 por resolución judicial"
    }
  ]
}
```

### Validaciones
- ✅ `vinculos` es **opcional** (backward compatible)
- ✅ Dentro de cada vínculo:
  - `legajo` (required) → number (ID del legajo)
  - `medida` (optional) → number | null (ID de la medida)
  - `tipo_vinculo` (required) → number (ID del tipo de vínculo)
  - `justificacion` (required) → string (min 20 caracteres)

### Comportamiento Backend
1. Usuario envía POST a `/api/registro-demanda-form/` con `vinculos` en el payload
2. Backend crea la demanda normalmente
3. Después de crear demanda, itera sobre `vinculos`:
   - Para cada vínculo:
     - Obtiene `TLegajo` por ID
     - Obtiene `TMedida` por ID (si especificado)
     - Obtiene `TTipoVinculo` por ID
     - Crea `TVinculoLegajo` con:
       - `legajo_origen` = legajo especificado
       - `demanda_destino` = demanda recién creada
       - `medida_destino` = medida especificada (puede ser NULL)
       - `tipo_vinculo` = tipo seleccionado
       - `justificacion` = justificación del payload
       - `creado_por` = usuario actual
4. Si `tipo_oficio` está presente, el signal `crear_actividades_desde_oficio` se ejecuta automáticamente

---

## 🏗️ Plan de Implementación

### Fase 1: Tipos y Modelos

#### 1.1 Actualizar FormData (formTypes.ts)

**Ubicación:** `src/components/forms/types/formTypes.ts`

```typescript
// Agregar interfaz de vínculo para el formulario
export interface VinculoFormData {
  legajo: number | null;           // ID del legajo
  medida: number | null;           // ID de la medida (opcional)
  tipo_vinculo: number | null;     // ID del tipo de vínculo
  justificacion: string;           // Justificación (min 20 chars)
  // UI helper fields
  legajo_info?: {
    id: number;
    numero: string;
    nnya_nombre: string;
    medidas_activas: Array<{
      id: number;
      numero_medida: string;
      tipo_medida: string;
      estado_vigencia: string;
    }>;
  };
}

// Actualizar FormData interface
export interface FormData {
  // ... campos existentes ...

  // NUEVO: Vínculos para crear junto con la demanda
  vinculos?: VinculoFormData[];
}
```

#### 1.2 Actualizar DropdownData (formTypes.ts)

```typescript
export interface DropdownData {
  // ... campos existentes ...

  // NUEVO: Tipos de vínculo para dropdown
  tipos_vinculo?: Array<{
    id: number;
    codigo: string;
    nombre: string;
    descripcion: string;
    activo: boolean;
  }>;
}
```

---

### Fase 2: API - Cargar Tipos de Vínculo

#### 2.1 Modificar fetchDropdownData (fetchFormCase.ts)

**Ubicación:** `src/components/forms/utils/fetchFormCase.ts`

```typescript
export const fetchDropdownData = async (): Promise<DropdownData> => {
  try {
    const response = await get<DropdownData>("registro-demanda-form-dropdowns/");

    // NUEVO: Cargar tipos de vínculo
    const tiposVinculoResponse = await get<any[]>("tipos-vinculo/");

    return {
      ...response,
      tipos_vinculo: tiposVinculoResponse || [],
    };
  } catch (error) {
    console.error("Error fetching dropdown data:", error);
    throw error;
  }
};
```

---

### Fase 3: Componente de UI - Gestión de Vínculos

#### 3.1 Crear VinculosManager Component

**Nueva ubicación:** `src/components/forms/components/VinculosManager.tsx`

```tsx
"use client"

import React, { useState } from "react"
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  IconButton,
  Chip,
  TextField,
  MenuItem,
  Alert,
  Divider,
  useTheme,
  alpha,
} from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import DeleteIcon from "@mui/icons-material/Delete"
import LinkIcon from "@mui/icons-material/Link"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import ExpandLessIcon from "@mui/icons-material/ExpandLess"
import { useFormContext } from "react-hook-form"
import type { FormData, DropdownData, VinculoFormData } from "../types/formTypes"
import LegajoSearchAutocomplete, {
  type LegajoOption,
} from "@/app/(runna)/demanda/ui/components/LegajoSearchAutocomplete"
import { MIN_CARACTERES_JUSTIFICACION_VINCULO } from "@/app/(runna)/legajo-mesa/types/vinculo-types"

interface VinculosManagerProps {
  dropdownData: DropdownData
  readOnly?: boolean
}

export default function VinculosManager({ dropdownData, readOnly = false }: VinculosManagerProps) {
  const theme = useTheme()
  const { watch, setValue } = useFormContext<FormData>()

  const vinculos = watch("vinculos") || []
  const [expandedVinculos, setExpandedVinculos] = useState<Set<number>>(new Set())

  // Validation errors per vinculo
  const [vinculoErrors, setVinculoErrors] = useState<Record<number, {
    legajo?: string
    medida?: string
    tipo_vinculo?: string
    justificacion?: string
  }>>({})

  const handleAddVinculo = () => {
    const newVinculo: VinculoFormData = {
      legajo: null,
      medida: null,
      tipo_vinculo: null,
      justificacion: "",
    }

    setValue("vinculos", [...vinculos, newVinculo])
  }

  const handleRemoveVinculo = (index: number) => {
    const newVinculos = vinculos.filter((_, i) => i !== index)
    setValue("vinculos", newVinculos)

    // Clear errors for this vinculo
    const newErrors = { ...vinculoErrors }
    delete newErrors[index]
    setVinculoErrors(newErrors)
  }

  const handleUpdateVinculo = (index: number, field: keyof VinculoFormData, value: any) => {
    const newVinculos = [...vinculos]
    newVinculos[index] = {
      ...newVinculos[index],
      [field]: value,
    }
    setValue("vinculos", newVinculos)

    // Clear error for this field
    if (vinculoErrors[index]) {
      const newErrors = { ...vinculoErrors }
      delete newErrors[index][field]
      setVinculoErrors(newErrors)
    }
  }

  const handleLegajoSelect = (index: number, legajoOption: LegajoOption | null) => {
    const newVinculos = [...vinculos]

    if (legajoOption) {
      newVinculos[index] = {
        ...newVinculos[index],
        legajo: legajoOption.id,
        medida: null, // Reset medida when legajo changes
        legajo_info: {
          id: legajoOption.id,
          numero: legajoOption.numero,
          nnya_nombre: legajoOption.nnya_nombre,
          medidas_activas: legajoOption.medidas_activas || [],
        },
      }
    } else {
      newVinculos[index] = {
        ...newVinculos[index],
        legajo: null,
        medida: null,
        legajo_info: undefined,
      }
    }

    setValue("vinculos", newVinculos)
  }

  const validateVinculo = (vinculo: VinculoFormData, index: number): boolean => {
    const errors: typeof vinculoErrors[0] = {}

    if (!vinculo.legajo) {
      errors.legajo = "Debe seleccionar un legajo"
    }

    if (!vinculo.tipo_vinculo) {
      errors.tipo_vinculo = "Debe seleccionar un tipo de vínculo"
    }

    if (!vinculo.justificacion.trim()) {
      errors.justificacion = "La justificación es obligatoria"
    } else if (vinculo.justificacion.trim().length < MIN_CARACTERES_JUSTIFICACION_VINCULO) {
      errors.justificacion = `Mínimo ${MIN_CARACTERES_JUSTIFICACION_VINCULO} caracteres`
    }

    if (Object.keys(errors).length > 0) {
      setVinculoErrors((prev) => ({ ...prev, [index]: errors }))
      return false
    }

    return true
  }

  const validateAllVinculos = (): boolean => {
    if (vinculos.length === 0) return true // No vinculos is valid

    let allValid = true
    vinculos.forEach((vinculo, index) => {
      if (!validateVinculo(vinculo, index)) {
        allValid = false
      }
    })

    return allValid
  }

  const toggleJustificacion = (index: number) => {
    setExpandedVinculos((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  const getTruncatedText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  if (readOnly && vinculos.length === 0) {
    return null
  }

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <LinkIcon color="primary" />
          Vínculos con Legajos y Medidas
        </Typography>

        {!readOnly && (
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddVinculo}
            size="small"
          >
            Agregar Vínculo
          </Button>
        )}
      </Box>

      {vinculos.length === 0 && !readOnly && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Puede agregar vínculos durante el registro de la demanda. Los vínculos permiten relacionar
            esta demanda con legajos y medidas existentes.
          </Typography>
        </Alert>
      )}

      {vinculos.length > 0 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {vinculos.map((vinculo, index) => {
            const isExpanded = expandedJustificaciones.has(index)
            const shouldTruncate = vinculo.justificacion.length > 100
            const errors = vinculoErrors[index] || {}

            return (
              <Card
                key={index}
                variant="outlined"
                sx={{
                  border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: theme.palette.primary.main,
                    boxShadow: theme.shadows[2],
                  },
                }}
              >
                <CardContent>
                  {/* Header */}
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Vínculo #{index + 1}
                    </Typography>

                    {!readOnly && (
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveVinculo(index)}
                        sx={{
                          color: theme.palette.error.main,
                          "&:hover": {
                            bgcolor: alpha(theme.palette.error.main, 0.1),
                          },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  {/* Fields */}
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {/* Legajo Search */}
                    <LegajoSearchAutocomplete
                      value={vinculo.legajo_info ? {
                        id: vinculo.legajo_info.id,
                        numero: vinculo.legajo_info.numero,
                        nnya_nombre: vinculo.legajo_info.nnya_nombre,
                        medidas_activas: vinculo.legajo_info.medidas_activas,
                      } : null}
                      onChange={(value) => handleLegajoSelect(index, value)}
                      label="Legajo *"
                      placeholder="Buscar legajo por número o nombre del NNyA..."
                      error={Boolean(errors.legajo)}
                      helperText={errors.legajo}
                      disabled={readOnly}
                    />

                    {/* Medida Selector */}
                    {vinculo.legajo && vinculo.legajo_info && (
                      <TextField
                        select
                        fullWidth
                        label="Medida (Opcional)"
                        value={vinculo.medida || ""}
                        onChange={(e) =>
                          handleUpdateVinculo(index, "medida", e.target.value ? Number(e.target.value) : null)
                        }
                        error={Boolean(errors.medida)}
                        helperText={
                          errors.medida ||
                          (vinculo.legajo_info.medidas_activas.length === 0
                            ? "Este legajo no tiene medidas activas"
                            : "Seleccione una medida específica (opcional)")
                        }
                        disabled={
                          readOnly ||
                          !vinculo.legajo_info.medidas_activas ||
                          vinculo.legajo_info.medidas_activas.length === 0
                        }
                      >
                        <MenuItem value="">
                          <em>Sin medida específica</em>
                        </MenuItem>
                        {vinculo.legajo_info.medidas_activas.map((medida) => (
                          <MenuItem key={medida.id} value={medida.id}>
                            <Box>
                              <Typography variant="body2" fontWeight={500}>
                                {medida.numero_medida} - {medida.tipo_medida}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Estado: {medida.estado_vigencia}
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </TextField>
                    )}

                    {/* Tipo de Vínculo */}
                    <TextField
                      select
                      fullWidth
                      required
                      label="Tipo de Vínculo *"
                      value={vinculo.tipo_vinculo || ""}
                      onChange={(e) =>
                        handleUpdateVinculo(index, "tipo_vinculo", e.target.value ? Number(e.target.value) : null)
                      }
                      error={Boolean(errors.tipo_vinculo)}
                      helperText={errors.tipo_vinculo}
                      disabled={readOnly || !dropdownData.tipos_vinculo || dropdownData.tipos_vinculo.length === 0}
                    >
                      {dropdownData.tipos_vinculo?.map((tipo) => (
                        <MenuItem key={tipo.id} value={tipo.id}>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {tipo.nombre}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {tipo.descripcion}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </TextField>

                    {/* Justificación */}
                    <Box>
                      <TextField
                        fullWidth
                        required
                        multiline
                        rows={readOnly ? 2 : 4}
                        label="Justificación *"
                        placeholder={`Explique el motivo de esta vinculación (mínimo ${MIN_CARACTERES_JUSTIFICACION_VINCULO} caracteres)...`}
                        value={vinculo.justificacion}
                        onChange={(e) => handleUpdateVinculo(index, "justificacion", e.target.value)}
                        error={Boolean(errors.justificacion)}
                        helperText={errors.justificacion}
                        disabled={readOnly}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            bgcolor: alpha(theme.palette.background.paper, 0.5),
                          },
                        }}
                      />

                      {!readOnly && (
                        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
                          <Typography
                            variant="caption"
                            color={
                              vinculo.justificacion.length >= MIN_CARACTERES_JUSTIFICACION_VINCULO
                                ? "success.main"
                                : "text.secondary"
                            }
                          >
                            {vinculo.justificacion.length} / {MIN_CARACTERES_JUSTIFICACION_VINCULO} caracteres
                          </Typography>
                          {vinculo.justificacion.length < MIN_CARACTERES_JUSTIFICACION_VINCULO && (
                            <Typography variant="caption" color="warning.main">
                              Faltan{" "}
                              {Math.max(0, MIN_CARACTERES_JUSTIFICACION_VINCULO - vinculo.justificacion.length)}{" "}
                              caracteres
                            </Typography>
                          )}
                        </Box>
                      )}
                    </Box>

                    {/* Summary chips (read-only mode) */}
                    {readOnly && (
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        {vinculo.legajo_info && (
                          <Chip
                            label={`Legajo: ${vinculo.legajo_info.numero}`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        )}
                        {vinculo.medida && (
                          <Chip
                            label={`Medida: ${vinculo.medida}`}
                            size="small"
                            color="secondary"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            )
          })}
        </Box>
      )}

      {/* Global validation warning */}
      {!readOnly && vinculos.length > 0 && Object.keys(vinculoErrors).length > 0 && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          <Typography variant="body2">
            Por favor, complete todos los campos obligatorios en los vínculos antes de enviar el formulario.
          </Typography>
        </Alert>
      )}
    </Box>
  )
}
```

---

### Fase 4: Integrar en el Wizard

#### 4.1 Opción A: Agregar sección en Step1Form (Recomendado para CARGA_OFICIOS)

**Ubicación:** `src/components/forms/Step1Form.tsx`

```tsx
import VinculosManager from "./components/VinculosManager"

// Agregar después de la sección de observaciones y antes del final del formulario
<Box sx={{ mt: 4 }}>
  <VinculosManager dropdownData={dropdownData} readOnly={readOnly} />
</Box>
```

#### 4.2 Opción B: Agregar como Step 4 (Recomendado para flujo general)

**Modificar:** `src/components/forms/MultiStepForm.tsx`

```typescript
const steps = [
  {
    label: "Información General",
    description: "Datos básicos de la demanda",
  },
  {
    label: "Adultos Convivientes",
    description: "Información de adultos en el grupo familiar",
  },
  {
    label: "Niños y Adolescentes",
    description: "Información de menores en el grupo familiar",
  },
  {
    label: "Vínculos", // NUEVO STEP
    description: "Vincular legajos y medidas a esta demanda",
  },
]

// En el render, agregar:
{activeStep === 3 && (
  <Box sx={{ p: 3 }}>
    <VinculosManager dropdownData={dropdownData} readOnly={isReadOnly} />
  </Box>
)}
```

---

### Fase 5: API - Enviar Vínculos al Backend

#### 5.1 Modificar submitCleanFormData (submitCleanFormData.ts)

**Ubicación:** `src/components/forms/utils/submitCleanFormData.ts`

```typescript
export function submitCleanFormData(formData: FormData, existingData?: any): any {
  const transformedData = {
    // ... campos existentes ...

    personas: [
      // ... personas existentes ...
    ],
  }

  // NUEVO: Agregar vínculos si existen
  if (formData.vinculos && formData.vinculos.length > 0) {
    // Filter out incomplete vinculos (must have legajo, tipo_vinculo, and justificacion)
    const validVinculos = formData.vinculos.filter(
      (v) =>
        v.legajo !== null &&
        v.tipo_vinculo !== null &&
        v.justificacion.trim().length >= 20 // Backend validation
    )

    if (validVinculos.length > 0) {
      transformedData.vinculos = validVinculos.map((vinculo) => ({
        legajo: vinculo.legajo,
        medida: vinculo.medida, // Can be null
        tipo_vinculo: vinculo.tipo_vinculo,
        justificacion: vinculo.justificacion.trim(),
      }))
    }
  }

  return transformedData
}
```

---

### Fase 6: Validación Pre-Envío

#### 6.1 Agregar validación en MultiStepForm

**Ubicación:** `src/components/forms/MultiStepForm.tsx`

```typescript
const handleFormSubmit = methods.handleSubmit(async (data) => {
  console.log("Form data before submission:", data)

  // Validar vínculos si existen
  if (data.vinculos && data.vinculos.length > 0) {
    const invalidVinculos = data.vinculos.filter(
      (v) =>
        !v.legajo ||
        !v.tipo_vinculo ||
        !v.justificacion ||
        v.justificacion.trim().length < 20
    )

    if (invalidVinculos.length > 0) {
      toast.error(
        "Por favor, complete todos los campos obligatorios en los vínculos antes de enviar."
      )
      return
    }
  }

  // Ensure arrays
  const formDataWithArrays = {
    ...data,
    ninosAdolescentes: data.ninosAdolescentes || [],
    adultosConvivientes: data.adultosConvivientes || [],
    vinculos: data.vinculos || [], // Include vinculos (can be empty array)
  }

  if (!isReadOnly) {
    mutation.mutate(formDataWithArrays)
  } else {
    onSubmit(formDataWithArrays)
  }
})
```

---

## 🔍 Validaciones Backend Esperadas

Según la documentación (LEG-01_Reconocimiento_Existencia_Legajo.md), el backend debe:

1. **Validar vínculos array**:
   - ✅ `vinculos` es **opcional** (backward compatible)
   - ✅ Si presente, debe ser un array

2. **Validar cada vínculo**:
   - ✅ `legajo` es **obligatorio** (número > 0)
   - ✅ `medida` es **opcional** (puede ser null o número > 0)
   - ✅ `tipo_vinculo` es **obligatorio** (número > 0)
   - ✅ `justificacion` es **obligatoria** (string, mínimo 20 caracteres)

3. **Creación de vínculos**:
   - Para cada vínculo en el array:
     - Obtener instancia de `TLegajo` por ID
       - Si no existe, **omitir vínculo** con warning en logs
     - Obtener instancia de `TMedida` por ID (si especificado)
       - Si no existe, **omitir vínculo** con warning en logs
     - Obtener instancia de `TTipoVinculo` por ID
       - Si no existe, **omitir vínculo** con warning en logs
     - Crear `TVinculoLegajo`:
       ```python
       TVinculoLegajo.objects.create(
           legajo_origen=legajo,
           demanda_destino=demanda_creada,
           medida_destino=medida if medida else None,
           tipo_vinculo=tipo_vinculo,
           justificacion=vinculo['justificacion'],
           creado_por=request.user,
           activo=True
       )
       ```

4. **Transacción atómica**:
   - Todo en una transacción: si falla la creación de demanda o vínculos, **rollback completo**

5. **Signal activation**:
   - Después de crear vínculos exitosamente, el signal `crear_actividades_desde_oficio` se ejecuta si:
     - `objetivo_de_demanda == 'CARGA_OFICIOS'`
     - `tipo_oficio` está presente
     - Hay vínculos con `medida_destino` no nula

---

## 📋 Checklist de Implementación

### Frontend
- [ ] **Tipos**
  - [ ] Agregar `VinculoFormData` interface en `formTypes.ts`
  - [ ] Agregar campo `vinculos` en `FormData` interface
  - [ ] Agregar campo `tipos_vinculo` en `DropdownData` interface

- [ ] **API**
  - [ ] Modificar `fetchDropdownData` para cargar tipos de vínculo

- [ ] **Componentes**
  - [ ] Crear componente `VinculosManager.tsx`
  - [ ] Implementar validación de vínculos en el componente
  - [ ] Integrar `LegajoSearchAutocomplete` existente
  - [ ] Manejar selección de medidas del legajo

- [ ] **Wizard Integration**
  - [ ] Agregar sección de vínculos en Step1 O crear Step4
  - [ ] Actualizar navegación del stepper si se agrega Step4
  - [ ] Agregar validación pre-envío en `MultiStepForm`

- [ ] **Data Submission**
  - [ ] Modificar `submitCleanFormData` para incluir vínculos
  - [ ] Filtrar vínculos inválidos antes de enviar
  - [ ] Mantener backward compatibility (vinculos opcional)

### Backend (Verificación)
- [ ] **Serializer**
  - [ ] Verificar que `RegistroDemandaFormSerializer` acepta campo `vinculos`
  - [ ] Verificar creación de `TVinculoLegajo` en `create()` method
  - [ ] Verificar manejo de errores (legajo/medida/tipo_vinculo no existen)

- [ ] **Validaciones**
  - [ ] Verificar validación de justificación (min 20 caracteres)
  - [ ] Verificar validación de FKs (legajo, medida, tipo_vinculo)
  - [ ] Verificar transacción atómica

- [ ] **Signals**
  - [ ] Verificar que `crear_actividades_desde_oficio` se ejecuta correctamente

### Testing
- [ ] **Unit Tests**
  - [ ] Test `VinculosManager` component rendering
  - [ ] Test add/remove vinculo
  - [ ] Test vinculo validation
  - [ ] Test `submitCleanFormData` con vínculos

- [ ] **Integration Tests**
  - [ ] Test crear demanda sin vínculos (backward compatibility)
  - [ ] Test crear demanda con 1 vínculo
  - [ ] Test crear demanda con múltiples vínculos
  - [ ] Test vinculo con medida null
  - [ ] Test vinculo con medida especificada
  - [ ] Test error handling (legajo no existe, etc.)

- [ ] **E2E Tests**
  - [ ] Test flujo completo: REG-01 → agregar vínculo → enviar → verificar creación
  - [ ] Test flujo CARGA_OFICIOS con vínculo → verificar actividades PLTM creadas

---

## 🚀 Orden de Implementación Recomendado

### Día 1: Tipos y API
1. Actualizar `formTypes.ts` (1h)
2. Modificar `fetchDropdownData` (0.5h)
3. Actualizar `submitCleanFormData` (1h)

### Día 2: Componente UI
4. Crear `VinculosManager.tsx` (4h)
5. Integrar con `LegajoSearchAutocomplete` (1h)
6. Styling y UX polish (1h)

### Día 3: Integración Wizard
7. Integrar en Step1 o crear Step4 (2h)
8. Agregar validación pre-envío (1h)
9. Testing manual (2h)

### Día 4: Testing
10. Unit tests (2h)
11. Integration tests (2h)
12. E2E tests (2h)

### Día 5: Refinamiento
13. Bug fixes (2h)
14. UX improvements (2h)
15. Documentación (2h)

**Tiempo total estimado: 27 horas (≈ 3.5 días de trabajo)**

---

## 💡 Decisiones de Diseño

### ¿Dónde agregar la sección de vínculos?

**Opción A: En Step 1 (Información General)**
- ✅ **Pros**:
  - Todo en un mismo lugar para CARGA_OFICIOS
  - Menos navegación para el usuario
  - Información contextual clara
- ❌ **Contras**:
  - Step 1 puede volverse muy largo
  - Menos separación de concerns

**Opción B: Como Step 4 (Nuevo paso dedicado)**
- ✅ **Pros**:
  - Separación clara de responsabilidades
  - Más fácil de omitir si no se necesitan vínculos
  - UI menos cargada por step
- ❌ **Contras**:
  - Un paso extra en el wizard
  - Más navegación para CARGA_OFICIOS

**Recomendación**: **Opción A para objetivo_de_demanda == 'CARGA_OFICIOS'**, Opción B para flujo general.

Podemos usar rendering condicional:
```tsx
{/* En Step1Form.tsx */}
{formData.objetivo_de_demanda === 'CARGA_OFICIOS' && (
  <Box sx={{ mt: 4 }}>
    <VinculosManager dropdownData={dropdownData} readOnly={readOnly} />
  </Box>
)}
```

### ¿Validación en tiempo real o al enviar?

**Recomendación**: **Validación híbrida**
- Validación básica en tiempo real (campos requeridos, longitud mínima)
- Validación completa al intentar avanzar de step o enviar
- Feedback visual inmediato (caracteres restantes, campos incompletos)

### ¿Permitir múltiples vínculos o solo uno?

**Recomendación**: **Múltiples vínculos**
- El payload del usuario muestra un array
- Casos reales pueden requerir vincular múltiples legajos/medidas
- El backend ya soporta array de vínculos

---

## 🔗 Referencias

- **LEG-01_Reconocimiento_Existencia_Legajo.md**: Documentación completa de vinculación
- **REG-01_Registro_Demanda.md**: Documentación de registro de demanda
- **vinculo-types.ts**: Tipos TypeScript de vínculos
- **CrearVinculoLegajoDialog.tsx**: Componente existente de creación de vínculos (referencia de UX)
- **LegajoSearchAutocomplete.tsx**: Componente de búsqueda de legajos (reutilizable)
- **submitCleanFormData.ts**: Lógica de limpieza de datos pre-envío

---

## ⚠️ Consideraciones Importantes

### Backward Compatibility
- ✅ El campo `vinculos` es completamente **opcional**
- ✅ Si no se envía, el backend funciona igual que antes
- ✅ Demandas antiguas sin vínculos siguen funcionando
- ✅ El flujo post-creación (ConexionesDemandaTab) sigue disponible

### Performance
- Los vinculos se validan en el frontend antes de enviar
- No hay llamadas API adicionales durante el registro (tipos_vinculo se cargan con dropdowns)
- La búsqueda de legajos usa el componente optimizado `LegajoSearchAutocomplete`

### UX Considerations
- Clear visual feedback for required fields
- Real-time character count for justification
- Easy add/remove vinculos
- Legajo search with autocomplete
- Medida selector only shows when legajo is selected
- Read-only mode respects existing functionality

### Error Handling
- Frontend validation prevents invalid submissions
- Backend omits invalid vinculos with warnings (graceful degradation)
- User sees clear error messages for validation failures
- Transaction rollback ensures data consistency

---

## 📝 Notas Adicionales

### CARGA_OFICIOS Workflow
Para el workflow CARGA_OFICIOS, el usuario típicamente:
1. Registra demanda con `objetivo_de_demanda = 'CARGA_OFICIOS'`
2. Especifica `tipo_oficio`
3. Agrega vínculos con legajo Y medida
4. Al enviar:
   - Backend crea demanda
   - Backend crea vínculos (legajo → demanda, legajo → medida)
   - Signal `crear_actividades_desde_oficio` crea actividades PLTM automáticamente

### Alternative: Vinculación Opcional Post-Creación
El usuario SIEMPRE puede:
1. Crear demanda sin vínculos
2. Ir a la tab "Conexiones" después
3. Usar `CrearVinculoLegajoDialog` para agregar vínculos

Esta implementación NO reemplaza el flujo existente, solo lo complementa con la opción de vincular durante el registro.

---

**Documento generado**: 2025-10-28
**Autor**: Claude Code Analysis
**Estado**: Propuesta de implementación completa
**Próximo paso**: Review y aprobación del plan
