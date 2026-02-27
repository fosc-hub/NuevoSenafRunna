"use client"

/**
 * ConfiguracionMPESection Component
 *
 * Displays and allows editing of MPE device configuration.
 * Shows tipo_dispositivo, subtipo_dispositivo (institution/family),
 * and configuration metadata (date, user).
 *
 * Only rendered when tipo_medida === 'MPE'
 */

import React, { useState, useEffect } from "react"
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
} from "@mui/material"
import HomeIcon from "@mui/icons-material/Home"
import EditIcon from "@mui/icons-material/Edit"
import SettingsIcon from "@mui/icons-material/Settings"
import CloseIcon from "@mui/icons-material/Close"
import PersonIcon from "@mui/icons-material/Person"
import CalendarTodayIcon from "@mui/icons-material/CalendarToday"
import BusinessIcon from "@mui/icons-material/Business"
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "react-toastify"
import axiosInstance from "@/app/api/utils/axiosInstance"
import type { ConfiguracionDispositivoMPE } from "@/app/(runna)/legajo-mesa/types/medida-api"
import { formatDateLocaleAR } from "@/utils/dateUtils"

// ============================================================================
// INTERFACES
// ============================================================================

interface ConfiguracionMPESectionProps {
  medidaId: number
  configuracion: ConfiguracionDispositivoMPE | null | undefined
  onConfigUpdated?: () => void
}

interface SubtipoDispositivo {
  id: number
  nombre: string
  capacidad_maxima: number | null
}

interface TipoDispositivo {
  id: number
  nombre: string
  categoria?: string
  subtipos?: SubtipoDispositivo[] // Nested subtipos from GET /api/tipos-dispositivo/?categoria=MPE
}

