"use client"

/**
 * CargaOficiosForm - Main form container for CARGA_OFICIOS judicial documents
 *
 * A single scrollable form with multiple sections:
 * 1. Clasificación - Circuito, Fechas (oficio/ingreso SENAF), Categoría/Tipo
 * 2. Origen del Oficio - Tipo Organismo, Organismo, Departamento Judicial
 * 3. Expediente - SAC, Nro Oficio, Autos, Plazo, Presuntos Delitos, Descripción
 * 4. Localización - Dirección del NNyA
 * 5. Adjuntos - FileUploadSection
 */

import type React from "react"
import { useEffect, useMemo, useRef } from "react"
import {
  Box,
  Paper,
  Typography,
  Grid,
  Alert,
  Skeleton,
  Autocomplete,
  TextField,
} from "@mui/material"
import {
  Category as CategoryIcon,
  AccountBalance as AccountBalanceIcon,
  Description as DescriptionIcon,
  AttachFile as AttachFileIcon,
  Gavel as GavelIcon,
  LocationOn as LocationIcon,
  Link as LinkIcon,
} from "@mui/icons-material"
import { Controller, useFormContext } from "react-hook-form"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import { parseDateSafely, formatDateSafely } from "../utils/dateUtils"

// Components
import CircuitoSelector from "./components/CircuitoSelector"
import CategoriaInfoSection from "./components/CategoriaInfoSection"
import OrganoJudicialSection from "./components/OrganoJudicialSection"
import ExpedienteSection from "./components/ExpedienteSection"
import LocalizacionOficioSection from "./components/LocalizacionOficioSection"
import AdjuntosSection from "./components/AdjuntosSection"
import VinculosManager from "../components/VinculosManager"

// Hooks
import { useCargaOficiosDropdowns } from "./hooks/useCargaOficiosDropdowns"
import { useAdjuntosManager } from "./hooks/useAdjuntosManager"

// Types
import type { CargaOficiosFormData } from "./types/carga-oficios.types"
import type { DropdownData } from "../types/formTypes"

/**
 * FormSection - Reusable section wrapper with title and icon
 */
interface FormSectionProps {
  title: string
  icon: React.ElementType
  children: React.ReactNode
}

const FormSection: React.FC<FormSectionProps> = ({ title, icon: Icon, children }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 3,
        borderRadius: "12px",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          mb: 3,
          color: "primary.main",
        }}
      >
        <Icon sx={{ fontSize: 24 }} />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
      </Box>
      {children}
    </Paper>
  )
}

/**
 * LoadingSkeleton - Skeleton for loading state
 */
const LoadingSkeleton: React.FC = () => {
  return (
    <Box>
      {[1, 2, 3, 4].map((i) => (
        <Paper key={i} elevation={0} sx={{ p: 3, mb: 3, borderRadius: "12px", border: "1px solid", borderColor: "divider" }}>
          <Skeleton variant="text" width={200} height={32} sx={{ mb: 2 }} />
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Skeleton variant="rounded" height={56} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Skeleton variant="rounded" height={56} />
            </Grid>
          </Grid>
        </Paper>
      ))}
    </Box>
  )
}

interface CargaOficiosFormInternalProps {
  dropdownData: DropdownData
  readOnly?: boolean
}

