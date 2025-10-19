"use client"

import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Tabs,
  Tab,
  Box,
  IconButton
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { ActorTabContent } from './ActorTabContent'
import type { CreateActividadRequest } from '../../types/actividades'

interface PlanAccionModalProps {
  open: boolean
  onClose: () => void
  planTrabajoId: number
  onSuccess?: () => void
}

export const PlanAccionModal: React.FC<PlanAccionModalProps> = ({
  open,
  onClose,
  planTrabajoId,
  onSuccess
}) => {
  const [activeTab, setActiveTab] = useState(0)
  const [formData, setFormData] = useState<Partial<CreateActividadRequest>>({})

  const actors = [
    { value: 'EQUIPO_TECNICO', label: 'Equipo técnico' },
    { value: 'EQUIPOS_RESIDENCIALES', label: 'Equipos residenciales' },
    { value: 'ADULTOS_INSTITUCION', label: 'Adultos responsables/Institución' },
    { value: 'EQUIPO_LEGAL', label: 'Equipo de Legales' }
  ]

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
        Plan de Acción MPE
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
          {actors.map((actor, index) => (
            <Tab key={actor.value} label={actor.label} />
          ))}
        </Tabs>

        <ActorTabContent
          actor={actors[activeTab].value}
          planTrabajoId={planTrabajoId}
          formData={formData}
          onChange={handleFormChange}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      </DialogContent>
    </Dialog>
  )
}