interface UpdateConfiguracionRequest {
  tipo_dispositivo_id: number
  subtipo_dispositivo_id?: number | null
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Fetch tipos de dispositivo filtered by MPE category
 * GET /api/tipos-dispositivo/?categoria=MPE
 */
const getTiposDispositivoMPE = async (): Promise<TipoDispositivo[]> => {
  const response = await axiosInstance.get<TipoDispositivo[]>('/tipos-dispositivo/', {
    params: { categoria: 'MPE' }
  })
  return response.data
}

/**
 * Update device configuration via intervention PATCH
 * PATCH /api/medidas/{medida_id}/intervenciones/{intervencion_id}/
 */
const updateConfiguracionMPE = async (
  medidaId: number,
  intervencionId: number,
  data: UpdateConfiguracionRequest
): Promise<any> => {
  const response = await axiosInstance.patch(
    `/medidas/${medidaId}/intervenciones/${intervencionId}/`,
    data
  )
  return response.data
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ConfiguracionMPESection: React.FC<ConfiguracionMPESectionProps> = ({
  medidaId,
  configuracion,
  onConfigUpdated,
}) => {
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedTipoId, setSelectedTipoId] = useState<number | null>(null)
  const [selectedSubtipoId, setSelectedSubtipoId] = useState<number | null>(null)

  // Fetch tipos dispositivo filtered by MPE category (includes nested subtipos)
  const {
    data: tiposDispositivo = [],
    isLoading: isLoadingTipos,
  } = useQuery({
    queryKey: ['tipos-dispositivo', 'MPE'],
    queryFn: getTiposDispositivoMPE,
  })

  // Get subtipos from the selected tipo's nested array (no separate API call needed)
  const selectedTipo = tiposDispositivo.find(t => t.id === selectedTipoId)
  const subtiposDispositivo = selectedTipo?.subtipos || []
  const isLoadingSubtipos = false // No separate loading since subtipos come with tipos

  // Mutation for updating configuration via intervention PATCH
  const updateMutation = useMutation({
    mutationFn: (data: UpdateConfiguracionRequest) => {
      if (!configuracion?.intervencion_id) {
        throw new Error('No hay intervención asociada para actualizar')
      }
      return updateConfiguracionMPE(medidaId, configuracion.intervencion_id, data)
    },
    onSuccess: () => {
      toast.success('Configuración de dispositivo actualizada')
      queryClient.invalidateQueries({ queryKey: ['medidas', 'detail', medidaId] })
      setDialogOpen(false)
      onConfigUpdated?.()
    },
    onError: (error: any) => {
      console.error('Error updating configuracion:', error)
      // Handle validation error when subtipo doesn't belong to tipo
      const errorDetail = error?.response?.data?.detail
      const errorSubtipo = error?.response?.data?.subtipo_dispositivo_id
      if (errorSubtipo) {
        toast.error(`Error de validación: ${errorSubtipo}`)
      } else if (errorDetail) {
        toast.error(errorDetail)
      } else {
        toast.error('Error al actualizar configuración de dispositivo')
      }
    },
  })

  // Initialize dialog state when opening
  useEffect(() => {
    if (dialogOpen && configuracion) {
      setSelectedTipoId(configuracion.tipo_dispositivo?.id || null)
      setSelectedSubtipoId(configuracion.subtipo_dispositivo?.id || null)
    } else if (dialogOpen && !configuracion) {
      setSelectedTipoId(null)
      setSelectedSubtipoId(null)
    }
  }, [dialogOpen, configuracion])

  // Reset subtipo when tipo changes
  const handleTipoChange = (tipoId: number | null) => {
    setSelectedTipoId(tipoId)
    setSelectedSubtipoId(null)
  }

  const handleSave = () => {
    // Tipo de dispositivo is required
    if (!selectedTipoId) {
      toast.error('Debe seleccionar un tipo de dispositivo')
      return
    }

    updateMutation.mutate({
      tipo_dispositivo_id: selectedTipoId,
      subtipo_dispositivo_id: selectedSubtipoId,
    })
  }

  // Check if we can save (tipo is required and intervencion must exist)
  const hasIntervencion = !!configuracion?.intervencion_id
  const canSave = !!selectedTipoId && !updateMutation.isPending && hasIntervencion

  const isConfigured = configuracion?.tipo_dispositivo !== null

  // Get display icon based on tipo
  const getDispositivoIcon = () => {
    const tipoNombre = configuracion?.tipo_dispositivo?.nombre?.toLowerCase() || ''
    if (tipoNombre.includes('familia') || tipoNombre.includes('acogimiento')) {
      return <FamilyRestroomIcon sx={{ fontSize: "1.2rem" }} />
    }
    return <BusinessIcon sx={{ fontSize: "1.2rem" }} />
  }

  return (
    <>
      <Box sx={{ p: 2.5, borderRadius: 2, bgcolor: "grey.50", border: "1px solid", borderColor: "grey.200" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.dark', display: "flex", alignItems: "center", gap: 1 }}>
            <HomeIcon sx={{ fontSize: "1.2rem" }} /> Configuración de Dispositivo MPE
          </Typography>
          {hasIntervencion && (
            <Button
              variant={isConfigured ? "outlined" : "contained"}
              color="primary"
              size="small"
              startIcon={isConfigured ? <EditIcon /> : <SettingsIcon />}
              onClick={() => setDialogOpen(true)}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.75rem",
              }}
            >
              {isConfigured ? "Editar" : "Configurar"}
            </Button>
          )}
        </Box>

        {isConfigured ? (
          <Grid container spacing={3}>
            {/* Tipo de Dispositivo */}
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: "background.paper" }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  {getDispositivoIcon()}
                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>
                    Tipo de Dispositivo
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {configuracion?.tipo_dispositivo?.nombre || "No especificado"}
                </Typography>
              </Paper>
            </Grid>

            {/* Subtipo / Institución / Familia */}
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: "background.paper" }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <BusinessIcon sx={{ fontSize: "1rem", color: "text.secondary" }} />
                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>
                    Institución / Familia
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {configuracion?.subtipo_dispositivo?.nombre || "No especificado"}
                  </Typography>
                  {configuracion?.subtipo_dispositivo?.capacidad_maxima && (
                    <Chip
                      label={`Cap. ${configuracion.subtipo_dispositivo.capacidad_maxima}`}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: "0.65rem", height: 20 }}
                    />
                  )}
                </Box>
              </Paper>
            </Grid>

