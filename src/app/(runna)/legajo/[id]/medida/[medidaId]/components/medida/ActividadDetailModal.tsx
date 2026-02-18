"use client"

import React, { useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Chip,
  Alert
} from '@mui/material'
import InfoIcon from '@mui/icons-material/Info'
import TimelineIcon from '@mui/icons-material/Timeline'
import HistoryIcon from '@mui/icons-material/History'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import BaseModal from '@/components/shared/BaseModal'
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
import { VisarJzButton } from './actividad/VisarJzButton'
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
      'PENDIENTE_VISADO_JZ': 'warning', // JZ review pending
      'PENDIENTE_VISADO': 'secondary', // Legal review pending
      'VISADO_APROBADO': 'success',
      'VISADO_CON_OBSERVACION': 'warning'
    }
    return colors[estado] || 'default'
  }

  // Custom title with chips
  const customTitle = (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
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
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mr: 5 }}>
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
      </Box>
    </Box>
  )

  // Custom action buttons (left side)
  const leftActions = (
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

      {/* JZ Approval (before Legal) */}
      <VisarJzButton
        actividadId={actividad.id}
        canVisarJZ={permissions.canVisarJZ}
        onVisarJZ={(aprobado, observaciones) =>
          actions.visarJz(actividad.id, { aprobado, observaciones })
        }
        loading={actions.loading}
        onSuccess={() => {
          handleSuccess()
          onClose()
        }}
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
            zona_destino: equipoDestinoId,
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
  )

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title={customTitle}
      maxWidth="lg"
      minHeight={400}
      tabs={[
        { label: 'Detalle', icon: <InfoIcon fontSize="small" /> },
        { label: 'Actividad', icon: <TimelineIcon fontSize="small" /> },
        { label: 'Historial', icon: <HistoryIcon fontSize="small" /> },
        { label: 'Transferencias', icon: <SwapHorizIcon fontSize="small" /> }
      ]}
      activeTab={currentTab}
      onTabChange={handleTabChange}
      customLeftActions={leftActions}
      actions={[
        {
          label: 'Cerrar',
          onClick: onClose,
          variant: 'outlined'
        }
      ]}
    >
      {/* Tab: Detalle */}
      {currentTab === 0 && (
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
      )}

      {/* Tab: Actividad (Unified Comentarios & Adjuntos) */}
      {currentTab === 1 && (
        <UnifiedActivityTab
          actividadId={actividad.id}
          canEdit={permissions.canAddActivity}
          onSuccess={handleSuccess}
        />
      )}

      {/* Tab: Historial */}
      {currentTab === 2 && (
        <HistorialTab
          actividadId={actividad.id}
          onGetHistorial={() => actions.getHistorial(actividad.id, {})}
          loading={actions.loading}
        />
      )}

      {/* Tab: Transferencias */}
      {currentTab === 3 && (
        <TransferenciasTab
          actividadId={actividad.id}
          onGetTransferencias={() => actions.getTransferencias(actividad.id)}
          loading={actions.loading}
        />
      )}
    </BaseModal>
  )
}
