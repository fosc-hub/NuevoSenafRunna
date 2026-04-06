"use client"

import type React from "react"
import { Box, Typography, TextField, Grid, Paper, Button, FormControl, InputLabel, Select, MenuItem, Autocomplete } from "@mui/material"
import { useState, useEffect, useRef } from "react"
import type { InformacionEducativa } from "../../../types/seguimiento-dispositivo"
import { seguimientoDispositivoService } from "../../../api/seguimiento-dispositivo-api-service"
import { toast } from "react-toastify"
import { fetchDropdownData } from "@/components/forms/utils/fetchFormCase"
import type { DropdownData } from "@/components/forms/types/formTypes"

interface InformacionEducativaSectionProps {
  medidaId?: number
  personaId?: number // Required for creating base TEducacion record
  data?: InformacionEducativa
  onUpdate?: (data: InformacionEducativa) => void
  readOnly?: boolean
}

export const InformacionEducativaSection: React.FC<InformacionEducativaSectionProps> = ({
  medidaId,
  personaId,
  data,
  onUpdate,
  readOnly = false
}) => {
  const [formData, setFormData] = useState<InformacionEducativa>(data || {})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [dataExists, setDataExists] = useState(false) // Track if data exists in backend
  const [dropdowns, setDropdowns] = useState<DropdownData | null>(null)
  const initialFormData = useRef<InformacionEducativa>({}) // Store initial values for change detection

  // Fetch dropdown data on mount
  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const dropdownData = await fetchDropdownData()
        setDropdowns(dropdownData)
      } catch (error) {
        console.error('Error loading dropdown data:', error)
      }
    }
    loadDropdowns()
  }, [])

  // Fetch data from API on mount
  useEffect(() => {
    if (medidaId) {
      fetchData()
    }
  }, [medidaId])

  const fetchData = async () => {
    if (!medidaId) return

    setLoading(true)
    try {
      const apiData = await seguimientoDispositivoService.getInformacionEducativa(medidaId)
      if (apiData) {
        setFormData(apiData)
        initialFormData.current = apiData // Store initial values for change detection
        setDataExists(true) // Data exists, use PATCH
      } else {
        // No data exists, use POST when saving
        setDataExists(false)
        if (data) {
          // Fallback to demanda data if no API data exists
          setFormData(data)
          initialFormData.current = data
        }
      }
    } catch (error) {
      console.error('Error fetching información educativa:', error)
      setDataExists(false)
      // Fallback to demanda data on error
      if (data) {
        setFormData(data)
        initialFormData.current = data
      }
    } finally {
      setLoading(false)
    }
  }

  const handleFieldChange = (field: keyof InformacionEducativa, value: string | number | undefined) => {
    const updated = { ...formData, [field]: value }
    setFormData(updated)
  }

  /**
   * Extract only modified fields by comparing current formData with initial values
   * This ensures PATCH semantics - only send changed fields
   */
  const getModifiedFields = (): Partial<InformacionEducativa> => {
    const initial = initialFormData.current
    const current = formData
    const modified: Partial<InformacionEducativa> = {}

    // Helper to check if value changed (handles empty strings vs null/undefined)
    const hasChanged = (currentVal: any, initialVal: any): boolean => {
      const normalizeCurrent = currentVal === '' ? null : currentVal
      const normalizeInitial = initialVal === '' ? null : initialVal
      return normalizeCurrent !== normalizeInitial
    }

    // Check each field
    if (hasChanged(current.nivel_educativo, initial.nivel_educativo)) {
      modified.nivel_educativo = current.nivel_educativo
    }
    if (hasChanged(current.institucion_educativa_id, initial.institucion_educativa_id)) {
      modified.institucion_educativa_id = current.institucion_educativa_id
    }
    if (hasChanged(current.grado_curso, initial.grado_curso)) {
      modified.grado_curso = current.grado_curso
    }
    if (hasChanged(current.observaciones, initial.observaciones)) {
      modified.observaciones = current.observaciones
    }
    if (hasChanged(current.fecha_actualizacion, initial.fecha_actualizacion)) {
      modified.fecha_actualizacion = current.fecha_actualizacion
    }

    return modified
  }

  const handleSave = async () => {
    if (!medidaId) {
      toast.error('Error: medidaId no disponible')
      return
    }

    if (!dataExists && !personaId) {
      toast.error('Error: personaId no disponible para crear registro')
      return
    }

    setSaving(true)
    try {
      let updated: InformacionEducativa

      if (dataExists) {
        // Data exists, use PATCH with only modified fields
        const modifiedFields = getModifiedFields()

        // Check if there are any changes
        if (Object.keys(modifiedFields).length === 0) {
          toast.info('No hay cambios para guardar')
          setSaving(false)
          return
        }

        updated = await seguimientoDispositivoService.updateInformacionEducativa(medidaId, modifiedFields)
      } else {
        // No data exists, use POST to create base record + PATCH
        updated = await seguimientoDispositivoService.createInformacionEducativa(medidaId, personaId!, formData)
        setDataExists(true) // Now data exists for future saves
      }

      // Update local state with response and store as new initial values
      setFormData(updated)
      initialFormData.current = updated
      onUpdate?.(updated)
    } catch (error) {
      console.error('Error saving información educativa:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Cargando información educativa...</Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h6" align="center" sx={{ fontWeight: 600, mb: 2 }}>
        Información Educativa
      </Typography>
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Autocomplete
              options={dropdowns?.nivel_alcanzado_choices || dropdowns?.nivel_educativo_choices || []}
              getOptionLabel={(option: any) => option.value || ''}
              value={
                (dropdowns?.nivel_alcanzado_choices || dropdowns?.nivel_educativo_choices || [])
                  .find((item: any) => item.key === formData.nivel_educativo) || null
              }
              onChange={(_, newValue) => handleFieldChange('nivel_educativo', newValue?.key || '')}
              renderInput={(params) => (
                <TextField {...params} label="Nivel Educativo" size="small" />
              )}
              size="small"
              disabled={readOnly}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Autocomplete
              options={dropdowns?.instituciones_educativas || dropdowns?.institucion_educativa || []}
              getOptionLabel={(option: any) => option.nombre || ''}
              value={
                (dropdowns?.instituciones_educativas || dropdowns?.institucion_educativa || [])
                  .find((item: any) => item.id === formData.institucion_educativa_id) || null
              }
              onChange={(_, newValue) => {
                setFormData(prev => ({
                  ...prev,
                  institucion_educativa_id: newValue?.id,
                  establecimiento: newValue?.nombre || ''
                }))
              }}
              renderInput={(params) => (
                <TextField {...params} label="Establecimiento" size="small" />
              )}
              size="small"
              disabled={readOnly}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Autocomplete
              options={dropdowns?.ultimo_cursado_choices || []}
              getOptionLabel={(option: any) => option.value || ''}
              value={
                (dropdowns?.ultimo_cursado_choices || [])
                  .find((item: any) => item.key === formData.grado_curso) || null
              }
              onChange={(_, newValue) => handleFieldChange('grado_curso', newValue?.key || '')}
              renderInput={(params) => (
                <TextField {...params} label="Grado/Curso" size="small" />
              )}
              size="small"
              disabled={readOnly}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="date"
              label="Fecha de Actualización"
              value={formData.fecha_actualizacion || ''}
              onChange={(e) => handleFieldChange('fecha_actualizacion', e.target.value)}
              size="small"
              disabled={readOnly}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Observaciones"
              value={formData.observaciones || ''}
              onChange={(e) => handleFieldChange('observaciones', e.target.value)}
              disabled={readOnly}
            />
          </Grid>
          {!readOnly && medidaId && (
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                disabled={saving}
                sx={{ textTransform: 'none', borderRadius: 2 }}
              >
                {saving ? 'Guardando...' : 'Guardar Información Educativa'}
              </Button>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Box>
  )
}
