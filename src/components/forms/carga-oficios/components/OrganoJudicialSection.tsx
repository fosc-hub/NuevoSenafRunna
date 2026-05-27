"use client"

/**
 * OrganoJudicialSection - Origen del Oficio section
 *
 * Tres campos en cascada (jerarquía):
 *   1. Tipo Órgano Judicial   (bloque_datos_remitente) — OBLIGATORIO
 *   2. Circunscripción Judicial — OBLIGATORIO (client-side, ver constants/circunscripcionesJudiciales.ts)
 *   3. Órgano Judicial        (institucion / tipo_institucion_demanda) — OBLIGATORIO, filtrado por 1 y 2
 *
 * NOTA: hasta que el backend agregue `TCircunscripcionJudicial` + FK en
 * TTipoInstitucionDemanda, el filtro por circunscripción se resuelve en el
 * cliente vía ORGANO_TO_CIRCUNSCRIPCION. El backend sigue recibiendo el mismo
 * payload (`bloque_datos_remitente` + `institucion`).
 */

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { Box, Grid, TextField, Autocomplete } from "@mui/material"
import { Controller, useFormContext } from "react-hook-form"
import type { OrganoJudicialSectionProps, CargaOficiosFormData } from "../types/carga-oficios.types"
import {
  CIRCUNSCRIPCIONES_JUDICIALES,
  ORGANO_TO_CIRCUNSCRIPCION,
} from "../constants/circunscripcionesJudiciales"

const OrganoJudicialSection: React.FC<OrganoJudicialSectionProps> = ({
  bloquesRemitente,
  tipoInstitucionDemanda,
  readOnly = false,
}) => {
  const { control, watch, setValue } = useFormContext<CargaOficiosFormData>()

  const watchedBloqueRemitente = watch("bloque_datos_remitente")
  const watchedInstitucion = watch("institucion")

  // Circunscripción seleccionada: estado local (no se persiste al backend hasta
  // que exista FK; se infiere de la institucion ya guardada al editar).
  const [circunscripcionId, setCircunscripcionId] = useState<number | null>(() =>
    watchedInstitucion ? ORGANO_TO_CIRCUNSCRIPCION[watchedInstitucion] ?? null : null,
  )

  // Si el form se rehidrata con un institucion preexistente, sincronizar la circ.
  useEffect(() => {
    if (watchedInstitucion && circunscripcionId == null) {
      const inferred = ORGANO_TO_CIRCUNSCRIPCION[watchedInstitucion]
      if (inferred) setCircunscripcionId(inferred)
    }
  }, [watchedInstitucion, circunscripcionId])

  // Circunscripciones disponibles según el Tipo Órgano elegido — solo aquellas
  // que tengan al menos un órgano del tipo seleccionado.
  const circunscripcionesDisponibles = useMemo(() => {
    if (!watchedBloqueRemitente) return CIRCUNSCRIPCIONES_JUDICIALES
    const validIds = new Set<number>()
    for (const inst of tipoInstitucionDemanda) {
      const bloqueId = inst.bloque_datos_remitente_id ?? inst.bloque_datos_remitente
      if (bloqueId !== watchedBloqueRemitente) continue
      const circId = ORGANO_TO_CIRCUNSCRIPCION[inst.id]
      if (circId) validIds.add(circId)
    }
    return CIRCUNSCRIPCIONES_JUDICIALES.filter((c) => validIds.has(c.id))
  }, [watchedBloqueRemitente, tipoInstitucionDemanda])

  // Órganos filtrados por Tipo + Circunscripción
  const filteredInstituciones = useMemo(() => {
    if (!watchedBloqueRemitente || !circunscripcionId) return []
    return tipoInstitucionDemanda.filter((inst) => {
      const bloqueId = inst.bloque_datos_remitente_id ?? inst.bloque_datos_remitente
      if (bloqueId !== watchedBloqueRemitente) return false
      return ORGANO_TO_CIRCUNSCRIPCION[inst.id] === circunscripcionId
    })
  }, [watchedBloqueRemitente, circunscripcionId, tipoInstitucionDemanda])

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
                  setCircunscripcionId(null)
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
          <Autocomplete
            disabled={readOnly || !watchedBloqueRemitente}
            options={circunscripcionesDisponibles}
            getOptionLabel={(option) => option.nombre || ""}
            value={
              CIRCUNSCRIPCIONES_JUDICIALES.find((c) => c.id === circunscripcionId) || null
            }
            onChange={(_, newValue) => {
              setCircunscripcionId(newValue ? newValue.id : null)
              // Cambiar Circunscripción invalida Órgano
              setValue("institucion", null)
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Circunscripción Judicial *"
                required
                helperText={
                  !watchedBloqueRemitente
                    ? "Primero seleccione un Tipo Órgano Judicial"
                    : `${circunscripcionesDisponibles.length} circunscripciones disponibles`
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
        </Grid>

        {/* 3. Órgano Judicial (filtrado por Tipo + Circunscripción) */}
        <Grid item xs={12}>
          <Controller
            name="institucion"
            control={control}
            rules={{ required: "El órgano judicial es obligatorio" }}
            render={({ field, fieldState: { error } }) => (
              <Autocomplete
                disabled={readOnly || !watchedBloqueRemitente || !circunscripcionId}
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
                        : !circunscripcionId
                          ? "Seleccione una Circunscripción Judicial"
                          : `${filteredInstituciones.length} órganos disponibles`)
                    }
                    placeholder="Seleccione el órgano judicial"
                  />
                )}
                noOptionsText={
                  !watchedBloqueRemitente
                    ? "Seleccione primero un Tipo Órgano Judicial"
                    : !circunscripcionId
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
