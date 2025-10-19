"use client"

import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Link
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import PersonIcon from '@mui/icons-material/Person'
import GroupIcon from '@mui/icons-material/Group'
import EventIcon from '@mui/icons-material/Event'
import DescriptionIcon from '@mui/icons-material/Description'
import type { TActividadPlanTrabajo } from '../../types/actividades'

interface ActividadDetailModalProps {
  open: boolean
  onClose: () => void
  actividad: TActividadPlanTrabajo
  onUpdate?: () => void
}

export const ActividadDetailModal: React.FC<ActividadDetailModalProps> = ({
  open,
  onClose,
  actividad,
  onUpdate
}) => {
  const getEstadoColor = (estado: string) => {
    const colors: Record<string, any> = {
      'PENDIENTE': { backgroundColor: '#ff9800', color: 'white' },
      'EN_PROGRESO': { backgroundColor: '#2196f3', color: 'white' },
      'REALIZADA': { backgroundColor: '#4caf50', color: 'white' },
      'CANCELADA': { backgroundColor: '#f44336', color: 'white' },
      'VENCIDA': { backgroundColor: '#9e9e9e', color: 'white' }
    }
    return colors[estado] || { backgroundColor: '#9e9e9e', color: 'white' }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{
        textAlign: 'center',
        fontWeight: 600,
        fontSize: '1.5rem',
        position: 'relative',
        pb: 1,
        borderBottom: '1px solid #e0e0e0'
      }}>
        Detalle de Actividad
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8, color: 'grey.500' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 4, py: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Header with Estado and Dias Restantes */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <Chip
              label={actividad.estado_display}
              sx={{
                ...getEstadoColor(actividad.estado),
                fontWeight: 500,
                fontSize: '0.875rem'
              }}
            />
            <Chip
              label={`${actividad.dias_restantes} días restantes`}
              color={actividad.esta_vencida ? 'error' : 'default'}
            />
            {actividad.es_borrador && (
              <Chip
                label="BORRADOR"
                variant="outlined"
                color="warning"
              />
            )}
            {actividad.origen !== 'MANUAL' && (
              <Chip
                label={`Origen: ${actividad.origen_display}`}
                variant="outlined"
                color="info"
              />
            )}
          </Box>

          <Divider />

          {/* Tipo y Subactividad */}
          <Box>
            <Typography variant="h6" gutterBottom>
              {actividad.tipo_actividad_info.nombre}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {actividad.subactividad}
            </Typography>
            <Typography variant="caption" color="primary">
              {actividad.actor_display}
            </Typography>
          </Box>

          {/* Descripción */}
          {actividad.descripcion && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                <DescriptionIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                Descripción
              </Typography>
              <Typography variant="body2">{actividad.descripcion}</Typography>
            </Box>
          )}

          {/* Fechas */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  <EventIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Fecha Planificación
                </Typography>
                <Typography variant="body2">
                  {new Date(actividad.fecha_planificacion).toLocaleDateString('es-ES', {
                    dateStyle: 'medium'
                  })}
                </Typography>
              </Box>
            </Grid>
            {actividad.fecha_inicio_real && (
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Fecha Inicio Real</Typography>
                  <Typography variant="body2">
                    {new Date(actividad.fecha_inicio_real).toLocaleDateString('es-ES', {
                      dateStyle: 'medium'
                    })}
                  </Typography>
                </Box>
              </Grid>
            )}
            {actividad.fecha_finalizacion_real && (
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Fecha Finalización Real</Typography>
                  <Typography variant="body2">
                    {new Date(actividad.fecha_finalizacion_real).toLocaleDateString('es-ES', {
                      dateStyle: 'medium'
                    })}
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>

          {/* Responsables */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              <PersonIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
              Responsable Principal
            </Typography>
            <Typography variant="body2">{actividad.responsable_principal_info.full_name}</Typography>

            {actividad.responsables_secundarios_info && actividad.responsables_secundarios_info.length > 0 && (
              <>
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                  <GroupIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Responsables Secundarios
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {actividad.responsables_secundarios_info.map(resp => (
                    <Chip
                      key={resp.id}
                      label={resp.full_name}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </>
            )}
          </Box>

          {/* Referentes Externos */}
          {actividad.referentes_externos && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>Referentes Externos</Typography>
              <Typography variant="body2">{actividad.referentes_externos}</Typography>
            </Box>
          )}

          {/* Adjuntos */}
          {actividad.adjuntos && actividad.adjuntos.length > 0 && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                <AttachFileIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                Adjuntos ({actividad.adjuntos.length})
              </Typography>
              <List dense>
                {actividad.adjuntos.map((adjunto) => (
                  <ListItem key={adjunto.id}>
                    <ListItemIcon>
                      <AttachFileIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Link href={adjunto.archivo_url} target="_blank" rel="noopener">
                          {adjunto.archivo.split('/').pop()}
                        </Link>
                      }
                      secondary={`${adjunto.tipo_adjunto_display} - ${new Date(adjunto.fecha_carga).toLocaleDateString('es-ES')}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Cancelación */}
          {actividad.estado === 'CANCELADA' && actividad.motivo_cancelacion && (
            <Box sx={{ bgcolor: 'error.light', p: 2, borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>Motivo de Cancelación</Typography>
              <Typography variant="body2">{actividad.motivo_cancelacion}</Typography>
              <Typography variant="caption" color="text.secondary">
                Cancelada el {new Date(actividad.fecha_cancelacion!).toLocaleDateString('es-ES')}
              </Typography>
            </Box>
          )}

          {/* Auditoría */}
          <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Creada por {actividad.usuario_creacion_info.full_name} el{' '}
              {new Date(actividad.fecha_creacion).toLocaleDateString('es-ES', {
                dateStyle: 'medium',
                timeStyle: 'short'
              })}
            </Typography>
            {actividad.fecha_modificacion !== actividad.fecha_creacion && (
              <Typography variant="caption" color="text.secondary" display="block">
                Última modificación: {new Date(actividad.fecha_modificacion).toLocaleDateString('es-ES', {
                  dateStyle: 'medium',
                  timeStyle: 'short'
                })}
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 4, pb: 3, pt: 2 }}>
        <Button onClick={onClose} variant="contained" fullWidth>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  )
}
