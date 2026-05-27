"use client"

/**
 * OrganoJudicialSection - Origen del Oficio
 *
 * Tres campos en cascada (jerarquía judicial):
 *   1. Tipo Órgano Judicial   (bloque_datos_remitente)        — OBLIGATORIO
 *   2. Circunscripción Judicial (circunscripcion_judicial FK) — OBLIGATORIO
 *   3. Órgano Judicial        (institucion / tipo_institucion_demanda) — OBLIGATORIO
 *
 * Los 3 niveles vienen del endpoint /api/registro-demanda-form-dropdowns/.
 * Cada órgano (TTipoInstitucionDemanda) trae `circunscripcion_judicial` que
 * permite el filtro en cascada Tipo+Circunscripción → Órgano.
 */

import type React from "react"
import { useMemo } from "react"
import { Box, Grid, TextField, Autocomplete } from "@mui/material"
import { Controller, useFormContext } from "react-hook-form"
import type { OrganoJudicialSectionProps, CargaOficiosFormData } from "../types/carga-oficios.types"

const OrganoJudicialSection: React.FC<OrganoJudicialSectionProps> = ({
  bloquesRemitente,
  circunscripcionesJudiciales,
  tipoInstitucionDemanda,
  readOnly = false,
}) => {
  const { control, watch, setValue } = useFormContext<CargaOficiosFormData>()

  const watchedBloqueRemitente = watch("bloque_datos_remitente")
  const watchedCircunscripcion = watch("circunscripcion_judicial")

  // Circunscripciones que efectivamente tienen al menos un órgano del Tipo
  // seleccionado — evita mostrar opciones vacías.
  const circunscripcionesDisponibles = useMemo(() => {
    if (!watchedBloqueRemitente) return circunscripcionesJudiciales
    const validIds = new Set<number>()
    for (const inst of tipoInstitucionDemanda) {
      const bloqueId = inst.bloque_datos_remitente_id ?? inst.bloque_datos_remitente
      if (bloqueId !== watchedBloqueRemitente) continue
      if (inst.circunscripcion_judicial) validIds.add(inst.circunscripcion_judicial)
    }
    return circunscripcionesJudiciales.filter((c) => validIds.has(c.id))
  }, [watchedBloqueRemitente, circunscripcionesJudiciales, tipoInstitucionDemanda])

  // Órganos filtrados por Tipo + Circunscripción
  const filteredInstituciones = useMemo(() => {
    if (!watchedBloqueRemitente || !watchedCircunscripcion) return []
    return tipoInstitucionDemanda.filter((inst) => {
      const bloqueId = inst.bloque_datos_remitente_id ?? inst.bloque_datos_remitente
      if (bloqueId !== watchedBloqueRemitente) return false
      return inst.circunscripcion_judicial === watchedCircunscripcion
    })
  }, [watchedBloqueRemitente, watchedCircunscripcion, tipoInstitucionDemanda])

  return (
    <Box>
      <Grid container spacing={3}>
        {/* 1. Tipo Órgano Judicial */}
        <Grid item xs={12}>
          <Controller
            name="bloque_datos_remitente"
            control={control}
            rules={{ required: "El tipo de órgano judicial es obligatorio" }}
            render={({ field, fieldState: { error } }) => (
              <Autocomplete
                disabled={readOnly}
                options={bloquesRemitente}
                getOptionLabel={(option) => option.nombre || ""}
                value={bloquesRemitente.find((b) => b.id === field.value) || null}
                onChange={(_, newValue) => {
                  field.onChange(newValue ? newValue.id : null)
                  // Cambiar Tipo invalida Circunscripción y Órgano
                  setValue("circunscripcion_judicial", null)
                  setValue("institucion", null)
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Tipo Órgano Judicial *"
                    required
                    error={!!error}
                    helperText={error?.message}
                    placeholder="Seleccione el tipo de órgano judicial"
                  />
                )}
              />
            )}
          />
        </Grid>

        {/* 2. Circunscripción Judicial (filtrada por Tipo) */}
        <Grid item xs={12}>
          <Controller
            name="circunscripcion_judicial"
            control={control}
            rules={{ required: "La circunscripción judicial es obligatoria" }}
            render={({ field, fieldState: { error } }) => (
              <Autocomplete
                disabled={readOnly || !watchedBloqueRemitente}
                options={circunscripcionesDisponibles}
                getOptionLabel={(option) => option.nombre || ""}
                value={
                  circunscripcionesJudiciales.find((c) => c.id === field.value) || null
                }
                onChange={(_, newValue) => {
                  field.onChange(newValue ? newValue.id : null)
                  // Cambiar Circunscripción invalida Órgano
                  setValue("institucion", null)
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Circunscripción Judicial *"
                    required
                    error={!!error}
                    helperText={
                      error?.message ||
                      (!watchedBloqueRemitente
                        ? "Primero seleccione un Tipo Órgano Judicial"
                        : `${circunscripcionesDisponibles.length} circunscripciones disponibles`)
                    }
                    placeholder="Seleccione la circunscripción judicial"
                  />
                )}
                noOptionsText={
                  !watchedBloqueRemitente
                    ? "Seleccione primero un Tipo Órgano Judicial"
                    : "No hay circunscripciones para este tipo"
                }
              />
            )}
          />
        </Grid>

        {/* 3. Órgano Judicial (filtrado por Tipo + Circunscripción) */}
        <Grid item xs={12}>
          <Controller
            name="institucion"
            control={control}
            rules={{ required: "El órgano judicial es obligatorio" }}
            render={({ field, fieldState: { error } }) => (
              <Autocomplete
                disabled={readOnly || !watchedBloqueRemitente || !watchedCircunscripcion}
                options={filteredInstituciones}
                getOptionLabel={(option) => option.nombre || ""}
                value={filteredInstituciones.find((i) => i.id === field.value) || null}
                onChange={(_, newValue) => field.onChange(newValue ? newValue.id : null)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Órgano Judicial *"
                    required
                    error={!!error}
                    helperText={
                      error?.message ||
                      (!watchedBloqueRemitente
                        ? "Primero seleccione un Tipo Órgano Judicial"
                        : !watchedCircunscripcion
                          ? "Seleccione una Circunscripción Judicial"
                          : `${filteredInstituciones.length} órganos disponibles`)
                    }
                    placeholder="Seleccione el órgano judicial"
                  />
                )}
                noOptionsText={
                  !watchedBloqueRemitente
                    ? "Seleccione primero un Tipo Órgano Judicial"
                    : !watchedCircunscripcion
                      ? "Seleccione primero una Circunscripción Judicial"
                      : "No hay órganos para esta combinación"
                }
              />
            )}
          />
        </Grid>
      </Grid>
    </Box>
  )
}

export default OrganoJudicialSection
