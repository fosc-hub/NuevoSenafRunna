"use client"

import type React from "react"
import { useMemo, useState } from "react"
import {
  Box,
  Grid,
  TextField,
  FormControl,
  Autocomplete,
  Typography,
} from "@mui/material"
import { Controller, useFormContext, useWatch } from "react-hook-form"
import { useCatalogData, extractArray } from "@/hooks/useApiQuery"
import { useUserPermissions } from "@/app/(runna)/legajo-mesa/hooks/useUserPermissions"
import FormSection from "../components/form-section"
import AdjuntosSection from "../carga-oficios/components/AdjuntosSection"
import type { FormData, DropdownData } from "../types/formTypes"

interface Usuario {
  id: number
  username: string
  first_name: string
  last_name: string
  nombre_completo?: string
}

interface OficioJudicialMPEStepProps {
  dropdownData: DropdownData
  readOnly?: boolean
}

const OficioJudicialMPEStep: React.FC<OficioJudicialMPEStepProps> = ({
  dropdownData,
  readOnly = false,
}) => {
  const { control, setValue, watch } = useFormContext<FormData>()
  const { isLegales, isAdmin } = useUserPermissions()

  const { data: usuariosData } = useCatalogData<Usuario[]>("users/?is_active=true")
  const usuarios = extractArray(usuariosData) as Usuario[]

  // Watch motivo to filter submotivos
  const selectedMotivo = useWatch({ control, name: "motivo_ingreso" })

  // Watch localidad to filter barrio/cpc
  const selectedLocalidad = useWatch({ control, name: "localizacion.localidad" })

  // Watch categoria to filter tipo_oficio
  const selectedCategoria = useWatch({ control, name: "categoria_informacion_judicial" })

  const adjuntos = watch("adjuntos") || []

  const filteredSubmotivos = useMemo(() => {
    if (!selectedMotivo || !dropdownData.categoria_submotivo) return []
    return dropdownData.categoria_submotivo.filter(
      (s: any) => s.motivo === selectedMotivo
    )
  }, [selectedMotivo, dropdownData.categoria_submotivo])

  const filteredBarrios = useMemo(() => {
    if (!selectedLocalidad || !dropdownData.barrio) return []
    return dropdownData.barrio.filter(
      (b: any) => b.localidad === selectedLocalidad || b.localidad === Number(selectedLocalidad)
    )
  }, [selectedLocalidad, dropdownData.barrio])

  const filteredCPCs = useMemo(() => {
    if (!selectedLocalidad || !dropdownData.cpc) return []
    return dropdownData.cpc.filter(
      (c: any) => c.localidad === selectedLocalidad || c.localidad === Number(selectedLocalidad)
    )
  }, [selectedLocalidad, dropdownData.cpc])

  const filteredTipoOficio = useMemo(() => {
    if (!dropdownData.tipo_oficio) return []
    if (!selectedCategoria) return dropdownData.tipo_oficio
    return dropdownData.tipo_oficio.filter((t) => {
      const cat = t.categoria
      if (!cat) return false
      if (typeof cat === "object") return cat.id === selectedCategoria
      return cat === selectedCategoria
    })
  }, [selectedCategoria, dropdownData.tipo_oficio])

  return (
    <Box sx={{ maxWidth: "900px", mx: "auto" }}>
      {/* Datos del oficio */}
      <FormSection title="Datos del Oficio">
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Controller
              name="nombre"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  value={field.value || ""}
                  label="Nombre"
                  fullWidth
                  disabled={readOnly}
                  error={!!error}
                  helperText={error?.message}
                  InputProps={{ readOnly }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name="apellido"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  value={field.value || ""}
                  label="Apellido"
                  fullWidth
                  disabled={readOnly}
                  error={!!error}
                  helperText={error?.message}
                  InputProps={{ readOnly }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name="dni_oficio"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  value={field.value || ""}
                  label="DNI"
                  fullWidth
                  disabled={readOnly}
                  error={!!error}
                  helperText={error?.message}
                  InputProps={{ readOnly }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name="observaciones"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  value={field.value || ""}
                  label="Equipo de trabajo"
                  fullWidth
                  disabled={readOnly}
                  error={!!error}
                  helperText={error?.message}
                  InputProps={{ readOnly }}
                />
              )}
            />
          </Grid>
        </Grid>
      </FormSection>

      {/* Asignación de usuario — solo Legales */}
      {(isLegales || isAdmin) && (
        <FormSection title="Asignación">
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Controller
                name="user_responsable_id"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth error={!!error}>
                    <Autocomplete
                      disabled={readOnly}
                      options={usuarios}
                      getOptionLabel={(u) =>
                        u.nombre_completo ||
                        `${u.first_name} ${u.last_name}`.trim() ||
                        u.username
                      }
                      value={usuarios.find((u) => u.id === field.value) || null}
                      onChange={(_, newValue) =>
                        field.onChange(newValue ? newValue.id : null)
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Asignar usuario responsable"
                          error={!!error}
                          helperText={error?.message}
                        />
                      )}
                    />
                  </FormControl>
                )}
              />
            </Grid>
          </Grid>
        </FormSection>
      )}

      {/* Motivo y Submotivo */}
      <FormSection title="Motivo de Intervención">
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Controller
              name="motivo_ingreso"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <FormControl fullWidth error={!!error}>
                  <Autocomplete
                    disabled={readOnly}
                    options={dropdownData.categoria_motivo || []}
                    getOptionLabel={(option: any) => option.nombre || ""}
                    value={
                      dropdownData.categoria_motivo?.find(
                        (item: any) => item.id === field.value
                      ) || null
                    }
                    onChange={(_, newValue) =>
                      field.onChange(newValue ? newValue.id : null)
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Motivo de intervención"
                        error={!!error}
                        helperText={error?.message}
                      />
                    )}
                  />
                </FormControl>
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="submotivo_ingreso"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <FormControl fullWidth error={!!error}>
                  <Autocomplete
                    disabled={readOnly}
                    options={filteredSubmotivos}
                    getOptionLabel={(option: any) => option.nombre || ""}
                    value={
                      filteredSubmotivos.find((item: any) => item.id === field.value) || null
                    }
                    onChange={(_, newValue) =>
                      field.onChange(newValue ? newValue.id : null)
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Submotivo de intervención"
                        error={!!error}
                        helperText={
                          error?.message ||
                          (!selectedMotivo ? "Seleccione primero un motivo" : "")
                        }
                      />
                    )}
                  />
                </FormControl>
              )}
            />
          </Grid>
        </Grid>
      </FormSection>

      {/* Ubicación */}
      <FormSection title="Ubicación" collapsible defaultExpanded={false}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Controller
              name="localizacion.calle"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  value={field.value || ""}
                  label="Calle"
                  fullWidth
                  disabled={readOnly}
                  error={!!error}
                  helperText={error?.message}
                  InputProps={{ readOnly }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Controller
              name="localizacion.tipo_calle"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <FormControl fullWidth error={!!error}>
                  <Autocomplete
                    disabled={readOnly}
                    options={dropdownData.tipo_calle_choices || []}
                    getOptionLabel={(option: any) => option.value || ""}
                    value={
                      dropdownData.tipo_calle_choices?.find(
                        (item: any) => item.key === field.value
                      ) || null
                    }
                    onChange={(_, newValue) =>
                      field.onChange(newValue ? newValue.key : null)
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Tipo de Calle"
                        error={!!error}
                        helperText={error?.message}
                      />
                    )}
                  />
                </FormControl>
              )}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Controller
              name="localizacion.casa_nro"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  value={field.value || ""}
                  label="Altura"
                  fullWidth
                  disabled={readOnly}
                  error={!!error}
                  helperText={error?.message}
                  InputProps={{ readOnly }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Controller
              name="localizacion.piso_depto"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  value={field.value || ""}
                  label="Piso/Depto"
                  fullWidth
                  disabled={readOnly}
                  error={!!error}
                  helperText={error?.message}
                  InputProps={{ readOnly }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Controller
              name="localizacion.referencia_geo"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  value={field.value || ""}
                  label="Referencia Geográfica"
                  fullWidth
                  disabled={readOnly}
                  error={!!error}
                  helperText={error?.message}
                  InputProps={{ readOnly }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Controller
              name="localizacion.localidad"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <FormControl fullWidth error={!!error}>
                  <Autocomplete
                    disabled={readOnly}
                    options={dropdownData.localidad || []}
                    getOptionLabel={(option: any) => option.nombre || ""}
                    value={
                      dropdownData.localidad?.find(
                        (item: any) =>
                          item.id === field.value || item.id === Number(field.value)
                      ) || null
                    }
                    onChange={(_, newValue) =>
                      field.onChange(newValue ? newValue.id : null)
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Localidad"
                        error={!!error}
                        helperText={error?.message}
                      />
                    )}
                  />
                </FormControl>
              )}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Controller
              name="localizacion.barrio"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <FormControl fullWidth error={!!error}>
                  <Autocomplete
                    disabled={readOnly || !selectedLocalidad}
                    options={filteredBarrios}
                    getOptionLabel={(option: any) => option.nombre || ""}
                    value={
                      filteredBarrios.find(
                        (item: any) =>
                          item.id === field.value || item.id === Number(field.value)
                      ) || null
                    }
                    onChange={(_, newValue) =>
                      field.onChange(newValue ? newValue.id : null)
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Barrio"
                        error={!!error}
                        helperText={
                          error?.message ||
                          (!selectedLocalidad ? "Seleccione primero una localidad" : "")
                        }
                      />
                    )}
                  />
                </FormControl>
              )}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Controller
              name="localizacion.cpc"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <FormControl fullWidth error={!!error}>
                  <Autocomplete
                    disabled={readOnly || !selectedLocalidad}
                    options={filteredCPCs}
                    getOptionLabel={(option: any) => option.nombre || ""}
                    value={
                      filteredCPCs.find(
                        (item: any) =>
                          item.id === field.value || item.id === Number(field.value)
                      ) || null
                    }
                    onChange={(_, newValue) =>
                      field.onChange(newValue ? newValue.id : null)
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="CPC"
                        error={!!error}
                        helperText={
                          error?.message ||
                          (!selectedLocalidad ? "Seleccione primero una localidad" : "")
                        }
                      />
                    )}
                  />
                </FormControl>
              )}
            />
          </Grid>
        </Grid>
      </FormSection>

      {/* SAC / Expediente / Oficio web */}
      <FormSection title="Datos del Expediente">
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Controller
              name="nro_sac"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  value={field.value || ""}
                  label="SAC"
                  fullWidth
                  disabled={readOnly}
                  error={!!error}
                  helperText={error?.message}
                  InputProps={{ readOnly }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name="numero_expediente"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  value={field.value || ""}
                  label="Número de Expediente"
                  fullWidth
                  disabled={readOnly}
                  error={!!error}
                  helperText={error?.message}
                  InputProps={{ readOnly }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name="nro_oficio_web"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  value={field.value || ""}
                  label="Número de Oficio Web"
                  fullWidth
                  disabled={readOnly}
                  error={!!error}
                  helperText={error?.message}
                  InputProps={{ readOnly }}
                />
              )}
            />
          </Grid>
        </Grid>
      </FormSection>

      {/* Categoría de Oficio y Tipo de Oficio */}
      <FormSection title="Clasificación del Oficio">
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Controller
              name="categoria_informacion_judicial"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <FormControl fullWidth error={!!error}>
                  <Autocomplete
                    disabled={readOnly}
                    options={dropdownData.categoria_informacion_judicial || []}
                    getOptionLabel={(option: any) => option.nombre || ""}
                    value={
                      (dropdownData.categoria_informacion_judicial || []).find(
                        (item: any) => item.id === field.value
                      ) || null
                    }
                    onChange={(_, newValue) => {
                      field.onChange(newValue ? newValue.id : null)
                      setValue("tipo_oficio", undefined)
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Categoría de Oficio"
                        error={!!error}
                        helperText={
                          error?.message || "Seleccione la categoría para filtrar tipos"
                        }
                      />
                    )}
                  />
                </FormControl>
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name="tipo_oficio"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <FormControl fullWidth error={!!error}>
                  <Autocomplete
                    disabled={readOnly}
                    options={filteredTipoOficio}
                    getOptionLabel={(option: any) => option.nombre || ""}
                    value={
                      filteredTipoOficio.find(
                        (item: any) => item.id === field.value
                      ) || null
                    }
                    onChange={(_, newValue) =>
                      field.onChange(newValue ? newValue.id : null)
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Tipo de Oficio"
                        error={!!error}
                        helperText={
                          error?.message ||
                          (!selectedCategoria
                            ? "Seleccione primero una categoría"
                            : "")
                        }
                      />
                    )}
                  />
                </FormControl>
              )}
            />
          </Grid>
        </Grid>
      </FormSection>

      {/* Archivo adjunto */}
      <FormSection title="Archivos Adjuntos">
        <AdjuntosSection
          files={adjuntos}
          onFilesChange={(files) => setValue("adjuntos", files)}
          readOnly={readOnly}
        />
      </FormSection>
    </Box>
  )
}

export default OficioJudicialMPEStep
