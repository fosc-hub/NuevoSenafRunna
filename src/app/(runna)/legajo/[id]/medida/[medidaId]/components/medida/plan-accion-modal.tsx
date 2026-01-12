"use client"

import React, { useState, useMemo } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Tabs,
  Tab,
  Box,
  IconButton,
  Typography
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { ActorTabContent } from './ActorTabContent'
import type { CreateActividadRequest, ActorEnum } from '../../types/actividades'
import { useActorVisibility } from '../../hooks/useActorVisibility'

interface PlanAccionModalProps {
  open: boolean
  onClose: () => void
  planTrabajoId: number
  onSuccess?: () => void
  /** MPI = Protección Integral, MPE = Protección Excepcional, MPJ = Penal Juvenil */
  tipoMedida?: 'MPI' | 'MPE' | 'MPJ'
  filterEtapa?: 'APERTURA' | 'PROCESO' | 'CESE'
}

export const PlanAccionModal: React.FC<PlanAccionModalProps> = ({
  open,
  onClose,
  planTrabajoId,
  onSuccess,
  tipoMedida = 'MPE',
  filterEtapa
}) => {
  const [activeTab, setActiveTab] = useState(0)
  const [formData, setFormData] = useState<Partial<CreateActividadRequest>>({})

  // Get actor visibility based on user permissions
  const { isActorAllowed, allowedActors, canSeeAllActors } = useActorVisibility()

  // All available actors
  const allActors: Array<{ value: ActorEnum; label: string }> = [
    { value: 'EQUIPO_TECNICO', label: 'Equipo técnico' },
    { value: 'EQUIPOS_RESIDENCIALES', label: 'Equipos residenciales' },
    { value: 'ADULTOS_INSTITUCION', label: 'Adultos responsables/Institución' },
    { value: 'EQUIPO_LEGAL', label: 'Equipo de Legales' }
  ]

  // Filter actors based on user permissions
  const actors = useMemo(() => {
    if (canSeeAllActors) {
      return allActors
    }
    return allActors.filter(actor => isActorAllowed(actor.value))
  }, [canSeeAllActors, isActorAllowed])

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
    setFormData({}) // Reset form when switching tabs
  }

  const handleFormChange = (updates: Partial<CreateActividadRequest>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '95vh'
        }
      }}
    >
      <DialogTitle sx={{
        textAlign: 'center',
        fontWeight: 600,
        fontSize: '1.5rem',
        position: 'relative',
        pb: 1,
        borderBottom: '1px solid #e0e0e0'
      }}>
        Plan de Acción {tipoMedida}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'grey.500',
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 4, py: 3, overflow: 'auto' }}>
        {actors.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No tiene permisos para crear actividades.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Contacte a su administrador si cree que esto es un error.
            </Typography>
          </Box>
        ) : (
          <>
            {/* Only show tabs if user has multiple actor options */}
            {actors.length > 1 && (
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                sx={{
                  mb: 3,
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontSize: '0.875rem'
                  }
                }}
              >
                {actors.map((actor) => (
                  <Tab key={actor.value} label={actor.label} />
                ))}
              </Tabs>
            )}

            {/* Show single actor label when only one is available */}
            {actors.length === 1 && (
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500, color: 'primary.main' }}>
                {actors[0].label}
              </Typography>
            )}

            <ActorTabContent
              actor={actors[activeTab]?.value || actors[0]?.value}
              planTrabajoId={planTrabajoId}
              formData={formData}
              onChange={handleFormChange}
              onClose={onClose}
              onSuccess={onSuccess}
              tipoMedida={tipoMedida}
              filterEtapa={filterEtapa}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
