"use client"

import React, { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Tooltip
} from '@mui/material'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import PersonRemoveIcon from '@mui/icons-material/PersonRemove'
import StarIcon from '@mui/icons-material/Star'
import type { TActividadPlanTrabajo } from '../../../types/actividades'

interface ResponsablesSectionProps {
  actividad: TActividadPlanTrabajo
  canEdit: boolean
  onAsignarResponsable: (usuarioId: number, esPrincipal: boolean) => Promise<any>
  onRemoverResponsable: (usuarioId: number) => Promise<any>
  loading: boolean
  onSuccess: () => void
}

// Mock usuarios - Replace with actual API call
const USUARIOS_DISPONIBLES = [
  { id: 1, username: 'juan.perez', nombre_completo: 'Juan Pérez', email: 'juan@example.com' },
  { id: 2, username: 'maria.gonzalez', nombre_completo: 'María González', email: 'maria@example.com' },
  { id: 3, username: 'carlos.rodriguez', nombre_completo: 'Carlos Rodríguez', email: 'carlos@example.com' },
  { id: 4, username: 'ana.martinez', nombre_completo: 'Ana Martínez', email: 'ana@example.com' },
  { id: 5, username: 'pedro.lopez', nombre_completo: 'Pedro López', email: 'pedro@example.com' },
]

export const ResponsablesSection: React.FC<ResponsablesSectionProps> = ({
  actividad,
  canEdit,
  onAsignarResponsable,
  onRemoverResponsable,
  loading,
  onSuccess
}) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedUsuario, setSelectedUsuario] = useState<number | null>(null)
  const [esPrincipal, setEsPrincipal] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const responsablePrincipal = USUARIOS_DISPONIBLES.find(u => u.id === actividad.responsable_principal)
  const responsablesSecundarios = actividad.responsables_secundarios?.map(id =>
    USUARIOS_DISPONIBLES.find(u => u.id === id)
  ).filter(Boolean) || []

  const handleOpenDialog = (principal: boolean = false) => {
    setDialogOpen(true)
    setEsPrincipal(principal)
    setSelectedUsuario(null)
    setError(null)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setSelectedUsuario(null)
    setError(null)
  }

  const handleAsignar = async () => {
    if (!selectedUsuario) {
      setError('Debe seleccionar un usuario')
      return
    }

    setSubmitting(true)
    setError(null)

    const result = await onAsignarResponsable(selectedUsuario, esPrincipal)

    if (result) {
      handleCloseDialog()
      onSuccess()
    } else {
      setError('Error al asignar responsable')
    }

    setSubmitting(false)
  }

  const handleRemover = async (usuarioId: number) => {
    if (!confirm('¿Está seguro de remover este responsable?')) return

    setSubmitting(true)
    const result = await onRemoverResponsable(usuarioId)

    if (result) {
      onSuccess()
    }

    setSubmitting(false)
  }

  const availableUsuarios = USUARIOS_DISPONIBLES.filter(u =>
    u.id !== actividad.responsable_principal &&
    !actividad.responsables_secundarios?.includes(u.id)
  )

  return (
    <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Responsables</Typography>
        {canEdit && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<PersonAddIcon />}
            onClick={() => handleOpenDialog(false)}
            disabled={loading || submitting}
          >
            Agregar
          </Button>
        )}
      </Box>

      {/* Responsable Principal */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Responsable Principal
        </Typography>
        {responsablePrincipal ? (
          <ListItem
            sx={{
              border: '1px solid',
              borderColor: 'primary.main',
              borderRadius: 1,
              bgcolor: 'primary.50',
              mb: 1
            }}
            secondaryAction={
              canEdit && (
                <Tooltip title="Cambiar responsable principal">
                  <IconButton
                    edge="end"
                    onClick={() => handleOpenDialog(true)}
                    disabled={loading || submitting}
                  >
                    <PersonAddIcon />
                  </IconButton>
                </Tooltip>
              )
            }
          >
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                {responsablePrincipal.nombre_completo.charAt(0)}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body1" fontWeight={600}>
                    {responsablePrincipal.nombre_completo}
                  </Typography>
                  <Chip
                    icon={<StarIcon />}
                    label="Principal"
                    color="primary"
                    size="small"
                  />
                </Box>
              }
              secondary={responsablePrincipal.email}
            />
          </ListItem>
        ) : (
          <Alert severity="warning">
            No hay responsable principal asignado
          </Alert>
        )}
      </Box>

      {/* Responsables Secundarios */}
      <Box>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Responsables Secundarios
        </Typography>
        {responsablesSecundarios.length > 0 ? (
          <List>
            {responsablesSecundarios.map((responsable: any) => (
              <ListItem
                key={responsable.id}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 1
                }}
                secondaryAction={
                  canEdit && (
                    <IconButton
                      edge="end"
                      onClick={() => handleRemover(responsable.id)}
                      disabled={loading || submitting}
                      color="error"
                    >
                      <PersonRemoveIcon />
                    </IconButton>
                  )
                }
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'secondary.main' }}>
                    {responsable.nombre_completo.charAt(0)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={responsable.nombre_completo}
                  secondary={responsable.email}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Alert severity="info">
            No hay responsables secundarios asignados
          </Alert>
        )}
      </Box>

      {/* Asignar Responsable Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {esPrincipal ? 'Cambiar Responsable Principal' : 'Agregar Responsable Secundario'}
        </DialogTitle>

        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {esPrincipal && (
              <Alert severity="warning">
                <Typography variant="body2">
                  <strong>Atención:</strong> Al cambiar el responsable principal, el actual será removido de esa función.
                </Typography>
              </Alert>
            )}

            <Typography variant="body2" color="text.secondary" gutterBottom>
              Seleccione un usuario:
            </Typography>

            <List sx={{ maxHeight: 300, overflow: 'auto' }}>
              {availableUsuarios.map((usuario) => (
                <ListItem
                  key={usuario.id}
                  button
                  selected={selectedUsuario === usuario.id}
                  onClick={() => setSelectedUsuario(usuario.id)}
                  sx={{
                    border: '1px solid',
                    borderColor: selectedUsuario === usuario.id ? 'primary.main' : 'divider',
                    borderRadius: 1,
                    mb: 1,
                    bgcolor: selectedUsuario === usuario.id ? 'primary.50' : 'background.paper'
                  }}
                >
                  <ListItemAvatar>
                    <Avatar>{usuario.nombre_completo.charAt(0)}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={usuario.nombre_completo}
                    secondary={usuario.email}
                  />
                </ListItem>
              ))}
            </List>

            {availableUsuarios.length === 0 && (
              <Alert severity="info">
                No hay usuarios disponibles para asignar
              </Alert>
            )}

            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleAsignar}
            variant="contained"
            disabled={submitting || !selectedUsuario}
            startIcon={submitting ? <CircularProgress size={20} /> : <PersonAddIcon />}
          >
            {submitting ? 'Asignando...' : 'Asignar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}
