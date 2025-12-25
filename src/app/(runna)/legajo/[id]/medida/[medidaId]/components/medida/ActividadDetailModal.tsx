"use client"

import React, { useState } from 'react'
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
  Tabs,
  Tab,
  Alert
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import InfoIcon from '@mui/icons-material/Info'
import TimelineIcon from '@mui/icons-material/Timeline'
import HistoryIcon from '@mui/icons-material/History'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import type { TActividadPlanTrabajo } from '../../types/actividades'
import { getActorColor } from '../../types/actividades'

// Import custom hooks
import { useActividadPermissions } from '../../hooks/useActividadPermissions'
import { useActividadActions } from '../../hooks/useActividadActions'

// Import all components
import { EditableFields } from './actividad/EditableFields'
import { QuickLinksSection } from './actividad/QuickLinksSection'
import { CambiarEstadoSection } from './actividad/CambiarEstadoSection'
import { ReabrirButton } from './actividad/ReabrirButton'
import { TransferirDialog } from './actividad/TransferirDialog'
import { VisarButton } from './actividad/VisarButton'
import { UnifiedActivityTab } from './actividad/UnifiedActivityTab'
import { HistorialTab } from './actividad/HistorialTab'
import { TransferenciasTab } from './actividad/TransferenciasTab'

interface ActividadDetailModalProps {
  open: boolean
  onClose: () => void
  actividad: TActividadPlanTrabajo
  legajoId?: number
  medidaId?: number
  onUpdate?: () => void
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  )
}

export const ActividadDetailModal: React.FC<ActividadDetailModalProps> = ({
  open,
  onClose,
  actividad,
  legajoId,
  medidaId,
  onUpdate
}) => {
  const [currentTab, setCurrentTab] = useState(0)

  // Hooks for permissions and actions
  const permissions = useActividadPermissions(actividad)
  const actions = useActividadActions()

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue)
  }

  const handleSuccess = () => {
    if (onUpdate) onUpdate()
  }

  const getEstadoColor = (estado: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    const colors: Record<string, any> = {
      'PENDIENTE': 'warning',
      'EN_PROGRESO': 'info',
      'COMPLETADA': 'success',
      'CANCELADA': 'error',
      'VENCIDA': 'default',
      'PENDIENTE_VISADO': 'secondary',
      'VISADO_APROBADO': 'success',
      'VISADO_CON_OBSERVACION': 'warning'
    }
    return colors[estado] || 'default'
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2, maxHeight: '90vh' } }}
    >
      {/* Header */}
      <DialogTitle sx={{
        position: 'relative',
        pb: 2,
        borderBottom: '1px solid #e0e0e0'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight={600}>
              {actividad.subactividad}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
              {/* V3.0: Actor chip - shows team responsible */}
              <Chip
                label={actividad.actor_display}
                size="small"
                sx={{
                  backgroundColor: getActorColor(actividad.actor),
                  color: 'white',
                  fontSize: '0.7rem',
                  height: '20px',
                  fontWeight: 500
                }}
              />
              <Typography variant="caption" color="text.secondary">
                {actividad.tipo_actividad_info?.nombre || 'Actividad'}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Chip
              label={actividad.estado_display}
              color={getEstadoColor(actividad.estado)}
              size="small"
            />
            {actividad.esta_vencida && (
              <Chip
                label="VENCIDA"
                color="error"
                size="small"
              />
            )}
            <IconButton
              onClick={onClose}
              size="small"
              sx={{ color: 'grey.500' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab icon={<InfoIcon />} label="Detalle" iconPosition="start" />
          <Tab icon={<TimelineIcon />} label="Actividad" iconPosition="start" />
          <Tab icon={<HistoryIcon />} label="Historial" iconPosition="start" />
          <Tab icon={<SwapHorizIcon />} label="Transferencias" iconPosition="start" />
        </Tabs>
      </Box>

      {/* Content */}
      <DialogContent sx={{ px: 3, py: 2, minHeight: 400 }}>
        {/* Tab: Detalle */}
        <TabPanel value={currentTab} index={0}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Quick Links */}
            {legajoId && medidaId && (
              <QuickLinksSection
                actividad={actividad}
                legajoId={legajoId}
                medidaId={medidaId}
              />
            )}

            {/* Editable Fields */}
            <EditableFields
              actividad={actividad}
              canEdit={permissions.canEdit}
              onSave={async (updatedFields) => {
                // TODO: Implement update actividad fields API call
                console.log('Update fields:', updatedFields)
                return null
              }}
              loading={actions.loading}
              onSuccess={handleSuccess}
            />

            {/* Info Alert for locked states */}
            {permissions.isLocked && !permissions.canReopen && (
              <Alert severity="info">
                Esta actividad está cerrada. Solo usuarios con permisos de Jefe Zonal, Director o Administrador pueden reabrirla.
              </Alert>
            )}
          </Box>
        </TabPanel>

        {/* Tab: Actividad (Unified Comentarios & Adjuntos) */}
        <TabPanel value={currentTab} index={1}>
          <UnifiedActivityTab
            actividadId={actividad.id}
            canEdit={permissions.canAddActivity}
            onSuccess={handleSuccess}
          />
        </TabPanel>

        {/* Tab: Historial */}
        <TabPanel value={currentTab} index={2}>
          <HistorialTab
            actividadId={actividad.id}
            onGetHistorial={() => actions.getHistorial(actividad.id, {})}
            loading={actions.loading}
          />
        </TabPanel>

        {/* Tab: Transferencias */}
        <TabPanel value={currentTab} index={3}>
          <TransferenciasTab
            actividadId={actividad.id}
            onGetTransferencias={() => actions.getTransferencias(actividad.id)}
            loading={actions.loading}
          />
        </TabPanel>
      </DialogContent>

      {/* Actions */}
      <Divider />
      <DialogActions sx={{ px: 3, py: 2, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {/* State Change */}
          <CambiarEstadoSection
            actividad={actividad}
            canEdit={permissions.canEdit}
            onSuccess={handleSuccess}
            onCambiarEstado={(nuevoEstado, motivo) =>
              actions.cambiarEstado(actividad.id, { nuevo_estado: nuevoEstado, motivo })
            }
            loading={actions.loading}
          />

          {/* Legal Approval */}
          <VisarButton
            actividadId={actividad.id}
            canVisar={permissions.canVisar}
            onVisar={(aprobado, observaciones) =>
              actions.visar(actividad.id, { aprobado, observaciones })
            }
            loading={actions.loading}
            onSuccess={() => {
              handleSuccess()
              onClose()
            }}
          />

          {/* Transfer */}
          <TransferirDialog
            actividad={actividad}
            canTransfer={permissions.canTransfer}
            onTransferir={(equipoDestinoId, responsableNuevoId, motivo) =>
              actions.transferir(actividad.id, {
                equipo_destino: equipoDestinoId,
                responsable_nuevo: responsableNuevoId,
                motivo
              })
            }
            loading={actions.loading}
            onSuccess={handleSuccess}
          />

          {/* Reopen */}
          <ReabrirButton
            actividad={actividad}
            canReopen={permissions.canReopen}
            onReabrir={(motivo, nuevoEstado) =>
              actions.reabrir(actividad.id, { motivo, nuevo_estado: nuevoEstado })
            }
            loading={actions.loading}
            onSuccess={handleSuccess}
          />
        </Box>

        <Button onClick={onClose} variant="outlined">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  )
}