const CargaOficiosForm: React.FC<CargaOficiosFormInternalProps> = ({
  dropdownData,
  readOnly = false,
}) => {
  const { control, watch, setValue } = useFormContext<CargaOficiosFormData>()

  // Get CARGA_OFICIOS specific dropdowns from main dropdownData
  const {
    categorias,
    tipos,
    isLoading: isLoadingDropdowns,
    isError: isDropdownError,
    getTiposByCategoria,
  } = useCargaOficiosDropdowns({
    categorias: dropdownData.categoria_informacion_judicial || [],
    tipos: dropdownData.tipo_informacion_judicial || [],
  })

  // Watch form values
  const watchedCircuito = watch("tipo_medida_evaluado")
  const watchedCategoria = watch("categoria_informacion_judicial")
  const watchedAdjuntos = watch("adjuntos") || []

  // Track previous categoria to detect changes
  const prevCategoriaRef = useRef(watchedCategoria)

  // Filter tipo_oficio by selected categoria
  const filteredTipoOficio = useMemo(() => {
    if (!watchedCategoria) return []
    return (dropdownData.tipo_oficio || []).filter((t) => t.categoria === watchedCategoria)
  }, [watchedCategoria, dropdownData.tipo_oficio])

  // Clear tipo_oficio when categoria changes
  useEffect(() => {
    if (prevCategoriaRef.current !== watchedCategoria && prevCategoriaRef.current !== undefined) {
      // Categoria changed, clear tipo_oficio
      setValue("tipo_oficio", null)
    }
    prevCategoriaRef.current = watchedCategoria
  }, [watchedCategoria, setValue])

  // Adjuntos manager
  const adjuntosManager = useAdjuntosManager({
    initialFiles: watchedAdjuntos,
    onFilesChange: (files) => {
      setValue("adjuntos", files as CargaOficiosFormData["adjuntos"])
    },
  })

  // Sync adjuntos with form state
  useEffect(() => {
    if (JSON.stringify(watchedAdjuntos) !== JSON.stringify(adjuntosManager.files)) {
      // Form was updated externally (e.g., draft restore)
      // This would require reinitializing the adjuntos manager
    }
  }, [watchedAdjuntos])

  // Filtered tipos based on selected categoria
  const filteredTipos = useMemo(() => {
    return getTiposByCategoria(watchedCategoria)
  }, [watchedCategoria, getTiposByCategoria])

  if (isLoadingDropdowns) {
    return <LoadingSkeleton />
  }

  if (isDropdownError) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        Error al cargar los datos del formulario. Por favor, intente nuevamente.
      </Alert>
    )
  }

  return (
    <Box sx={{ maxWidth: "1200px", mx: "auto", p: 2 }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: "12px",
          bgcolor: "success.dark",
          color: "white",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
          <GavelIcon sx={{ fontSize: 32 }} />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Carga de Oficios Judiciales
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          Complete la información del oficio judicial. Los campos marcados con{" "}
          <strong>*</strong> son obligatorios.
        </Typography>
      </Paper>

      {/* Section 1: Clasificación */}
      <FormSection title="Clasificación de la Medida" icon={CategoryIcon}>
        <Grid container spacing={3}>
          {/* Circuito Selector */}
          <Grid item xs={12} md={6}>
            <Controller
              name="tipo_medida_evaluado"
              control={control}
              rules={{ required: "El circuito es obligatorio" }}
              render={({ field, fieldState: { error } }) => (
                <CircuitoSelector
                  value={field.value}
                  onChange={(value) => field.onChange(value)}
                  disabled={readOnly}
                  error={!!error}
                  helperText={error?.message}
                />
              )}
            />
          </Grid>

          {/* Fecha del Oficio */}
          <Grid item xs={12} md={6}>
            <Controller
              name="fecha_oficio_documento"
              control={control}
              rules={{ required: "La fecha del oficio es obligatoria" }}
              render={({ field, fieldState: { error } }) => (
                <DatePicker
                  label="Fecha del Oficio *"
                  disabled={readOnly}
                  value={parseDateSafely(field.value)}
                  onChange={(date) => field.onChange(formatDateSafely(date))}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: !!error,
                      helperText: error?.message,
                      size: "medium",
                    },
                  }}
                />
              )}
            />
          </Grid>

          {/* Fecha Ingreso SENAF */}
          <Grid item xs={12} md={6}>
            <Controller
              name="fecha_ingreso_senaf"
              control={control}
              rules={{ required: "La fecha de ingreso a SENAF es obligatoria" }}
              render={({ field, fieldState: { error } }) => (
                <DatePicker
                  label="Fecha Ingreso SENAF *"
                  disabled={readOnly}
                  value={parseDateSafely(field.value)}
                  onChange={(date) => field.onChange(formatDateSafely(date))}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: !!error,
                      helperText: error?.message || "Fecha en que el oficio llega a SENAF",
                      size: "medium",
                    },
                  }}
                />
              )}
            />
          </Grid>

          {/* Categoría dropdown */}
          <Grid item xs={12} md={6}>
            <CategoriaInfoSection
              categorias={categorias}
              selectedCategoria={watchedCategoria}
              onCategoriaChange={(value) => setValue("categoria_informacion_judicial", value)}
              readOnly={readOnly}
            />
          </Grid>

          {/* Tipo de Oficio - Filtered by selected categoria */}
          <Grid item xs={12} md={6}>
            <Controller
              name="tipo_oficio"
              control={control}
              rules={{ required: "El tipo de oficio es obligatorio" }}
              render={({ field, fieldState: { error } }) => (
                <Autocomplete
                  disabled={readOnly || !watchedCategoria}
                  options={filteredTipoOficio}
                  getOptionLabel={(option) => option.nombre || ""}
                  value={filteredTipoOficio.find((t) => t.id === field.value) || null}
                  onChange={(_, newValue) => field.onChange(newValue ? newValue.id : null)}
                  isOptionEqualToValue={(option, value) => option.id === value?.id}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Tipo de Oficio *"
                      required
                      error={!!error}
                      helperText={
                        error?.message ||
                        (!watchedCategoria
                          ? "Seleccione primero una categoría"
                          : "Seleccione el tipo de oficio judicial")
                      }
                      placeholder="Seleccione el tipo de oficio"
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props} sx={{ py: 1.5, px: 2 }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {option.nombre}
                        </Typography>
                        {option.descripcion && (
                          <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                            {option.descripcion}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  )}
                  noOptionsText={
                    watchedCategoria
                      ? "No se encontraron tipos de oficio para esta categoría"
                      : "Seleccione una categoría primero"
                  }
                />
              )}
            />
          </Grid>
        </Grid>
      </FormSection>

      {/* Section 2: Origen del Oficio */}
      <FormSection title="Origen del Oficio" icon={AccountBalanceIcon}>
        <OrganoJudicialSection
          bloquesRemitente={dropdownData.bloques_datos_remitente || []}
          tipoInstitucionDemanda={dropdownData.tipo_institucion_demanda || []}
          departamentoJudicialChoices={dropdownData.departamento_judicial_choices || [
            { key: "CAPITAL", value: "Capital" },
            { key: "INTERIOR", value: "Interior" },
          ]}
          readOnly={readOnly}
        />
      </FormSection>

      {/* Section 3: Detalles del Expediente */}
      <FormSection title="Detalles del Expediente" icon={DescriptionIcon}>
        <ExpedienteSection readOnly={readOnly} />
      </FormSection>

      {/* Section 4: Localización del NNyA */}
      <FormSection title="Localización del NNyA" icon={LocationIcon}>
        <LocalizacionOficioSection
          dropdownData={{
            localidad: dropdownData.localidad,
            barrio: dropdownData.barrio,
            cpc: dropdownData.cpc,
            tipo_calle_choices: dropdownData.tipo_calle_choices,
          }}
          readOnly={readOnly}
        />
      </FormSection>

      {/* Section 5: Vínculos con Legajos y Medidas */}
      <FormSection title="Vínculos con Legajos y Medidas" icon={LinkIcon}>
        <VinculosManager
          dropdownData={dropdownData}
          readOnly={readOnly}
        />
      </FormSection>

      {/* Section 6: Adjuntos */}
      <FormSection title="Documentos Adjuntos" icon={AttachFileIcon}>
        <AdjuntosSection
          files={adjuntosManager.files}
          onFilesChange={(files) => {
            adjuntosManager.clearFiles()
            files.forEach((file) => {
              if (file instanceof File) {
                adjuntosManager.addFile(file)
              }
            })
          }}
          readOnly={readOnly}
          isUploading={adjuntosManager.isUploading}
        />
      </FormSection>
    </Box>
  )
}

export default CargaOficiosForm