            {/* Última configuración */}
            {configuracion?.fecha_configuracion && (
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pt: 1, borderTop: '1px solid', borderColor: 'grey.200' }}>
                  <Typography variant="caption" sx={{ color: "text.secondary", display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CalendarTodayIcon sx={{ fontSize: "0.9rem" }} />
                    Última configuración: {formatDateLocaleAR(configuracion.fecha_configuracion)}
                  </Typography>
                  {configuracion?.configurado_por && (
                    <Typography variant="caption" sx={{ color: "text.secondary", display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <PersonIcon sx={{ fontSize: "0.9rem" }} />
                      {configuracion.configurado_por.nombre}
                    </Typography>
                  )}
                </Box>
              </Grid>
            )}
          </Grid>
        ) : hasIntervencion ? (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            <Typography variant="body2">
              <strong>Sin configurar</strong> - Haga clic en &quot;Configurar&quot; para asignar un tipo de dispositivo y una institución/familia.
            </Typography>
          </Alert>
        ) : (
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            <Typography variant="body2">
              <strong>Sin intervención asociada</strong> - Debe registrar una intervención de apertura antes de configurar el dispositivo.
            </Typography>
          </Alert>
        )}
      </Box>

      {/* Edit/Configure Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => !updateMutation.isPending && setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HomeIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Configuración de Dispositivo MPE
            </Typography>
          </Box>
          <IconButton
            onClick={() => setDialogOpen(false)}
            disabled={updateMutation.isPending}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            {/* Tipo de Dispositivo Select - Required */}
            <FormControl fullWidth required error={!selectedTipoId && updateMutation.isError}>
              <InputLabel>Tipo de Dispositivo *</InputLabel>
              <Select
                value={selectedTipoId || ''}
                onChange={(e) => handleTipoChange(e.target.value ? Number(e.target.value) : null)}
                label="Tipo de Dispositivo *"
                disabled={updateMutation.isPending || isLoadingTipos}
              >
                {tiposDispositivo.map((tipo) => (
                  <MenuItem key={tipo.id} value={tipo.id}>
                    {tipo.nombre}
                  </MenuItem>
                ))}
              </Select>
              {isLoadingTipos && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <CircularProgress size={16} />
                  <Typography variant="caption" color="text.secondary">
                    Cargando tipos...
                  </Typography>
                </Box>
              )}
            </FormControl>

            {/* Subtipo / Institución Select - Optional but recommended */}
            <FormControl fullWidth>
              <InputLabel>Institución / Familia (Subtipo)</InputLabel>
              <Select
                value={selectedSubtipoId || ''}
                onChange={(e) => setSelectedSubtipoId(e.target.value ? Number(e.target.value) : null)}
                label="Institución / Familia (Subtipo)"
                disabled={!selectedTipoId || updateMutation.isPending || isLoadingSubtipos}
              >
                <MenuItem value="">
                  <em>Sin especificar</em>
                </MenuItem>
                {subtiposDispositivo.map((subtipo) => (
                  <MenuItem key={subtipo.id} value={subtipo.id}>
                    {subtipo.nombre}
                    {subtipo.capacidad_maxima && ` (Cap. ${subtipo.capacidad_maxima})`}
                  </MenuItem>
                ))}
              </Select>
              {isLoadingSubtipos && selectedTipoId && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <CircularProgress size={16} />
                  <Typography variant="caption" color="text.secondary">
                    Cargando instituciones/familias...
                  </Typography>
                </Box>
              )}
              {!selectedTipoId && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                  Seleccione primero un tipo de dispositivo
                </Typography>
              )}
              {selectedTipoId && !isLoadingSubtipos && subtiposDispositivo.length === 0 && (
                <Typography variant="caption" color="warning.main" sx={{ mt: 0.5 }}>
                  No hay subtipos disponibles para este tipo de dispositivo
                </Typography>
              )}
            </FormControl>

            {/* Warning if no intervencion */}
            {!hasIntervencion && (
              <Alert severity="error" sx={{ mt: 1 }}>
                <Typography variant="body2">
                  No se puede guardar: no hay intervención asociada a esta medida.
                </Typography>
              </Alert>
            )}

            {/* Info about current configuration */}
            {configuracion?.fecha_configuracion && (
              <Alert severity="info" sx={{ mt: 1 }}>
                <Typography variant="caption">
                  Configuración actual realizada el {formatDateLocaleAR(configuracion.fecha_configuracion)}
                  {configuracion.configurado_por && ` por ${configuracion.configurado_por.nombre}`}
                </Typography>
              </Alert>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => setDialogOpen(false)}
            disabled={updateMutation.isPending}
            color="inherit"
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!canSave}
            startIcon={updateMutation.isPending ? <CircularProgress size={18} color="inherit" /> : null}
          >
            {updateMutation.isPending ? "Guardando..." : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
