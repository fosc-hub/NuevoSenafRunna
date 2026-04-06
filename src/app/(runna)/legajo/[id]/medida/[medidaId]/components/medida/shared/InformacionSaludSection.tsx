"use client"

import type React from "react"
import { Box, Typography, TextField, Grid, Paper, FormControlLabel, Checkbox, Button, FormControl, InputLabel, Select, MenuItem, Autocomplete } from "@mui/material"
import { useState, useEffect, useRef } from "react"
import type { InformacionSalud } from "../../../types/seguimiento-dispositivo"
import { seguimientoDispositivoService } from "../../../api/seguimiento-dispositivo-api-service"
import { toast } from "react-toastify"
import { fetchDropdownData } from "@/components/forms/utils/fetchFormCase"
import type { DropdownData } from "@/components/forms/types/formTypes"

interface InformacionSaludSectionProps {
  medidaId?: number
  personaId?: number // Required for creating base cobertura médica record
  data?: InformacionSalud
  onUpdate?: (data: InformacionSalud) => void
  readOnly?: boolean
}

export const InformacionSaludSection: React.FC<InformacionSaludSectionProps> = ({
  medidaId,
  personaId,
  data,
  onUpdate,
  readOnly = false
}) => {
  const [formData, setFormData] = useState<InformacionSalud>(data || {})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [dataExists, setDataExists] = useState(false) // Track if data exists in backend
  const [dropdowns, setDropdowns] = useState<DropdownData | null>(null)
  const initialFormData = useRef<InformacionSalud>({}) // Store initial values for change detection

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
      const apiData = await seguimientoDispositivoService.getInformacionSalud(medidaId)
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
      console.error('Error fetching información de salud:', error)
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

  const handleFieldChange = (field: keyof InformacionSalud, value: string | boolean | undefined) => {
    const updated = { ...formData, [field]: value }
    setFormData(updated)
  }

  /**
   * Extract only modified fields by comparing current formData with initial values
   * This ensures PATCH semantics - only send changed fields
   */
  const getModifiedFields = (): Partial<InformacionSalud> => {
    const initial = initialFormData.current
    const current = formData
    const modified: Partial<InformacionSalud> = {}

    // Helper to check if value changed (handles empty strings vs null/undefined)
    const hasChanged = (currentVal: any, initialVal: any): boolean => {
      const normalizeCurrent = currentVal === '' ? null : currentVal
      const normalizeInitial = initialVal === '' ? null : initialVal
      return normalizeCurrent !== normalizeInitial
    }

    // Check each field (only fields that exist in API)
    if (hasChanged(current.obra_social, initial.obra_social)) {
      modified.obra_social = current.obra_social
    }
    if (hasChanged(current.intervencion, initial.intervencion)) {
      modified.intervencion = current.intervencion
    }
    if (hasChanged(current.auh, initial.auh)) {
      modified.auh = current.auh
    }
    if (hasChanged(current.institucion_sanitaria_id, initial.institucion_sanitaria_id)) {
      modified.institucion_sanitaria_id = current.institucion_sanitaria_id
    }
    if (hasChanged(current.observaciones, initial.observaciones)) {
      modified.observaciones = current.observaciones
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
      let updated: InformacionSalud

      if (dataExists) {
        // Data exists, use PATCH with only modified fields
        const modifiedFields = getModifiedFields()

        // Check if there are any changes
        if (Object.keys(modifiedFields).length === 0) {
          toast.info('No hay cambios para guardar')
          setSaving(false)
          return
        }

        updated = await seguimientoDispositivoService.updateInformacionSalud(medidaId, modifiedFields)
      } else {
        // No data exists, use POST to create base record + PATCH
        updated = await seguimientoDispositivoService.createInformacionSalud(medidaId, personaId!, formData)
        setDataExists(true) // Now data exists for future saves
      }

      // Update local state with response and store as new initial values
      setFormData(updated)
      initialFormData.current = updated
      onUpdate?.(updated)
    } catch (error) {
      console.error('Error saving información de salud:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Cargando información de salud...</Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h6" align="center" sx={{ fontWeight: 600, mb: 2 }}>
        Información de Salud
      </Typography>
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Autocomplete
              options={dropdowns?.obra_social_choices || []}
              getOptionLabel={(option: any) => option.value || ''}
              value={
                (dropdowns?.obra_social_choices || [])
                  .find((item: any) => item.key === formData.obra_social) || null
              }
              onChange={(_, newValue) => handleFieldChange('obra_social', newValue?.key || '')}
              renderInput={(params) => (
                <TextField {...params} label="Obra Social" size="small" />
              )}
              size="small"
              disabled={readOnly}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Autocomplete
              options={dropdowns?.intervencion_choices || []}
              getOptionLabel={(option: any) => option.value || ''}
              value={
                (dropdowns?.intervencion_choices || [])
                  .find((item: any) => item.key === formData.intervencion) || null
              }
              onChange={(_, newValue) => handleFieldChange('intervencion', newValue?.key || '')}
              renderInput={(params) => (
                <TextField {...params} label="Intervención" size="small" />
              )}
              size="small"
              disabled={readOnly}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Centro de Salud"
              value={formData.centro_salud || ''}
              size="small"
              disabled={true}
              placeholder="No asignado"
              helperText="Campo de solo lectura - establecido en registro de demanda"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.auh || false}
                    onChange={(e) => handleFieldChange('auh', e.target.checked)}
                    disabled={readOnly}
                  />
                }
                label="AUH (Asignación Universal por Hijo)"
              />
            </Box>
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
                {saving ? 'Guardando...' : 'Guardar Información de Salud'}
              </Button>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Box>
  )
}
